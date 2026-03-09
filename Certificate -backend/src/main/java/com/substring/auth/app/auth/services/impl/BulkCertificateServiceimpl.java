package com.substring.auth.app.auth.services.impl;

import java.io.ByteArrayOutputStream;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.springframework.stereotype.Service;

import com.substring.auth.app.auth.payload.BulkCertificateRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BulkCertificateServiceimpl {

	private final CertificateGeneratorServiceImpl generatorService;

	public byte[] generateBulkCertificates(BulkCertificateRequest request) {

		try {

			ByteArrayOutputStream zipOut = new ByteArrayOutputStream();
			ZipOutputStream zip = new ZipOutputStream(zipOut);

			for (UUID studentId : request.getStudentIds()) {

				byte[] pdf = generatorService.generateCertificate(studentId, request.getTemplateId());

				ZipEntry entry = new ZipEntry("certificate_" + studentId + ".pdf");

				zip.putNextEntry(entry);

				zip.write(pdf);

				zip.closeEntry();
			}

			zip.close();

			return zipOut.toByteArray();

		} catch (Exception e) {

			throw new RuntimeException("Bulk certificate generation failed");
		}
	}
}