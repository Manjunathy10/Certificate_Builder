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

import com.substring.auth.app.auth.payload.ProfileDto;
import com.substring.auth.app.auth.services.ProfileService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/v1/profile")
@AllArgsConstructor
public class ProfileController {

	private final ProfileService profileService;

	// create profile api
	// Creates a profile for a specific user using userId.
	@PostMapping("/{userId}")
	public ResponseEntity<ProfileDto> createProfile(@RequestBody ProfileDto profileDto, @PathVariable UUID userId) {
		ProfileDto createdProfile = profileService.createProfile(profileDto, userId);
		return ResponseEntity.ok(createdProfile);
	}

//	 Fetches profile details of a specific user.
	// get profile by user id
	@GetMapping("/{userId}")
	public ResponseEntity<ProfileDto> getProfileByUserId(@PathVariable UUID userId) {

		ProfileDto profile = profileService.getProfileByUserId(userId);
		return ResponseEntity.ok(profile);
	}
	
    // update profile
    @PutMapping("/{profileId}")
    public ResponseEntity<ProfileDto> updateProfile(
            @RequestBody ProfileDto profileDto,
            @PathVariable UUID profileId) {

        ProfileDto updatedProfile = profileService.updateProfile(profileDto, profileId);
        return ResponseEntity.ok(updatedProfile);
    }
    
    // delete profile
    @DeleteMapping("/{profileId}")
    public ResponseEntity<String> deleteProfile(
            @PathVariable UUID profileId) {

        profileService.deleteProfile(profileId);
        return ResponseEntity.ok("Profile deleted successfully");
    }

}
