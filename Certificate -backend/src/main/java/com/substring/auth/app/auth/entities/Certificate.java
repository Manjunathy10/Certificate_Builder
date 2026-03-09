package com.substring.auth.app.auth.entities;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="certificates")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Certificate {

	 @Id
	    @GeneratedValue(strategy = GenerationType.UUID)
	    private UUID id;

	    private String certificateNumber;

	    private UUID studentId;

	    private UUID templateId;

	    private String pdfPath;

	    private LocalDate issueDate;
}
