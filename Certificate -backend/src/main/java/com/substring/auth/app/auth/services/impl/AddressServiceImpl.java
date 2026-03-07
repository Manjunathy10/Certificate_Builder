package com.substring.auth.app.auth.services.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.substring.auth.app.auth.entities.Address;
import com.substring.auth.app.auth.entities.User;
import com.substring.auth.app.auth.payload.AddressDto;
import com.substring.auth.app.auth.repositories.AddressRepository;
import com.substring.auth.app.auth.repositories.UserRepository;
import com.substring.auth.app.auth.services.AddressService;
import com.substring.auth.app.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

	private final AddressRepository addressRepository;
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;

	// create address for user
	@Override
	public AddressDto createAddress(AddressDto addressDto, UUID userId) {

		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Address address = modelMapper.map(addressDto, Address.class);

		address.setUser(user);

		Address savedAddress = addressRepository.save(address);

		return modelMapper.map(savedAddress, AddressDto.class);
	}

	@Override
	public List<AddressDto> getUserAddresses(UUID userId) {

		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		List<Address> addresses = addressRepository.findByUser(user);

		return addresses.stream().map(address -> modelMapper.map(address, AddressDto.class))
				.collect(Collectors.toList());

	}

	@Override
	public AddressDto updateAddress(AddressDto addressDto, UUID addressId) {
		Address address = addressRepository.findById(addressId)
				.orElseThrow(() -> new ResourceNotFoundException("Address not found"));

		if (addressDto.getAddressLine() != null) {
			address.setAddressLine(addressDto.getAddressLine());
		}

		if (addressDto.getCity() != null) {
			address.setCity(addressDto.getCity());
		}

		if (addressDto.getDistrict() != null) {
			address.setDistrict(addressDto.getDistrict());
		}

		if (addressDto.getState() != null) {
			address.setState(addressDto.getState());
		}

		if (addressDto.getPincode() != null) {
			address.setPincode(addressDto.getPincode());
		}

		if (addressDto.getType() != null) {
			address.setType(addressDto.getType());
		}

		Address updatedAddress = addressRepository.save(address);
		return modelMapper.map(updatedAddress, AddressDto.class);
	}

	@Override
	public void deleteAddress(UUID addressId) {
	
		 Address address = addressRepository.findById(addressId)
	                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

	        addressRepository.delete(address);

	}

}
