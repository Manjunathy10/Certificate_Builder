package com.substring.auth.app.auth.controllers;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.substring.auth.app.auth.services.impl.CertificateGeneratorServiceImpl;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/certificates")
@RequiredArgsConstructor
public class CertificateController {

	private final CertificateGeneratorServiceImpl generatorService;

	@GetMapping("/generate")
	public ResponseEntity<byte[]> generateCertificate(@RequestParam UUID studentId, @RequestParam UUID templateId) {

		byte[] pdf = generatorService.generateCertificate(studentId, templateId);

		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=certificate.pdf")
				.contentType(MediaType.APPLICATION_PDF).body(pdf);
	}

}
