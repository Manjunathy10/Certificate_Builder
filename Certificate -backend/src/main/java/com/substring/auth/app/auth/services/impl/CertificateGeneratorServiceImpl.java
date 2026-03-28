package com.substring.auth.app.auth.services.impl;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Service;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
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
            PdfDocument pdf = new PdfDocument(new PdfWriter(out));

            PageSize pageSize = "LANDSCAPE".equalsIgnoreCase(template.getOrientation())
                    ? PageSize.A4.rotate()
                    : PageSize.A4;

            Document document = new Document(pdf, pageSize);
            document.setMargins(0, 0, 0, 0);

            String certNumber = "CERT-" + UUID.randomUUID().toString().substring(0, 8);

            // =========================
            // BACKGROUND IMAGE
            // =========================
            try {
                URL url = new URL(template.getBackgroundImage());
                InputStream is = url.openStream();
                byte[] imageBytes = is.readAllBytes();

                Image bg = new Image(ImageDataFactory.create(imageBytes));
                bg.scaleAbsolute(pageSize.getWidth(), pageSize.getHeight());
                bg.setFixedPosition(0, 0);

                document.add(bg);

            } catch (Exception e) {
                System.out.println("Background load failed");
            }

            // =========================
            // SORT ELEMENTS
            // =========================
            template.getElements().stream()
                    .sorted(Comparator.comparing(e -> e.getZIndex() == null ? 0 : e.getZIndex()))
                    .forEach(element -> {

                        try {

                            float pageWidth = pageSize.getWidth();
                            float pageHeight = pageSize.getHeight();

                            float x = (element.getXPosition() / 100f) * pageWidth;
                            float yTop = (element.getYPosition() / 100f) * pageHeight;

                            float width = (element.getWidth() / 100f) * pageWidth;
                            float height = (element.getHeight() / 100f) * pageHeight;

                            float y = pageHeight - yTop;

                            // =========================
                            // QR CODE
                            // =========================
                            if ("qr_code".equalsIgnoreCase(element.getElementName())) {

                                String verifyUrl = "http://localhost:8083/api/v1/certificates/verify/" + certNumber;

                                BufferedImage qr = QrCodeGenerator.generateQr(verifyUrl);

                                ByteArrayOutputStream qrStream = new ByteArrayOutputStream();
                                ImageIO.write(qr, "png", qrStream);

                                Image qrImage = new Image(ImageDataFactory.create(qrStream.toByteArray()));
                                qrImage.scaleToFit(width, height);
                                qrImage.setFixedPosition(x, y - height);

                                document.add(qrImage);
                                return;
                            }

                            // =========================
                            // VALUE
                            // =========================
                            String value;

                            if ("static".equalsIgnoreCase(element.getElementType())) {
                                value = element.getStaticValue();
                            } else {
                                value = getStudentValue(student, element.getElementName(), certNumber);
                            }

                            // =========================
                            // FONT
                            // =========================
                            PdfFont font = loadFont(element.getFontFamily(), element.getFontStyle());
                            float fontSize = element.getFontSize();

                            // =========================
                            // ALIGNMENT
                            // =========================
                            TextAlignment align = TextAlignment.CENTER;
                            float textX = x + (width / 2);

                            if ("left".equalsIgnoreCase(element.getTextAlign())) {
                                align = TextAlignment.LEFT;
                                textX = x;
                            } else if ("right".equalsIgnoreCase(element.getTextAlign())) {
                                align = TextAlignment.RIGHT;
                                textX = x + width;
                            }

                            // =========================
                            // 🔥 AUTO BASELINE ENGINE
                            // =========================
                            float ascent = font.getAscent("Hg", fontSize);
                            float descent = font.getDescent("Hg", fontSize);

                            float textHeight = ascent - descent;
                            float baselineShift = (textHeight / 2) - ascent;

                            float adjustedY = y - (height / 2) - baselineShift;

                            // =========================
                            // TEXT
                            // =========================
                            Paragraph text = new Paragraph(value)
                                    .setFont(font)
                                    .setFontSize(fontSize)
                                    .setFontColor(getColor(element.getFontColor()))
                                    .setTextAlignment(align)
                                    .setWidth(width)
                                    .setFixedLeading(fontSize);

                            document.showTextAligned(text, textX, adjustedY, align);

                        } catch (Exception ex) {
                            ex.printStackTrace();
                        }
                    });

            document.close();

            // =========================
            // SAVE
            // =========================
            certificateRepository.save(
                    Certificate.builder()
                            .certificateNumber(certNumber)
                            .studentId(studentId)
                            .templateId(templateId)
                            .issueDate(LocalDate.now())
                            .build()
            );

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Certificate generation failed: " + e.getMessage());
        }
    }

    // =========================
    // FONT LOADER
    // =========================
    private PdfFont loadFont(String family, String style) {

        try {
            if ("Poppins".equalsIgnoreCase(family)) {

                String path = "/fonts/Poppins-Regular.ttf";

                if ("bold".equalsIgnoreCase(style)) {
                    path = "/fonts/Poppins-Bold.ttf";
                } else if ("italic".equalsIgnoreCase(style)) {
                    path = "/fonts/Poppins-Italic.ttf";
                }

                InputStream is = getClass().getResourceAsStream(path);

                if (is == null) {
                    throw new RuntimeException("Font not found: " + path);
                }

                return PdfFontFactory.createFont(is.readAllBytes(), PdfEncodings.IDENTITY_H);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            return PdfFontFactory.createFont(StandardFonts.HELVETICA, PdfEncodings.WINANSI);
        } catch (Exception e) {
            throw new RuntimeException("Fallback font load failed");
        }
    }

    // =========================
    // COLOR
    // =========================
    private Color getColor(String hex) {

        if (hex == null || hex.isEmpty()) return new DeviceRgb(0, 0, 0);

        hex = hex.replace("#", "");

        int r = Integer.parseInt(hex.substring(0, 2), 16);
        int g = Integer.parseInt(hex.substring(2, 4), 16);
        int b = Integer.parseInt(hex.substring(4, 6), 16);

        return new DeviceRgb(r, g, b);
    }

    // =========================
    // DATA
    // =========================
    private String getStudentValue(Student student, String field, String certNumber) {

        return switch (field) {
            case "student_name" -> student.getFullName();
            case "course_name" -> student.getCourseName();
            case "certificate_no" -> certNumber;
            case "issue_date" -> LocalDate.now().toString();
            default -> "";
        };
    }
}