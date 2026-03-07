package com.substring.auth.app.auth.controllers;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.substring.auth.app.auth.payload.AddressDto;
import com.substring.auth.app.auth.services.AddressService;

import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {
	
	private final AddressService addressService;
	

    // create address
    @PostMapping("/{userId}")
    public ResponseEntity<AddressDto> createAddress(
            @RequestBody AddressDto addressDto,
            @PathVariable UUID userId) {

        AddressDto createdAddress = addressService.createAddress(addressDto, userId);
        return ResponseEntity.ok(createdAddress);
    }

    // get all addresses of user
    @GetMapping("/{userId}")
    public ResponseEntity<List<AddressDto>> getUserAddresses(
            @PathVariable UUID userId) {

        List<AddressDto> addresses = addressService.getUserAddresses(userId);
        return ResponseEntity.ok(addresses);
    }

    // update address
    @PutMapping("/{addressId}")
    public ResponseEntity<AddressDto> updateAddress(
            @RequestBody AddressDto addressDto,
            @PathVariable UUID addressId) {

        AddressDto updatedAddress = addressService.updateAddress(addressDto, addressId);
        return ResponseEntity.ok(updatedAddress);
    }

    // delete address
    @DeleteMapping("/{addressId}")
    public ResponseEntity<String> deleteAddress(
            @PathVariable UUID addressId) {

        addressService.deleteAddress(addressId);
        return ResponseEntity.ok("Address deleted successfully");
    }

}
