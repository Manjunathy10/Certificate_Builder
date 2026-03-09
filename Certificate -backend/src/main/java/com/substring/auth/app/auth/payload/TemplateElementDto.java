package com.substring.auth.app.auth.payload;

import lombok.Data;

@Data
public class TemplateElementDto {

	private String elementName;

	private Integer xPosition;

	private Integer yPosition;

	private Integer width;

	private Integer height;

	private Integer fontSize;

	private String textAlign;
}
