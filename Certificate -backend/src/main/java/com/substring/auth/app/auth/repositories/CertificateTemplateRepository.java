package com.substring.auth.app.auth.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.substring.auth.app.auth.entities.CertificateTemplate;

public interface CertificateTemplateRepository extends JpaRepository<CertificateTemplate, UUID> {

}
