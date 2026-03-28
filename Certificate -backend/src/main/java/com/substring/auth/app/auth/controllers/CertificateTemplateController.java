package com.substring.auth.app.auth.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // ==============================
    // ✅ CREATE
    // ==============================
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createTemplate(
            @RequestPart("data") String data,
            @RequestPart("file") MultipartFile file) {

        try {
            ObjectMapper mapper = new ObjectMapper();
            CertificateTemplateDto dto = mapper.readValue(data, CertificateTemplateDto.class);

            String imageUrl = fileUploadService.uploadFile(file);
            dto.setBackgroundImage(imageUrl);

            return ResponseEntity.ok(service.createTemplate(dto));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // ==============================
    // ✅ GET ALL
    // ==============================
    @GetMapping
    public ResponseEntity<List<CertificateTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateRepository.findAll());
    }

    // ==============================
    // ✅ GET BY ID
    // ==============================
    @GetMapping("/{id}")
    public ResponseEntity<CertificateTemplate> getTemplate(@PathVariable UUID id) {
        return ResponseEntity.ok(
                templateRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Template not found"))
        );
    }

    // ==============================
    // 🔥 PUT UPDATE
    // ==============================
    @PutMapping("/{id}")
    public ResponseEntity<CertificateTemplate> updateTemplate(
            @PathVariable UUID id,
            @RequestBody CertificateTemplateDto dto) {

        return ResponseEntity.ok(service.updateTemplate(id, dto));
    }

    // ==============================
    // 🔥 PATCH UPDATE (ID BASED)
    // ==============================
    @PatchMapping("/{id}")
    public ResponseEntity<CertificateTemplate> patchTemplate(
            @PathVariable UUID id,
            @RequestBody CertificateTemplateDto dto) {

        return ResponseEntity.ok(service.patchTemplate(id, dto));
    }

    // ==============================
    // 🔥 DELETE TEMPLATE
    // ==============================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTemplate(@PathVariable UUID id) {
        templateRepository.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }

    // ==============================
    // 🔥 DELETE ELEMENT
    // ==============================
    @DeleteMapping("/{templateId}/element/{elementId}")
    public ResponseEntity<String> deleteElement(
            @PathVariable UUID templateId,
            @PathVariable UUID elementId) {

        service.deleteElement(templateId, elementId);
        return ResponseEntity.ok("Element deleted");
    }
}