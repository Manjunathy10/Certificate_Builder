package com.substring.auth.app.auth.services.impl;


import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    Map.of("format", "png") // 🔥 FORCE PNG (IMPORTANT)
            );

            return uploadResult.get("secure_url").toString();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }
    }
}