import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export type ReceiptPdfInput = {
  receiptNumber: string;
  invoiceNumber: string;
  issuedAt: Date;
  customerName: string;
  customerState?: string | null; // State of the buyer (e.g. "Bihar")
  ownerName?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  description: string;
  planLabel: string;
  qty: number;
  amountMinor: number; // in paise / cents
  currency: string;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
};

/**
 * Removes non-ASCII characters to make the text safe for Helvetica in pdf-lib.
 * Also replaces currency symbols like ₹ with "INR ".
 */
function pdfSafe(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/₹/g, "INR ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\x00-\x7F]/g, ""); // Keep only ASCII
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("en-IN", options);
}

export async function buildReceiptPdf(input: ReceiptPdfInput): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // Standard A4 dimensions: 595.28 x 841.89 points
  const page = pdfDoc.addPage([595.28, 841.89]);
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Layout Colors (Matching UI Reference exactly)
  const slateDark = rgb(0.06, 0.09, 0.15); // #0f172a / dark slate-blue
  const slateLight = rgb(0.45, 0.48, 0.55); // #737a8c / gray label text
  const tealAccent = rgb(0.05, 0.53, 0.53); // #0d8787 / table header teal
  const tealLight = rgb(0.93, 0.97, 0.97); // #eef7f7 / light background for total
  const tealBorder = rgb(0.8, 0.9, 0.9); // border for totals box
  const borderGray = rgb(0.88, 0.9, 0.92); // light card borders
  const textDark = rgb(0.12, 0.14, 0.18); // near black text
  const greenSuccess = rgb(0.0, 0.6, 0.2); // bold green for PAID
  const grayBg = rgb(0.98, 0.98, 0.99); // payment ref box bg

  const width = 595.28;
  const margin = 50;
  const contentWidth = width - 2 * margin; // 495.28

  // Helper functions for drawing
  const drawTextRight = (text: string, size: number, y: number, isBold = false, color = textDark) => {
    const f = isBold ? fontBold : font;
    const w = f.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: width - margin - w,
      y,
      size,
      font: f,
      color,
    });
  };

  // 1. Dark Header Bar (logo + tagline left; invoice status + numbers right)
  const headerHeight = 100;
  page.drawRectangle({
    x: 0,
    y: 841.89 - headerHeight,
    width: width,
    height: headerHeight,
    color: slateDark,
  });

  // Try to load and embed the PNG Logo
  const logoPath = path.join(process.cwd(), "public", "logoAnshapps.png");
  let logoDrawn = false;
  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, {
        x: margin,
        y: 841.89 - 70,
        width: 40,
        height: 40,
      });
      logoDrawn = true;
    } catch (err) {
      console.error("Failed to embed logo PNG in receipt:", err);
    }
  }

  // Header Left Text block (positioned relative to logo presence)
  const textX = logoDrawn ? margin + 40 + 12 : margin;
  page.drawText("ANSH Apps", {
    x: textX,
    y: 841.89 - 40,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("ANSH Forms", {
    x: textX,
    y: 841.89 - 54,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.6, 0.9), // light blue product tag
  });

  page.drawText("Built for Bharat, Ready for the World", {
    x: textX,
    y: 841.89 - 66,
    size: 7.5,
    font: fontOblique,
    color: rgb(0.75, 0.77, 0.8),
  });

  // Header Right Text
  const headerRightY = 841.89 - 42;
  const titleText = "PAYMENT RECEIPT";
  const rTitleW = fontBold.widthOfTextAtSize(titleText, 14);
  page.drawText(titleText, {
    x: width - margin - rTitleW,
    y: headerRightY,
    size: 14,
    font: fontBold,
    color: rgb(0.05, 0.7, 0.7), // Teal/cyan colored text
  });

  const rcptNoText = `Invoice No: ${pdfSafe(input.invoiceNumber)}`;
  const rNoW = font.widthOfTextAtSize(rcptNoText, 8.5);
  page.drawText(rcptNoText, {
    x: width - margin - rNoW,
    y: headerRightY - 18,
    size: 8.5,
    font: font,
    color: rgb(0.85, 0.86, 0.88),
  });

  const invNoText = `Receipt No: ${pdfSafe(input.receiptNumber)}`;
  const iNoW = font.widthOfTextAtSize(invNoText, 8.5);
  page.drawText(invNoText, {
    x: width - margin - iNoW,
    y: headerRightY - 32,
    size: 8.5,
    font: font,
    color: rgb(0.85, 0.86, 0.88),
  });

  // 2. Metadata Cards (Left: Billed To, Right: Document Info)
  const metaY = 841.89 - headerHeight - 40; // 701.89
  const cardHeight = 100;
  const cardWidth = 238;

  // Left card box (Billed To)
  page.drawRectangle({
    x: margin,
    y: metaY - cardHeight + 10,
    width: cardWidth,
    height: cardHeight,
    color: rgb(1, 1, 1),
    borderColor: borderGray,
    borderWidth: 0.5,
  });

  page.drawText("BILLED TO", {
    x: margin + 12,
    y: metaY - 5,
    size: 8,
    font: fontBold,
    color: slateLight,
  });

  page.drawText(pdfSafe(input.customerName), {
    x: margin + 12,
    y: metaY - 21,
    size: 10,
    font: fontBold,
    color: textDark,
  });

  let lineCount = 0;
  if (input.ownerName) {
    page.drawText(`Attn: ${pdfSafe(input.ownerName)}`, {
      x: margin + 12,
      y: metaY - 35 - lineCount * 13,
      size: 8.5,
      font: font,
      color: textDark,
    });
    lineCount++;
  }
  if (input.ownerEmail) {
    page.drawText(pdfSafe(input.ownerEmail), {
      x: margin + 12,
      y: metaY - 35 - lineCount * 13,
      size: 8.5,
      font: font,
      color: textDark,
    });
    lineCount++;
  }
  
  // Format state if present in billed to
  const displayPhoneState = [
    input.ownerPhone ? `Phone: ${input.ownerPhone}` : null,
    input.customerState ? `State: ${input.customerState}` : null
  ].filter(Boolean).join(" | ");

  if (displayPhoneState) {
    page.drawText(pdfSafe(displayPhoneState), {
      x: margin + 12,
      y: metaY - 35 - lineCount * 13,
      size: 8.5,
      font: font,
      color: textDark,
    });
  }

  // Right card box (Document Details)
  const rightCardX = margin + cardWidth + 20; // 308
  page.drawRectangle({
    x: rightCardX,
    y: metaY - cardHeight + 10,
    width: cardWidth,
    height: cardHeight,
    color: rgb(1, 1, 1),
    borderColor: borderGray,
    borderWidth: 0.5,
  });

  page.drawText("DOCUMENT DETAILS", {
    x: rightCardX + 12,
    y: metaY - 5,
    size: 8,
    font: fontBold,
    color: slateLight,
  });

  page.drawText(`Invoice No: ${pdfSafe(input.invoiceNumber)}`, {
    x: rightCardX + 12,
    y: metaY - 21,
    size: 8.5,
    font: font,
    color: textDark,
  });

  page.drawText(`Receipt No: ${pdfSafe(input.receiptNumber)}`, {
    x: rightCardX + 12,
    y: metaY - 35,
    size: 8.5,
    font: font,
    color: textDark,
  });

  page.drawText(`Date: ${formatDate(input.issuedAt)}`, {
    x: rightCardX + 12,
    y: metaY - 49,
    size: 8.5,
    font: font,
    color: textDark,
  });

  const statusLabel = "Status: ";
  const statusLabelW = font.widthOfTextAtSize(statusLabel, 8.5);
  page.drawText(statusLabel, {
    x: rightCardX + 12,
    y: metaY - 63,
    size: 8.5,
    font: font,
    color: textDark,
  });

  page.drawText("PAID", {
    x: rightCardX + 12 + statusLabelW,
    y: metaY - 63,
    size: 8.5,
    font: fontBold,
    color: greenSuccess,
  });

  // 3. Line Items Table
  const tableTopY = metaY - 110;
  const tableHeaderHeight = 22;

  // Teal Table Header Box
  page.drawRectangle({
    x: margin,
    y: tableTopY,
    width: contentWidth,
    height: tableHeaderHeight,
    color: tealAccent,
  });

  // Column Labels
  page.drawText("DESCRIPTION", {
    x: margin + 12,
    y: tableTopY + 7,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  const qtyHeaderX = margin + 345;
  const qtyLabel = "QTY";
  const qtyLabelW = fontBold.widthOfTextAtSize(qtyLabel, 8.5);
  page.drawText(qtyLabel, {
    x: qtyHeaderX - qtyLabelW / 2,
    y: tableTopY + 7,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  const amtHeaderText = "AMOUNT";
  const amtHeaderW = fontBold.widthOfTextAtSize(amtHeaderText, 8.5);
  page.drawText(amtHeaderText, {
    x: width - margin - 12 - amtHeaderW,
    y: tableTopY + 7,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Row Content
  const rowY = tableTopY - 26;
  const isINR = input.currency.toUpperCase() === "INR";
  const totalAmount = input.amountMinor / 100;
  
  // Format period if present
  let periodText = "";
  if (input.periodStart && input.periodEnd) {
    periodText = `Billing Period: ${formatDate(input.periodStart)} to ${formatDate(input.periodEnd)}`;
  }

  // Description
  page.drawText(pdfSafe(input.planLabel), {
    x: margin + 12,
    y: rowY,
    size: 10,
    font: fontBold,
    color: textDark,
  });
  
  page.drawText(pdfSafe(input.description), {
    x: margin + 12,
    y: rowY - 14,
    size: 8.5,
    font: font,
    color: slateLight,
  });

  if (periodText) {
    page.drawText(pdfSafe(periodText), {
      x: margin + 12,
      y: rowY - 26,
      size: 8.5,
      font: fontOblique,
      color: slateLight,
    });
  }

  // Qty (Centered)
  const qtyStr = input.qty.toString();
  const qtyValW = font.widthOfTextAtSize(qtyStr, 9.5);
  page.drawText(qtyStr, {
    x: qtyHeaderX - qtyValW / 2,
    y: rowY,
    size: 9.5,
    font: font,
    color: textDark,
  });

  // Amount (Right aligned)
  const amountStr = `${input.currency.toUpperCase()} ${totalAmount.toFixed(2)}`;
  const amtW = fontBold.widthOfTextAtSize(amountStr, 10);
  page.drawText(amountStr, {
    x: width - margin - 12 - amtW,
    y: rowY,
    size: 10,
    font: fontBold,
    color: textDark,
  });

  // Separator line under line item
  const tableBottomY = rowY - 36;
  page.drawLine({
    start: { x: margin, y: tableBottomY },
    end: { x: width - margin, y: tableBottomY },
    thickness: 0.5,
    color: borderGray,
  });

  // 4. Totals Block (Right Aligned, colored background)
  let currentTotalsY = tableBottomY - 25;
  const buyerState = (input.customerState || "").trim().toLowerCase();
  const isBihar = buyerState === "bihar";
  
  let totalsBoxHeight = 70;
  if (isINR && isBihar) {
    totalsBoxHeight = 85; // Needs extra height for CGST + SGST rows
  }
  
  page.drawRectangle({
    x: rightCardX,
    y: currentTotalsY - totalsBoxHeight + 10,
    width: cardWidth,
    height: totalsBoxHeight,
    color: tealLight,
    borderColor: tealBorder,
    borderWidth: 0.5,
  });

  const drawTotalRow = (label: string, valueStr: string, yPos: number, isBoldText = false) => {
    const valW = (isBoldText ? fontBold : font).widthOfTextAtSize(valueStr, isBoldText ? 9.5 : 8.5);
    page.drawText(label, {
      x: rightCardX + 12,
      y: yPos,
      size: isBoldText ? 9.5 : 8.5,
      font: isBoldText ? fontBold : font,
      color: isBoldText ? tealAccent : slateLight,
    });
    page.drawText(valueStr, {
      x: width - margin - 12 - valW,
      y: yPos,
      size: isBoldText ? 9.5 : 8.5,
      font: isBoldText ? fontBold : font,
      color: isBoldText ? tealAccent : textDark,
    });
  };

  if (isINR) {
    // 18% GST calculation (GST inclusive)
    const taxableValue = totalAmount / 1.18;
    const gstComponent = totalAmount - taxableValue;

    if (isBihar) {
      // Intra-state: CGST 9% + SGST 9%
      const cgst = gstComponent / 2;
      const sgst = gstComponent / 2;
      
      drawTotalRow("Subtotal (Taxable):", `INR ${taxableValue.toFixed(2)}`, currentTotalsY - 5);
      drawTotalRow("CGST (9%):", `INR ${cgst.toFixed(2)}`, currentTotalsY - 20);
      drawTotalRow("SGST (9%):", `INR ${sgst.toFixed(2)}`, currentTotalsY - 35);
      drawTotalRow("Total Paid:", `INR ${totalAmount.toFixed(2)}`, currentTotalsY - 58, true);
    } else {
      // Inter-state: IGST 18%
      drawTotalRow("Subtotal (Taxable):", `INR ${taxableValue.toFixed(2)}`, currentTotalsY - 5);
      drawTotalRow("IGST (18%):", `INR ${gstComponent.toFixed(2)}`, currentTotalsY - 20);
      drawTotalRow("Total Paid:", `INR ${totalAmount.toFixed(2)}`, currentTotalsY - 43, true);
    }
  } else {
    // International: GST 0%
    drawTotalRow("Subtotal:", `${input.currency.toUpperCase()} ${totalAmount.toFixed(2)}`, currentTotalsY - 5);
    drawTotalRow("GST (0%):", `${input.currency.toUpperCase()} 0.00`, currentTotalsY - 20);
    drawTotalRow("Total Paid:", `${input.currency.toUpperCase()} ${totalAmount.toFixed(2)}`, currentTotalsY - 43, true);
  }

  // 5. Payment Reference Details Box
  const totalsBoxBottomY = currentTotalsY - totalsBoxHeight + 10;
  const refBoxHeight = 76;
  const refY = totalsBoxBottomY - refBoxHeight - 25;
  page.drawRectangle({
    x: margin,
    y: refY,
    width: contentWidth,
    height: refBoxHeight,
    color: grayBg,
    borderColor: borderGray,
    borderWidth: 0.5,
  });

  page.drawText("PAYMENT GATEWAY REFERENCE", {
    x: margin + 12,
    y: refY + refBoxHeight - 17,
    size: 8,
    font: fontBold,
    color: slateLight,
  });

  page.drawText(`Gateway: Razorpay Checkout`, {
    x: margin + 12,
    y: refY + refBoxHeight - 32,
    size: 8.5,
    font: font,
    color: textDark,
  });

  page.drawText(`Order ID: ${pdfSafe(input.gatewayOrderId)}`, {
    x: margin + 12,
    y: refY + refBoxHeight - 45,
    size: 8.5,
    font: font,
    color: textDark,
  });

  page.drawText(`Payment ID: ${pdfSafe(input.gatewayPaymentId || "pending")}`, {
    x: margin + 12,
    y: refY + refBoxHeight - 58,
    size: 8.5,
    font: font,
    color: textDark,
  });

  // 6. Legal / Company Footer (Fixed at bottom)
  const footerY = 130;
  
  // Separator line
  page.drawLine({
    start: { x: margin, y: footerY + 15 },
    end: { x: width - margin, y: footerY + 15 },
    thickness: 0.5,
    color: borderGray,
  });

  const drawFooterCenterText = (text: string, yPos: number, isBoldText = false, size = 8) => {
    const f = isBoldText ? fontBold : font;
    const w = f.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - w) / 2,
      y: yPos,
      size,
      font: f,
      color: isBoldText ? textDark : slateLight,
    });
  };

  drawFooterCenterText("ANSH Apps", footerY, true, 10);
  drawFooterCenterText("Built for Bharat, Ready for the World", footerY - 12);
  drawFooterCenterText("Udyam Registration No: UDYAM-BR-23-0127857", footerY - 24);
  drawFooterCenterText("GSTIN: 10DIUPR1358M1ZP", footerY - 36);
  drawFooterCenterText("Support: support@anshapps.com | Website: anshapps.com", footerY - 48);
  drawFooterCenterText("For billing support contact support@anshapps.com", footerY - 60);

  const computerGenText = "This is a computer-generated receipt for your subscription payment. Thank you for choosing ANSH Apps.";
  const cgW = fontOblique.widthOfTextAtSize(computerGenText, 7.5);
  page.drawText(computerGenText, {
    x: (width - cgW) / 2,
    y: footerY - 85,
    size: 7.5,
    font: fontOblique,
    color: slateLight,
  });

  // Save document and return as Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
