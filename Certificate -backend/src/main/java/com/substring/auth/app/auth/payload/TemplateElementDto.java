package com.substring.auth.app.auth.payload;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class TemplateElementDto {
	
	
	   private UUID id;

	private String elementName;
    private String elementType;

    @JsonProperty("xPosition")
    private Integer xPosition;

    @JsonProperty("yPosition")
    private Integer yPosition;

    private Integer width;
    private Integer height;

    private Integer fontSize;
    private String textAlign;

    private String fontFamily;
    private String fontStyle;
    private String fontColor;

    private String staticValue;
    
    private Integer zIndex;
}
