package com.substring.auth.app.auth.controllers;


import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.substring.auth.app.auth.entities.CertificateTemplate;
import com.substring.auth.app.auth.payload.CertificateTemplateDto;
import com.substring.auth.app.auth.repositories.CertificateTemplateRepository;
import com.substring.auth.app.auth.services.impl.CertificateTemplateServiceImpl;
import com.substring.auth.app.auth.services.impl.FileUploadService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CertificateTemplateController {

    private final CertificateTemplateServiceImpl service;
    private final CertificateTemplateRepository templateRepository;
    private final FileUploadService fileUploadService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createTemplate(
            @RequestPart("data") String data,
            @RequestPart("file") MultipartFile file) {

        try {
            ObjectMapper mapper = new ObjectMapper();
            CertificateTemplateDto dto = mapper.readValue(data, CertificateTemplateDto.class);

            // 🔥 Upload to Cloudinary
            String imageUrl = fileUploadService.uploadFile(file);

            dto.setBackgroundImage(imageUrl);

            service.createTemplate(dto);

            return ResponseEntity.ok("Template created successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<CertificateTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificateTemplate> getTemplate(@PathVariable UUID id) {
        return ResponseEntity.ok(
                templateRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Template not found"))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTemplate(@PathVariable UUID id) {
        templateRepository.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}