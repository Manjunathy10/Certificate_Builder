package com.substring.auth.app.auth.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.substring.auth.app.auth.entities.Address;
import com.substring.auth.app.auth.entities.AddressType;
import com.substring.auth.app.auth.entities.User;

public interface AddressRepository extends JpaRepository<Address, UUID> {


//     This method is used to fetch all addresses of a specific user.
//     
//      Example:
//     If a user has multiple addresses (Home, Office, Shipping),
//      this method will return all of them as a List.
	List<Address> findByUser(User user);

	  /*
     * This method checks whether a specific type of address
     * already exists for a user.
     * 
     * Example:
     * If a user already has a HOME address and we want to
     * prevent creating another HOME address, we can check it using this method.
     * 
     * Returns:
     * true  -> address of that type already exists
     * false -> address does not exist
     */
	boolean existsByUserAndType(User user, AddressType type);

}