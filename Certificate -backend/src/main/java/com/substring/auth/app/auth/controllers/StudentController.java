package com.substring.auth.app.auth.controllers;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.substring.auth.app.auth.payload.StudentDto;
import com.substring.auth.app.auth.services.StudentService;

import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "/api/v1/students", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Validated
public class StudentController {

	private static final Logger log = LoggerFactory.getLogger(StudentController.class);

	private final StudentService studentService;

	@PostConstruct
	public void init() {
		log.info("StudentController initialized");
	}

	@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<StudentDto> createStudent(@Valid @RequestBody StudentDto studentDto) {

		StudentDto created = studentService.createStudent(studentDto);

		URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.getId())
				.toUri();

		return ResponseEntity.created(location).body(created);
	}

	@GetMapping
	public ResponseEntity<List<StudentDto>> getStudents(@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "50") @Min(1) int size) {

		return ResponseEntity.ok(studentService.getStudents(page, size));
	}

	@GetMapping("/{studentId}")
	public ResponseEntity<StudentDto> getStudentById(@PathVariable UUID studentId) {

		return ResponseEntity.ok(studentService.getStudentById(studentId));
	}

	@GetMapping("/enrollment/{enrollmentNo}")
	public ResponseEntity<StudentDto> getStudentByEnrollmentNo(@PathVariable @NotBlank String enrollmentNo) {

		return ResponseEntity.ok(studentService.getStudentByEnrollmentNo(enrollmentNo));
	}

	@GetMapping("/by-email")
	public ResponseEntity<StudentDto> getStudentByEmail(@RequestParam("email") @NotBlank String email) {

		return ResponseEntity.ok(studentService.getStudentByEmail(email));
	}

	@PutMapping(path = "/{studentId}", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<StudentDto> updateStudent(@PathVariable UUID studentId,
			@Valid @RequestBody StudentDto studentDto) {

		return ResponseEntity.ok(studentService.updateStudent(studentId, studentDto));
	}

	@DeleteMapping("/{studentId}")
	public ResponseEntity<Void> deleteStudent(@PathVariable UUID studentId) {

		studentService.deleteStudent(studentId);

		return ResponseEntity.noContent().build();
	}

	@GetMapping("/search")
	public ResponseEntity<List<StudentDto>> searchStudents(@RequestParam("name") @NotBlank String name,
			@RequestParam(defaultValue = "0") @Min(0) int page, @RequestParam(defaultValue = "50") @Min(1) int size) {

		return ResponseEntity.ok(studentService.searchStudentsByName(name, page, size));
	}

//	@PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//	public ResponseEntity<String> uploadStudentsFromCsv(@RequestParam("file") MultipartFile file) {
//
//		if (file == null || file.isEmpty()) {
//			throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Empty file uploaded");
//		}
//
//		String filename = StringUtils.cleanPath(file.getOriginalFilename());
//
//		if (!filename.endsWith(".csv")) {
//			throw new ResponseStatusException(org.springframework.http.HttpStatus.UNSUPPORTED_MEDIA_TYPE,
//					"Only CSV files are supported");
//		}
//
//		studentService.uploadStudentsFromCsv(file);
//
//		return ResponseEntity.accepted().body("Students uploaded successfully");
//	}
	
	
	
	
	
	@PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> uploadStudents(@RequestParam("file") MultipartFile file) {

	    if (file == null || file.isEmpty()) {
	        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empty file uploaded");
	    }

	    String filename = StringUtils.cleanPath(file.getOriginalFilename()).toLowerCase();

	    if (!(filename.endsWith(".csv") || filename.endsWith(".xlsx") || filename.endsWith(".xls"))) {
	        throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
	                "Only CSV or Excel files are supported");
	    }

	    studentService.uploadStudents(file);

	    return ResponseEntity.accepted().body("Students uploaded successfully");
	}
	
	
	
	
	
	
	
	// export students to excel
	@GetMapping("/export/excel")
	public ResponseEntity<Resource> exportStudentsExcel() {

	    ByteArrayInputStream stream = studentService.exportStudentsToExcel();
	    InputStreamResource file = new InputStreamResource(stream);

	    return ResponseEntity.ok()
	            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students.xlsx")
	            .contentType(MediaType.APPLICATION_OCTET_STREAM)
	            .body(file);
	}
	
	//export students to pdf
	@GetMapping("/export/pdf")
	public ResponseEntity<byte[]> exportStudentsPdf() {

	    byte[] pdf = studentService.exportStudentsToPdf();
	    return ResponseEntity.ok()
	            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students.pdf")
	            .contentType(MediaType.APPLICATION_PDF)
	            .body(pdf);
	}
	
	

}