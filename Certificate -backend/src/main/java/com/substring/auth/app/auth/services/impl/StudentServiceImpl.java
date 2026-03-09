package com.substring.auth.app.auth.services.impl;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.substring.auth.app.auth.entities.Student;
import com.substring.auth.app.auth.entities.User;
import com.substring.auth.app.auth.payload.StudentDto;
import com.substring.auth.app.auth.repositories.StudentRepository;
import com.substring.auth.app.auth.repositories.UserRepository;
import com.substring.auth.app.auth.services.StudentService;
import com.substring.auth.app.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

	private final StudentRepository studentRepository;
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;

	// get logged institute
	private User getCurrentUser() {

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		String email = auth.getName();

		return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	// enrollment number generator
	private int getNextEnrollmentNumber(User user) {

		Optional<Student> lastStudent = studentRepository.findTopByUserOrderByEnrollmentNoDesc(user);

		int next = 1;

		if (lastStudent.isPresent()) {

			String last = lastStudent.get().getEnrollmentNo();

			String[] parts = last.split("/");

			if (parts.length >= 3) {
				next = Integer.parseInt(parts[2]) + 1;
			}
		}

		return next;
	}

	private StudentDto convertToDto(Student student) {
		return modelMapper.map(student, StudentDto.class);
	}

	// create student
	@Override
	public StudentDto createStudent(StudentDto dto) {

		User user = getCurrentUser();

		Student student = modelMapper.map(dto, Student.class);

		int next = getNextEnrollmentNumber(user);

		student.setEnrollmentNo("MH/2327/" + next);

		student.setUser(user);

		Student saved = studentRepository.save(student);

		return convertToDto(saved);
	}

	// get student by id
	@Override
	public StudentDto getStudentById(UUID studentId) {

		User user = getCurrentUser();

		Student student = studentRepository.findByIdAndUser(studentId, user)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		return convertToDto(student);
	}

	// get student by enrollment
	@Override
	public StudentDto getStudentByEnrollmentNo(String enrollmentNo) {

		User user = getCurrentUser();

		Student student = studentRepository.findByEnrollmentNoAndUser(enrollmentNo, user)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		return convertToDto(student);
	}

	// get student by email
	@Override
	public StudentDto getStudentByEmail(String email) {

		User user = getCurrentUser();

		Student student = studentRepository.findByEmailAndUser(email, user)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		return convertToDto(student);
	}

	// update student
	@Override
	public StudentDto updateStudent(UUID studentId, StudentDto dto) {

		User user = getCurrentUser();

		Student student = studentRepository.findByIdAndUser(studentId, user)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		student.setFullName(dto.getFullName());
		student.setCourseName(dto.getCourseName());
		student.setStatus(dto.getStatus());
		student.setEmail(dto.getEmail());
		student.setMobileNumber(dto.getMobileNumber());
		student.setCity(dto.getCity());
		student.setState(dto.getState());
		student.setDistrict(dto.getDistrict());
		student.setAddress(dto.getAddress());
		student.setPincode(dto.getPincode());

		Student updated = studentRepository.save(student);

		return convertToDto(updated);
	}

	// delete student
	@Override
	public void deleteStudent(UUID studentId) {

		User user = getCurrentUser();

		Student student = studentRepository.findByIdAndUser(studentId, user)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found"));

		studentRepository.delete(student);
	}

	// get students with pagination
	@Override
	public List<StudentDto> getStudents(int page, int size) {

		User user = getCurrentUser();

		Pageable pageable = PageRequest.of(page, size);

		Page<Student> studentPage = studentRepository.findByUser(user, pageable);

		return studentPage.stream().map(this::convertToDto).toList();
	}

	// search student
	@Override
	public List<StudentDto> searchStudentsByName(String name, int page, int size) {

		User user = getCurrentUser();

		Pageable pageable = PageRequest.of(page, size);

		Page<Student> result = studentRepository.findByUserAndFullNameContainingIgnoreCase(user, name, pageable);

		return result.stream().map(this::convertToDto).toList();
	}

	// CSV bulk upload
	@Override
	public void processCSV(MultipartFile file) {

		User user = getCurrentUser();

		List<Student> students = new ArrayList<>();

		int counter = getNextEnrollmentNumber(user);

		try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {

			reader.readLine(); // skip header

			String line;

			while ((line = reader.readLine()) != null) {

				String[] data = line.split(",");

				if (data.length < 8)
					continue;

				Student student = new Student();

				student.setIdentificationNumber(data[0]);
				student.setFullName(data[1]);
				student.setCourseName(data[2]);
				student.setStatus(data[3]);
				student.setEmail(data[4]);
				student.setMobileNumber(data[5]);
				student.setCity(data[6]);
				student.setState(data[7]);

				student.setEnrollmentNo("MH/2327/" + counter++);

				student.setUser(user);

				students.add(student);
			}

			studentRepository.saveAll(students);

		} catch (Exception e) {

			throw new RuntimeException("CSV upload failed: " + e.getMessage());
		}
	}
	
	
	
	
	
	

// upload form excel file(XLSX,XLS)	
	private void processExcel(MultipartFile file) {

	    User user = getCurrentUser();

	    List<Student> students = new ArrayList<>();

	    int counter = getNextEnrollmentNumber(user);

	    try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {

	        Sheet sheet = workbook.getSheetAt(0);

	        DataFormatter formatter = new DataFormatter();

	        for (int i = 1; i <= sheet.getLastRowNum(); i++) {

	            Row row = sheet.getRow(i);

	            if (row == null) continue;

	            Student student = new Student();

	            student.setIdentificationNumber(formatter.formatCellValue(row.getCell(0)));
	            student.setFullName(formatter.formatCellValue(row.getCell(1)));
	            student.setCourseName(formatter.formatCellValue(row.getCell(2)));
	            student.setStatus(formatter.formatCellValue(row.getCell(3)));
	            student.setEmail(formatter.formatCellValue(row.getCell(4)));
	            student.setMobileNumber(formatter.formatCellValue(row.getCell(5)));
	            student.setCity(formatter.formatCellValue(row.getCell(6)));
	            student.setState(formatter.formatCellValue(row.getCell(7)));

	            student.setEnrollmentNo("MH/2327/" + counter++);

	            student.setUser(user);

	            students.add(student);
	        }

	        studentRepository.saveAll(students);

	    } catch (Exception e) {
	        throw new RuntimeException("Excel upload failed: " + e.getMessage());
	    }
	}
	
	
	
	
	@Override
	public void uploadStudents(MultipartFile file) {

	    String filename = file.getOriginalFilename().toLowerCase();

	    if (filename.endsWith(".csv")) {
	        processCSV(file);
	    } 
	    else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
	        processExcel(file);
	    }
	}
	
	
	
	
	
	// export to excel

	@Override
	public ByteArrayInputStream exportStudentsToExcel() {

		User user = getCurrentUser();

		List<Student> students = studentRepository.findByUser(user);

		try (Workbook workbook = new XSSFWorkbook()) {

			Sheet sheet = workbook.createSheet("Students");

			Row header = sheet.createRow(0);

			header.createCell(0).setCellValue("Enrollment No");
			header.createCell(1).setCellValue("Name");
			header.createCell(2).setCellValue("Course");
			header.createCell(3).setCellValue("Email");
			header.createCell(4).setCellValue("Mobile");

			int rowNum = 1;

			for (Student s : students) {

				Row row = sheet.createRow(rowNum++);

				row.createCell(0).setCellValue(s.getEnrollmentNo());
				row.createCell(1).setCellValue(s.getFullName());
				row.createCell(2).setCellValue(s.getCourseName());
				row.createCell(3).setCellValue(s.getEmail());
				row.createCell(4).setCellValue(s.getMobileNumber());
			}

			ByteArrayOutputStream out = new ByteArrayOutputStream();
			workbook.write(out);

			return new ByteArrayInputStream(out.toByteArray());

		} catch (Exception e) {

			throw new RuntimeException("Excel export failed");
		}
	}

	
	
	// export to PDF (placeholder)
