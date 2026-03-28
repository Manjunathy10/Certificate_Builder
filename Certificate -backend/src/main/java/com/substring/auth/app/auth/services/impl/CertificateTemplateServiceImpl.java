package com.substring.auth.app.auth.services.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.substring.auth.app.auth.entities.CertificateTemplate;
import com.substring.auth.app.auth.entities.CertificateTemplateElement;
import com.substring.auth.app.auth.payload.CertificateTemplateDto;
import com.substring.auth.app.auth.payload.TemplateElementDto;
import com.substring.auth.app.auth.repositories.CertificateTemplateRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CertificateTemplateServiceImpl {

    private final CertificateTemplateRepository templateRepository;

    // ==============================
    // ✅ CREATE
    // ==============================
    public CertificateTemplate createTemplate(CertificateTemplateDto dto) {

        CertificateTemplate template = CertificateTemplate.builder()
                .templateName(dto.getTemplateName())
                .orientation(dto.getOrientation())
                .backgroundImage(dto.getBackgroundImage())
                .fontFamily(dto.getFontFamily())
                .fontSize(dto.getFontSize())
                .fontColor(dto.getFontColor())
                .build();

        List<CertificateTemplateElement> elements = dto.getElements().stream().map(e -> {

            return CertificateTemplateElement.builder()
                    .elementName(e.getElementName())
                    .elementType(e.getElementType())
                    .xPosition(e.getXPosition())
                    .yPosition(e.getYPosition())
                    .width(e.getWidth())
                    .height(e.getHeight())
                    .fontSize(e.getFontSize())
                    .textAlign(e.getTextAlign())
                    .fontFamily(e.getFontFamily())
                    .fontStyle(e.getFontStyle())
                    .fontColor(e.getFontColor())
                    .staticValue(e.getStaticValue())
                    .template(template)
                    .build();

        }).toList();

        template.setElements(elements);

        return templateRepository.save(template);
    }

    // ==============================
    // ✅ FULL UPDATE (PUT)
    // ==============================
    public CertificateTemplate updateTemplate(UUID id, CertificateTemplateDto dto) {

        CertificateTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setTemplateName(dto.getTemplateName());
        template.setOrientation(dto.getOrientation());
        template.setBackgroundImage(dto.getBackgroundImage());
        template.setFontFamily(dto.getFontFamily());
        template.setFontSize(dto.getFontSize());
        template.setFontColor(dto.getFontColor());

        template.getElements().clear();

        List<CertificateTemplateElement> newElements = dto.getElements().stream().map(e -> {

            return CertificateTemplateElement.builder()
                    .elementName(e.getElementName())
                    .elementType(e.getElementType())
                    .xPosition(e.getXPosition())
                    .yPosition(e.getYPosition())
                    .width(e.getWidth())
                    .height(e.getHeight())
                    .fontSize(e.getFontSize())
                    .textAlign(e.getTextAlign())
                    .fontFamily(e.getFontFamily())
                    .fontStyle(e.getFontStyle())
                    .fontColor(e.getFontColor())
                    .staticValue(e.getStaticValue())
                    .template(template)
                    .build();

        }).toList();

        template.getElements().addAll(newElements);

        return templateRepository.save(template);
    }

    // ==============================
    // 🔥 PATCH (ID BASED)
    // ==============================
    public CertificateTemplate patchTemplate(UUID id, CertificateTemplateDto dto) {

        CertificateTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        // parent update
        if (dto.getTemplateName() != null)
            template.setTemplateName(dto.getTemplateName());

        if (dto.getOrientation() != null)
            template.setOrientation(dto.getOrientation());

        if (dto.getBackgroundImage() != null)
            template.setBackgroundImage(dto.getBackgroundImage());

        if (dto.getFontFamily() != null)
            template.setFontFamily(dto.getFontFamily());

        if (dto.getFontSize() != null)
            template.setFontSize(dto.getFontSize());

        if (dto.getFontColor() != null)
            template.setFontColor(dto.getFontColor());

        // 🔥 element patch (ID BASED)
        if (dto.getElements() != null) {

            for (TemplateElementDto e : dto.getElements()) {

                CertificateTemplateElement element = template.getElements().stream()
                        .filter(el -> el.getId().equals(e.getId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Element not found"));

                if (e.getXPosition() != null)
                    element.setXPosition(e.getXPosition());

                if (e.getYPosition() != null)
                    element.setYPosition(e.getYPosition());

                if (e.getWidth() != null)
                    element.setWidth(e.getWidth());

                if (e.getHeight() != null)
                    element.setHeight(e.getHeight());

                if (e.getFontSize() != null)
                    element.setFontSize(e.getFontSize());

                if (e.getTextAlign() != null)
                    element.setTextAlign(e.getTextAlign());

                if (e.getFontFamily() != null)
                    element.setFontFamily(e.getFontFamily());

                if (e.getFontStyle() != null)
                    element.setFontStyle(e.getFontStyle());

                if (e.getFontColor() != null)
                    element.setFontColor(e.getFontColor());

                if (e.getStaticValue() != null)
                    element.setStaticValue(e.getStaticValue());
            }
        }

        return templateRepository.save(template);
    }

    // ==============================
    // 🔥 DELETE ELEMENT
    // ==============================
    public void deleteElement(UUID templateId, UUID elementId) {

        CertificateTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.getElements().removeIf(e -> e.getId().equals(elementId));

        templateRepository.save(template);
    }
}