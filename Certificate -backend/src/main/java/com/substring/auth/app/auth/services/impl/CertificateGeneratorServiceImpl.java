package com.substring.auth.app.auth.services.impl;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Service;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.substring.auth.app.auth.entities.Certificate;
import com.substring.auth.app.auth.entities.CertificateTemplate;
import com.substring.auth.app.auth.entities.CertificateTemplateElement;
import com.substring.auth.app.auth.entities.Student;
import com.substring.auth.app.auth.repositories.CertificateRepository;
import com.substring.auth.app.auth.repositories.CertificateTemplateRepository;
import com.substring.auth.app.auth.repositories.StudentRepository;
import com.substring.auth.app.utils.QrCodeGenerator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CertificateGeneratorServiceImpl {

	private final StudentRepository studentRepository;
	private final CertificateTemplateRepository templateRepository;
	private final CertificateRepository certificateRepository;

	public byte[] generateCertificate(UUID studentId, UUID templateId) {

		try {

			Student student = studentRepository.findById(studentId)
					.orElseThrow(() -> new RuntimeException("Student not found"));

			CertificateTemplate template = templateRepository.findById(templateId)
					.orElseThrow(() -> new RuntimeException("Template not found"));

			ByteArrayOutputStream out = new ByteArrayOutputStream();

			PdfWriter writer = new PdfWriter(out);
			PdfDocument pdf = new PdfDocument(writer);

			Document document = new Document(pdf, PageSize.A4);

			// CERTIFICATE NUMBER
			String certNumber = "CERT-" + UUID.randomUUID().toString().substring(0, 8);

			// BACKGROUND IMAGE
			Image bg = new Image(ImageDataFactory.create(template.getBackgroundImage()));

			bg.scaleToFit(PageSize.A4.getWidth(), PageSize.A4.getHeight());
			bg.setFixedPosition(0, 0);

			document.add(bg);

			// DRAW TEMPLATE ELEMENTS
			for (CertificateTemplateElement element : template.getElements()) {

				// ==============================
				// QR CODE ELEMENT
				// ==============================
				if ("qr_code".equalsIgnoreCase(element.getElementName())) {

					String verifyUrl = "http://localhost:8080/api/v1/certificates/verify/" + certNumber;

					BufferedImage qr = QrCodeGenerator.generateQr(verifyUrl);

					ByteArrayOutputStream qrStream = new ByteArrayOutputStream();

					ImageIO.write(qr, "png", qrStream);

					Image qrImage = new Image(ImageDataFactory.create(qrStream.toByteArray()));

					qrImage.scaleToFit(element.getWidth(), element.getHeight());

					qrImage.setFixedPosition(element.getXPosition(), element.getYPosition());

					document.add(qrImage);

					continue;
				}

				// ==============================
				// NORMAL TEXT ELEMENTS
				// ==============================

				String value = getStudentValue(student, element.getElementName(), certNumber);

				Paragraph text = new Paragraph(value).setFontSize(element.getFontSize());

				if ("center".equalsIgnoreCase(element.getTextAlign()))
					text.setTextAlignment(TextAlignment.CENTER);

				text.setFixedPosition(element.getXPosition(), element.getYPosition(), element.getWidth());

				document.add(text);
			}

			document.close();

			// SAVE CERTIFICATE RECORD
			Certificate cert = Certificate.builder().certificateNumber(certNumber).studentId(studentId)
					.templateId(templateId).issueDate(LocalDate.now()).build();

			certificateRepository.save(cert);

			return out.toByteArray();

		} catch (Exception e) {

			throw new RuntimeException("Certificate generation failed: " + e.getMessage());
		}
	}

	// ========================================
	// STUDENT DATA MAPPING
	// ========================================

	private String getStudentValue(Student student, String field, String certNumber) {

		switch (field) {

		case "student_name":
			return student.getFullName();

		case "course":
			return student.getCourseName();

		case "email":
			return student.getEmail();

		case "certificate_no":
			return certNumber;

		case "issue_date":
			return LocalDate.now().toString();

		default:
			return "";
		}
	}
}