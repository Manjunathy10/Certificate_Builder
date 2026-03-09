package com.substring.auth.app.auth.services;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.substring.auth.app.auth.payload.StudentDto;

public interface StudentService {
	
	  // create student
    StudentDto createStudent(StudentDto studentDto);

    // get student by id
    StudentDto getStudentById(UUID studentId);

    // get student by enrollment number
    StudentDto getStudentByEnrollmentNo(String enrollmentNo);

    // get student by email
    StudentDto getStudentByEmail(String email);

    // update student
    StudentDto updateStudent(UUID studentId, StudentDto studentDto);

    // delete student
    void deleteStudent(UUID studentId);

    // pagination-enabled get students
    List<StudentDto> getStudents(int page, int size);

    // search student by name (legacy)
    List<StudentDto> searchStudentsByName(String name);

    // pagination-enabled search
    List<StudentDto> searchStudentsByName(String name, int page, int size);

//    // CSV bulk upload
//    void uploadStudentsFromCsv(MultipartFile file);
    
    
    byte[] exportStudentsToPdf();

    ByteArrayInputStream exportStudentsToExcel();

	void processCSV(MultipartFile file);

	void uploadStudents(MultipartFile file);
    
    


}