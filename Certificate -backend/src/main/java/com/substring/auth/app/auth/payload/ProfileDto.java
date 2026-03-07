package com.substring.auth.app.auth.payload;

import java.time.LocalDate;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileDto {

	private UUID id;

	private String identificationNumber;

	private Boolean nsdcEnrollmentEnabled;

	private String fullName;

	private String mobileNumber;

	private String centerName;

	private String deliveryPartner;

	private LocalDate dateOfBirth;

	private LocalDate startDate;

	private LocalDate endDate;

	private String photoUrl;
}