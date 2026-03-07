package com.substring.auth.app.auth.services;

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

    // get all students of institute
    List<StudentDto> getStudents();

    // search student by name
    List<StudentDto> searchStudentsByName(String name);

    // CSV bulk upload
    void uploadStudentsFromCsv(MultipartFile file);


}
