package com.substring.auth.app.auth.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.substring.auth.app.auth.payload.CertificateTemplateDto;
import com.substring.auth.app.auth.services.impl.CertificateTemplateServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
public class CertificateTemplateController {

	private final CertificateTemplateServiceImpl service;

	@PostMapping
	public ResponseEntity<String> createTemplate(@RequestBody CertificateTemplateDto dto) {

		service.createTemplate(dto);

		return ResponseEntity.ok("Template saved successfully");
	}
}