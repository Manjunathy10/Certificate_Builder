package com.substring.auth.app.auth.services;

import com.substring.auth.app.auth.payload.CertificateTemplateDto;

public interface CertificateTemplateService {

	// Admin certificate template create करेगा
	void createTemplate(CertificateTemplateDto dto);
}
