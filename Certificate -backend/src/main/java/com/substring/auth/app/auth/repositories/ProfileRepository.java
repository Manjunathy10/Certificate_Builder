package com.substring.auth.app.auth.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.substring.auth.app.auth.entities.Profile;
import com.substring.auth.app.auth.entities.User;

public interface ProfileRepository extends JpaRepository<Profile, UUID>{
	// used to find the Profile of a specific User
		// hen a logged-in user wants to view or update his profile.
		//Returns Optional<Profile> because profile may or may not exist.
		Optional<Profile> findByUser(User user);

//		This method checks whether a Profile already exists for a given User
//		 When creating a profile we can first check if profile already exists
//	     to avoid duplicate profiles for the same user.
//	     Returns true if profile exists, otherwise false.
		boolean existsByUser(User user);
}
