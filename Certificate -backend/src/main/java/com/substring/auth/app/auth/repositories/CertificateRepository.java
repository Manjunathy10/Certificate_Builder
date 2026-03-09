package com.substring.auth.app.auth.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.substring.auth.app.auth.entities.Certificate;

public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
	
	   Optional<Certificate> findByCertificateNumber(String certificateNumber);

}
