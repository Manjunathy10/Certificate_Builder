package com.substring.auth.app.auth.payload;

import java.util.UUID;

import com.substring.auth.app.auth.entities.AddressType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressDto {

	private UUID id;

	private String addressLine;

	private String city;

	private String district;

	private String state;

	private String pincode;

	private AddressType type;
}