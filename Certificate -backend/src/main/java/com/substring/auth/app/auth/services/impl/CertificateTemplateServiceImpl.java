package com.substring.auth.app.auth.services.impl;

import org.springframework.stereotype.Service;

import com.substring.auth.app.auth.entities.CertificateTemplate;
import com.substring.auth.app.auth.entities.CertificateTemplateElement;
import com.substring.auth.app.auth.payload.CertificateTemplateDto;
import com.substring.auth.app.auth.payload.TemplateElementDto;
import com.substring.auth.app.auth.repositories.CertificateTemplateElementRepository;
import com.substring.auth.app.auth.repositories.CertificateTemplateRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CertificateTemplateServiceImpl {

	private final CertificateTemplateRepository templateRepository;
	private final CertificateTemplateElementRepository elementRepository;

	public void createTemplate(CertificateTemplateDto dto) {

		CertificateTemplate template = CertificateTemplate.builder().templateName(dto.getTemplateName())
				.orientation(dto.getOrientation()).backgroundImage(dto.getBackgroundImage())
				.fontFamily(dto.getFontFamily()).fontSize(dto.getFontSize()).fontColor(dto.getFontColor()).build();

		CertificateTemplate saved = templateRepository.save(template);

		for (TemplateElementDto elementDto : dto.getElements()) {

			CertificateTemplateElement element = CertificateTemplateElement.builder()
					.elementName(elementDto.getElementName()).xPosition(elementDto.getXPosition())
					.yPosition(elementDto.getYPosition()).width(elementDto.getWidth()).height(elementDto.getHeight())
					.fontSize(elementDto.getFontSize()).textAlign(elementDto.getTextAlign()).template(saved).build();

			elementRepository.save(element);
		}
	}
}