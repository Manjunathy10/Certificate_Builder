package com.substring.auth.app.auth.services.impl;

import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.substring.auth.app.auth.entities.Profile;
import com.substring.auth.app.auth.entities.User;
import com.substring.auth.app.auth.payload.ProfileDto;
import com.substring.auth.app.auth.repositories.ProfileRepository;
import com.substring.auth.app.auth.repositories.UserRepository;
import com.substring.auth.app.auth.services.ProfileService;
import com.substring.auth.app.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

	private final ProfileRepository profileRepository;

	private final ModelMapper modelMapper;

	private final UserRepository userRepository;

	// create user profile
	@Override
	public ProfileDto createProfile(ProfileDto profileDto, UUID userId) {

		// Step 1: Database se user find karna using userId
		// Agar user database me nahi mila to exception throw hoga
		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		// Step 2: Check karna ki user ka profile already exist to nahi karta
		// Agar exist karta hai to duplicate profile create nahi hone denge
		if (profileRepository.existsByUser(user)) {
			throw new ResourceNotFoundException("Profile already exists for this user");
		}

		// Step 3: ProfileDto ko Profile entity me convert karna
		// ModelMapper automatically same-name fields ko map kar deta hai
		Profile profile = modelMapper.map(profileDto, Profile.class);

		// Step 4: Profile ko user ke saath link karna
		// Isse profile table me user_id foreign key set ho jayegi
		profile.setUser(user);

		// Step 5: Profile entity ko database me save karna
		// save() method insert operation perform karega
		Profile savedProfile = profileRepository.save(profile);

		// Step 6: Saved Profile entity ko wapas DTO me convert karna
		// Taaki API response me DTO return ho (entity nahi)
		return modelMapper.map(savedProfile, ProfileDto.class);

	}

// get profile by user id 
	@Override
	public ProfileDto getProfileByUserId(UUID userId) {

		// find user into database
		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		//  find user  profile
		Profile profile = profileRepository.findByUser(user)
				.orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
		 // Step 3: Entity -> DTO convert karo using ModelMapper
		return modelMapper.map(profile, ProfileDto.class);
	}

	@Override
	public ProfileDto updateProfile(ProfileDto profileDto, UUID profileId) {

		// Step 1: Find existing profile from database
	    Profile profile = profileRepository.findById(profileId)
	            .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

	    // Step 2: Basic validation (example mobile number)
	    if (profileDto.getMobileNumber() != null && profileDto.getMobileNumber().length() != 10) {
	        throw new IllegalArgumentException("Mobile number must be 10 digits");
	    }

	    // Step 3: Partial update (only update fields which are not null)

	    if (profileDto.getFullName() != null) {
	        profile.setFullName(profileDto.getFullName());
	    }

	    if (profileDto.getMobileNumber() != null) {
	        profile.setMobileNumber(profileDto.getMobileNumber());
	    }

	    if (profileDto.getCenterName() != null) {
	        profile.setCenterName(profileDto.getCenterName());
	    }

	    if (profileDto.getDeliveryPartner() != null) {
	        profile.setDeliveryPartner(profileDto.getDeliveryPartner());
	    }

	    if (profileDto.getIdentificationNumber() != null) {
	        profile.setIdentificationNumber(profileDto.getIdentificationNumber());
	    }

	    if (profileDto.getNsdcEnrollmentEnabled() != null) {
	        profile.setNsdcEnrollmentEnabled(profileDto.getNsdcEnrollmentEnabled());
	    }

	    if (profileDto.getDateOfBirth() != null) {
	        profile.setDateOfBirth(profileDto.getDateOfBirth());
	    }

	    if (profileDto.getStartDate() != null) {
	        profile.setStartDate(profileDto.getStartDate());
	    }

	    if (profileDto.getEndDate() != null) {
	        profile.setEndDate(profileDto.getEndDate());
	    }

	    if (profileDto.getPhotoUrl() != null) {
	        profile.setPhotoUrl(profileDto.getPhotoUrl());
	    }

	    // Step 4: Update timestamp
	    profile.setUpdatedAt(java.time.Instant.now());

	    // Step 5: Save updated profile
	    Profile updatedProfile = profileRepository.save(profile);

	    // Step 6: Convert Entity → DTO and return response
	    return modelMapper.map(updatedProfile, ProfileDto.class);
	}

	
	@Override
	public void deleteProfile(UUID profileId) {
		 // Step 1: Database se profile find karna using profileId
	    // Agar profile database me nahi milta to exception throw hoga
	    Profile profile = profileRepository.findById(profileId)
	            .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

	    // Step 2: Found profile ko database se delete karna
	    profileRepository.delete(profile);

	}

}
