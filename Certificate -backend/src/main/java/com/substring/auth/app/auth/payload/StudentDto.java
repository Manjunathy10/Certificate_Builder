package com.substring.auth.app.auth.payload;

import java.time.LocalDate;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class StudentDto {
	
	   private UUID id;

	    // auto generated
	    private String enrollmentNo;

	    // form fields
	    private String identificationNumber;

	    private String fullName;

	    private String courseName;

	    private String status;

	    private LocalDate dateOfBirth;

	    private LocalDate completionDate;

	    private String email;

	    private String mobileNumber;

	    private String address;

	    private String state;

	    private String district;

	    private String city;

	    private String pincode;

	    private String photoUrl;

}