//	@Override
//	public byte[] exportStudentsToPdf() {
//
//	    User user = getCurrentUser();
//
//	    List<Student> students = studentRepository.findByUser(user);
//
//	    try {
//
//	        ByteArrayOutputStream out = new ByteArrayOutputStream();
//
//	        PdfWriter writer = new PdfWriter(out);
//	        PdfDocument pdf = new PdfDocument(writer);
//	        Document document = new Document(pdf);
//
//	        Table table = new Table(5);
//
//	        table.addCell("Enrollment No");
//	        table.addCell("Name");
//	        table.addCell("Course");
//	        table.addCell("Email");
//	        table.addCell("Mobile");
//
//	        for (Student s : students) {
//
//	            table.addCell(s.getEnrollmentNo());
//	            table.addCell(s.getFullName());
//	            table.addCell(s.getCourseName());
//	            table.addCell(s.getEmail());
//	            table.addCell(s.getMobileNumber());
//	        }
//
//	        document.add(table);
//
//	        document.close();
//
//	        return out.toByteArray();
//
//	    } catch (Exception e) {
//
//	        throw new RuntimeException("PDF export failed");
//	    }
//	}
//	
	
	@Override
	public byte[] exportStudentsToPdf() {

	    User user = getCurrentUser();

	    List<Student> students = studentRepository.findByUser(user);

	    try {

	        ByteArrayOutputStream out = new ByteArrayOutputStream();

	        PdfWriter writer = new PdfWriter(out);
	        PdfDocument pdf = new PdfDocument(writer);
	        Document document = new Document(pdf);

	        // ===== HEADER (FIXED TEXT) =====

	        document.add(new Paragraph("Govt. of India Reg. under The Ministry of Corporate Affairs")
	                .setTextAlignment(TextAlignment.CENTER));

	        document.add(new Paragraph("An ISO 21001:2018 & ISO 9001:2015 Certified Organization")
	                .setTextAlignment(TextAlignment.CENTER));

	        document.add(new Paragraph("ISEIT INDIA FEDERATION")
	                .setBold()
	                .setTextAlignment(TextAlignment.CENTER));

	        document.add(new Paragraph("INSTITUTE OF SKILL EDUCATION AND INFORMATION TECHNOLOGY")
	                .setBold()
	                .setTextAlignment(TextAlignment.CENTER));

	        document.add(new Paragraph("\n"));

	        // ===== CENTER INFO FROM DATABASE =====

	        Paragraph centerInfo = new Paragraph(
	                user.getEmail() + "   " + user.getName()
	        )
	        .setBold()
	        .setTextAlignment(TextAlignment.CENTER);

	        document.add(centerInfo);

	        document.add(new Paragraph("\n"));

	        // ===== TABLE =====

	        float[] columnWidths = {1, 3, 4, 3, 3, 3, 3};

	        Table table = new Table(UnitValue.createPercentArray(columnWidths))
	                .useAllAvailableWidth();

	        String[] headers = {
	                "Sr. No.",
	                "Enrollment No.",
	                "Student Full Name",
	                "Course Name",
	                "Course Status",
	                "Date of Completion",
	                "Certificate No."
	        };

	        for (String header : headers) {

	            Cell headerCell = new Cell()
	                    .add(new Paragraph(header).setBold())
	                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
	                    .setTextAlignment(TextAlignment.CENTER);

	            table.addHeaderCell(headerCell);
	        }

	        int sr = 1;

	        for (Student s : students) {

	            table.addCell(new Cell()
	                    .add(new Paragraph(String.valueOf(sr++)))
	                    .setTextAlignment(TextAlignment.CENTER));

	            table.addCell(new Cell()
	                    .add(new Paragraph(s.getEnrollmentNo()))
	                    .setTextAlignment(TextAlignment.CENTER));

	            table.addCell(new Cell()
	                    .add(new Paragraph(s.getFullName())));

	            table.addCell(new Cell()
	                    .add(new Paragraph(s.getCourseName())));

	            table.addCell(new Cell()
	                    .add(new Paragraph(s.getStatus()))
	                    .setTextAlignment(TextAlignment.CENTER));

	            table.addCell(new Cell()
	                    .add(new Paragraph(
	                            s.getCompletionDate() != null
	                                    ? s.getCompletionDate().toString()
	                                    : ""
	                    ))
	                    .setTextAlignment(TextAlignment.CENTER));

	            table.addCell(new Cell()
	                    .add(new Paragraph(""))
	                    .setTextAlignment(TextAlignment.CENTER));
	        }

	        table.setMarginTop(10);

	        document.add(table);

	        document.close();

	        return out.toByteArray();

	    } catch (Exception e) {

	        throw new RuntimeException("PDF export failed: " + e.getMessage());
	    }
	}
	
	
	
	
	
	
	
	
	@Override
	public List<StudentDto> searchStudentsByName(String name) {
		// implemented: return all matches for current user
		User user = getCurrentUser();
		List<Student> students = studentRepository.findByUserAndFullNameContainingIgnoreCase(user, name);
		return students.stream().map(this::convertToDto).toList();
	}

}