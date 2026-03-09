package com.substring.auth.app.auth.payload;

import java.util.List;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BulkCertificateRequest {

	private UUID templateId;

	private List<UUID> studentIds;
}
