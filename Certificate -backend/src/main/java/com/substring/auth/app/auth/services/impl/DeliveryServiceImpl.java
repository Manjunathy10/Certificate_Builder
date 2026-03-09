package com.substring.auth.app.auth.services.impl;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.substring.auth.app.auth.entities.Address;
import com.substring.auth.app.auth.entities.Profile;
import com.substring.auth.app.auth.repositories.ProfileRepository;
import com.substring.auth.app.auth.services.DeliveryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final ProfileRepository profileRepository;

    @Override
    public byte[] exportDeliveryAddresses(List<String> trainerNumbers) {

        List<Profile> profiles =
                profileRepository.findByIdentificationNumberIn(trainerNumbers);

        try {

            ByteArrayOutputStream out = new ByteArrayOutputStream();

            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);

            Document document = new Document(pdf, PageSize.A4);

            // 3 columns (label + gap + label)
            float[] columnWidths = {1, 0.05f, 1};

            Table mainTable =
                    new Table(UnitValue.createPercentArray(columnWidths))
                    .useAllAvailableWidth();

            int counter = 0;

            for(Profile profile : profiles){

                Address address =
                        profile.getUser()
                        .getAddresses()
                        .stream()
                        .findFirst()
                        .orElse(null);

                Cell label = new Cell()
                        .setBorder(new SolidBorder(1))
                        .setPadding(6);

                // HEADER
                Table header =
                        new Table(UnitValue.createPercentArray(new float[]{1,2}))
                        .useAllAvailableWidth();

                header.addCell(new Cell()
                        .add(new Paragraph("DELHIVERY"))
                        .setBold()
                        .setTextAlignment(TextAlignment.CENTER));

                header.addCell(new Cell()
                        .add(new Paragraph("Order ID : "
                        + UUID.randomUUID().toString().substring(0,18)))
                        .setTextAlignment(TextAlignment.CENTER));

                label.add(header);

                // PRODUCT
                Table product =
                        new Table(UnitValue.createPercentArray(new float[]{2,1}))
                        .useAllAvailableWidth();

                product.addCell(new Cell()
                        .add(new Paragraph("Product Name: Paper Material")));

                product.addCell(new Cell()
                        .add(new Paragraph("Qty: 1"))
                        .setTextAlignment(TextAlignment.CENTER));

                label.add(product);

                // BLANK SPACE
                Cell blank = new Cell()
                        .setHeight(100)
                        .setBorder(Border.NO_BORDER);

                label.add(blank);

                // CONSIGNEE
                label.add(new Paragraph("Consignee Name:").setBold());

                label.add(new Paragraph(profile.getCenterName()).setBold());

                // ADDRESS
                if(address != null){

                    String formattedAddress =
                            address.getAddressLine() + ", " +
                            address.getCity() + ", " +
                            address.getDistrict() + ", " +
                            address.getState() + " - " +
                            address.getPincode() + ", India";

                    label.add(new Paragraph("Shipping Address:"));

                    label.add(new Paragraph(formattedAddress).setBold());
                }

                // MOBILE
                label.add(new Paragraph("Mobile: "
                        + profile.getMobileNumber()));

                // SUPPORT SECTION WITH TOP BORDER
                Table supportTable =
                        new Table(UnitValue.createPercentArray(new float[]{1}))
                        .useAllAvailableWidth();

                Cell supportCell = new Cell()
                        .setBorderTop(new SolidBorder(1))
                        .setBorderLeft(Border.NO_BORDER)
                        .setBorderRight(Border.NO_BORDER)
                        .setBorderBottom(Border.NO_BORDER)
                        .setTextAlignment(TextAlignment.CENTER);

                supportCell.add(new Paragraph("Support Details"));

                supportCell.add(new Paragraph("Contact No: 9890861929")
                        .setBold());

                supportCell.add(new Paragraph("Email ID: veprints07@gmail.com")
                        .setBold());

                supportTable.addCell(supportCell);

                label.add(supportTable);

                // ADD LABEL
                mainTable.addCell(label);

                counter++;

                // GAP COLUMN
                if(counter % 2 == 1){
                    mainTable.addCell(new Cell().setBorder(Border.NO_BORDER));
                }

                // NEW PAGE AFTER 4 LABELS
                if(counter % 4 == 0){

                    document.add(mainTable);

                    document.add(new AreaBreak());

                    mainTable =
                            new Table(UnitValue.createPercentArray(columnWidths))
                            .useAllAvailableWidth();
                }
            }

            document.add(mainTable);

            document.close();

            return out.toByteArray();

        }
        catch(Exception e){

            throw new RuntimeException(
            "Delivery export failed: " + e.getMessage());
        }
    }
}