package com.substring.auth.app.auth.entities;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

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

	// element identifier
	// student_name, course, qr_code etc
	private String elementName;

	// element type
	// text | image | qr
	private String elementType;

	// element position
	private Integer xPosition;

	private Integer yPosition;

	// element size
	private Integer width;

	private Integer height;

	// text styling
	private Integer fontSize;

	private String textAlign;

	// custom field value
	private String staticValue;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "template_id")
	@JsonIgnore
	private CertificateTemplate template;
}