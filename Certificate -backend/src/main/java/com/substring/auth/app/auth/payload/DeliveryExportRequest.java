package com.substring.auth.app.auth.payload;

import java.util.List;

import lombok.Data;

@Data
public class DeliveryExportRequest {
	private List<String> trainerNumbers;
}
