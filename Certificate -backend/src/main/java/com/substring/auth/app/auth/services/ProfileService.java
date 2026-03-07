package com.substring.auth.app.auth.services;

import java.util.UUID;

import com.substring.auth.app.auth.payload.ProfileDto;

public interface ProfileService {

	// create profile for user
	ProfileDto createProfile(ProfileDto profileDto, UUID userId);

	// get profile by user id
	ProfileDto getProfileByUserId(UUID userId);

	// update profile
	ProfileDto updateProfile(ProfileDto profileDto, UUID profileId);

	// delete profile
	void deleteProfile(UUID profileId);

}
