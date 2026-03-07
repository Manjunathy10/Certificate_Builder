package com.substring.auth.app.auth.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.substring.auth.app.auth.entities.Student;
import com.substring.auth.app.auth.entities.User;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {

	Optional<Student> findTopByUserOrderByEnrollmentNoDesc(User user);

	Optional<Student> findByIdAndUser(UUID id, User user);

	Optional<Student> findByEnrollmentNoAndUser(String enrollmentNo, User user);

	Optional<Student> findByEmailAndUser(String email, User user);

	List<Student> findByUser(User user);

	List<Student> findByUserAndFullNameContainingIgnoreCase(User user, String name);

}
