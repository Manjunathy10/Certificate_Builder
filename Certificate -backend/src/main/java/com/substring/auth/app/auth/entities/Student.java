package com.substring.auth.app.auth.entities;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String enrollmentNo;

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

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

