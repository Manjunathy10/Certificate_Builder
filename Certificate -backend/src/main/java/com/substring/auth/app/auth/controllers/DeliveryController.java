package com.substring.auth.app.auth.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.substring.auth.app.auth.payload.DeliveryExportRequest;
import com.substring.auth.app.auth.services.DeliveryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportDeliveryAddresses(
            @RequestBody DeliveryExportRequest request) {

        byte[] pdf =
                deliveryService.exportDeliveryAddresses(
                        request.getTrainerNumbers());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=delivery-address.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}