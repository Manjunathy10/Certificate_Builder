package com.substring.auth.app.auth.services.impl;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

	// generate enrollment number
	private int getNextEnrollmentNumber(User user) {

		Optional<Student> lastStudent = studentRepository.findTopByUserOrderByEnrollmentNoDesc(user);

		int nextNumber = 1;

		if (lastStudent.isPresent()) {

			String last = lastStudent.get().getEnrollmentNo();

			String num = last.split("/")[2];

			nextNumber = Integer.parseInt(num) + 1;
		}

		return nextNumber;
	}

	private StudentDto convertToDto(Student student) {
		return modelMapper.map(student, StudentDto.class);
	}

	// create student
	@Override
	public StudentDto createStudent(StudentDto dto) {

		User user = getCurrentUser();

		Student student = modelMapper.map(dto, Student.class);

		int nextNumber = getNextEnrollmentNumber(user);

		student.setEnrollmentNo("MH/2327/" + nextNumber);

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

	// get students
	@Override
	public List<StudentDto> getStudents() {

		User user = getCurrentUser();

		return studentRepository.findByUser(user).stream().map(this::convertToDto).toList();
	}

	// search student
	@Override
	public List<StudentDto> searchStudentsByName(String name) {

		User user = getCurrentUser();

		return studentRepository.findByUserAndFullNameContainingIgnoreCase(user, name).stream().map(this::convertToDto)
				.toList();
	}

	// CSV upload
	@Override
	public void uploadStudentsFromCsv(MultipartFile file) {

		User user = getCurrentUser();

		List<Student> students = new ArrayList<>();

		int counter = getNextEnrollmentNumber(user);

		try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {

			List<String> rows = reader.lines().skip(1).toList();

			for (String row : rows) {

				String[] data = row.split(",");

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
}