package com.substring.auth.app.auth.services;

import java.util.List;
import java.util.UUID;

import com.substring.auth.app.auth.payload.AddressDto;

public interface AddressService {
	
	// add address for user
	AddressDto createAddress(AddressDto addressDto, UUID userId);

	// get all addresses of a user
	List<AddressDto> getUserAddresses(UUID userId);

	// update address
	AddressDto updateAddress(AddressDto addressDto, UUID addressId);

	// delete address
	void deleteAddress(UUID addressId);
}
