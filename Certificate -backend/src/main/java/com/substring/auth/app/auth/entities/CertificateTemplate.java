package com.substring.auth.app.auth.entities;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
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
@Table(name = "certificate_templates")
public class CertificateTemplate {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	// Name of template
	private String templateName;

	// Certificate orientation (Landscape / Portrait)
	private String orientation;

	// Background image path or URL
	private String backgroundImage;

	// Font family used in certificate
	private String fontFamily;

	private Integer fontSize;

	private String fontColor;

	// Template creation time stamp
	private Instant createdAt;

	// One template can have multiple elements
	// Example elements: student_name, course_name, date, signature
	@OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<CertificateTemplateElement> elements;

	// Automatically set creation time when record is inserted
	@PrePersist
	public void onCreate() {
		createdAt = Instant.now();
	}
}