package com.substring.auth.app.utils;

import java.awt.image.BufferedImage;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;

public class QrCodeGenerator {

	public static BufferedImage generateQr(String text) {

		try {

			BitMatrix matrix = new MultiFormatWriter().encode(text, BarcodeFormat.QR_CODE, 200, 200);

			return MatrixToImageWriter.toBufferedImage(matrix);

		} catch (Exception e) {

			throw new RuntimeException("QR generation failed");
		}
	}
}