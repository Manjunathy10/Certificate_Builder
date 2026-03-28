package com.substring.auth.app.auth.entities;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "certificate_template_elements")
public class CertificateTemplateElement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String elementName;
    private String elementType;
    
    
    private Integer zIndex;

    @JsonProperty("xPosition")
    private Integer xPosition;

    @JsonProperty("yPosition")
    private Integer yPosition;

    private Integer width;
    private Integer height;

    private Integer fontSize;
    private String textAlign;

    // 🔥 NEW FIELDS
    private String fontFamily;
    private String fontStyle; // normal, bold, italic
    private String fontColor;

    private String staticValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    @JsonIgnore
    private CertificateTemplate template;
}