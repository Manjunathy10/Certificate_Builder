package com.substring.auth.app.auth.controllers;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.substring.auth.app.auth.entities.Student;
import com.substring.auth.app.auth.repositories.StudentRepository;
import com.substring.auth.app.auth.services.impl.CertificateGeneratorServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/certificates")
@RequiredArgsConstructor
public class CertificateController {

	private final CertificateGeneratorServiceImpl generatorService;
	private final StudentRepository studentRepository;

	@GetMapping("/generate")
	public ResponseEntity<byte[]> generateCertificate(
	        @RequestParam UUID studentId,
	        @RequestParam UUID templateId) {

	    byte[] pdfBytes = generatorService.generateCertificate(studentId, templateId);

	    // 🔥 student name fetch kar (for filename)
	    Student student = studentRepository.findById(studentId)
	            .orElseThrow(() -> new RuntimeException("Student not found"));

	    String fileName = student.getFullName().replace(" ", "_") + "_Certificate.pdf";

	    return ResponseEntity.ok()
	            .header("Content-Disposition", "attachment; filename=" + fileName)
	            .header("Content-Type", "application/pdf")
	            .body(pdfBytes);
	}

}
