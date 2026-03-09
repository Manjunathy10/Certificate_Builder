package com.substring.auth.app.auth.payload;

import java.util.List;

import lombok.Data;

@Data
public class CertificateTemplateDto {

	private String templateName;

	private String orientation;

	private String backgroundImage;

	private String fontFamily;

	private Integer fontSize;

	private String fontColor;

	private List<TemplateElementDto> elements;
}
