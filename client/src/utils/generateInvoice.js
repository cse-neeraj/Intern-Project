import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { assets } from "../assets/assets";

export const generateInvoice = async (
  order,
  currency = "₹",
  action = "download",
  store = null,
) => {
  const doc = new jsPDF();

  // Fix: Standard PDF fonts don't support '₹', so we use 'Rs.' instead
  const currencySymbol = currency === "₹" ? "Rs." : currency;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const rightMargin = pageWidth - margin;

  // Colors
  const primaryColor = [34, 197, 94]; // Green-500
  const secondaryColor = [55, 65, 81]; // Gray-700
  const darkGray = [31, 41, 55]; // Gray-800
  const lightGray = [229, 231, 235]; // Gray-200

  // Helper to load image
  const loadImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
  };

  // Add Logo
  try {
    const logo = await loadImage(assets.logo);
    if (logo) {
      doc.addImage(logo, "PNG", margin, 15, 25, 25);
    }
  } catch (error) {
    console.warn("Logo could not be loaded", error);
  }

  // Company Info (Left, under logo)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text("BuyFresh", margin, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);

  const storeAddress = store?.address || "123 Grocery St, Fresh City, FC 12345";
  const storeEmail = store?.email || "support@buyfresh.com";
  const storePhone = store?.phone || "+1 234 567 890";

  doc.text(storeAddress, margin, 56);
  doc.text(storeEmail, margin, 61);
  doc.text(storePhone, margin, 66);

  // Invoice Info (Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text("INVOICE", rightMargin, 25, { align: "right" });

  // Invoice Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);

  const invoiceDetails = [
    { label: "Invoice #:", value: order._id.slice(-6).toUpperCase() },
    { label: "Date:", value: new Date(order.createdAt).toLocaleDateString() },
    { label: "Status:", value: order.isPaid ? "Paid" : "Unpaid" },
  ];

  let detailY = 35;
  invoiceDetails.forEach((detail) => {
    doc.text(detail.label, rightMargin - 35, detailY, { align: "left" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text(detail.value, rightMargin, detailY, { align: "right" });
    
    // Reset for next row
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkGray);
    detailY += 5;
  });

  // Divider
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.line(margin, 75, rightMargin, 75);

  // Bill To (Left)
  let billToY = 85;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.text("Bill To:", margin, billToY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  billToY += 6;

  const address = order.address || {};
  doc.text(`${address.firstName || "Guest"} ${address.lastName || ""}`, margin, billToY);
  doc.text(address.street || "", margin, billToY + 5);
  doc.text(`${address.city || ""}, ${address.state || ""} ${address.zipCode || ""}`, margin, billToY + 10);
  doc.text(address.phone || "", margin, billToY + 15);

  // Table
  const tableColumn = ["#", "Item", "Qty", "Unit Price", "Total"];
  const tableRows = [];

  order.items.forEach((item, index) => {
    const price = item.price || 0;
    const total = price * item.quantity;
    const itemData = [
      index + 1,
      item.name,
      item.quantity,
      `${currencySymbol} ${price.toFixed(2)}`,
      `${currencySymbol} ${total.toFixed(2)}`,
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    startY: billToY + 25,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: { 
      fillColor: primaryColor, 
      textColor: 255, 
      fontStyle: "bold",
      halign: "left",
      cellPadding: 4 
    },
    styles: { 
      fontSize: 10, 
      cellPadding: 4, 
      textColor: secondaryColor,
      valign: "middle",
      overflow: "linebreak"
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: "auto", halign: "left" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  const totalAmount = order.amount || 0;

  // Draw line above total
  doc.setDrawColor(...lightGray);
  doc.line(rightMargin - 60, finalY, rightMargin, finalY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...darkGray);
  doc.text("Grand Total", rightMargin - 60, finalY + 8, { align: "left" });
  doc.text(`${currencySymbol} ${totalAmount.toFixed(2)}`, rightMargin, finalY + 8, { align: "right" });

  // Footer
  const footerY = pageHeight - 20;
  doc.setDrawColor(...lightGray);
  doc.line(margin, footerY - 5, rightMargin, footerY - 5);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text("Thank you for shopping with BuyFresh!", pageWidth / 2, footerY, { align: "center" });
  doc.text("For support, email us at support@buyfresh.com", pageWidth / 2, footerY + 5, { align: "center" });

  // Output
  if (action === "print") {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  } else {
    doc.save(`invoice_${order._id}.pdf`);
  }
};