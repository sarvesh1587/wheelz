import React from "react";
import html2pdf from "html2pdf.js";
import { Download } from "lucide-react";
import { Modal } from "./ui";

// The receipt body is rendered to PDF, so it stays a light paper sheet
// with fixed colours regardless of the site theme.
const ReceiptRow = ({ label, children }) => (
  <div className="flex justify-between gap-4 border-b border-black/10 py-2.5 text-sm last:border-0">
    <span className="text-[#6F6D68]">{label}</span>
    <span className="text-right text-[#111112]">{children}</span>
  </div>
);

const PaymentReceipt = ({ booking, onClose }) => {
  const downloadPDF = () => {
    const element = document.getElementById("receipt-content");
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Wheelz_Receipt_${booking.bookingRef}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  if (!booking) return null;

  return (
    <Modal open onClose={onClose} eyebrow="Receipt" title="Payment receipt" size="lg">
      <div id="receipt-content" className="rounded-[20px] bg-white p-6 text-[#111112] md:p-8">
        <div className="mb-8 flex items-end justify-between border-b border-black/10 pb-6">
          <div>
            <p className="display text-3xl">Wheelz</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6F6D68]">
              Premium Vehicle Rentals
            </p>
          </div>
          <span className="rounded-full bg-[#111112] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white">
            Paid
          </span>
        </div>

        <ReceiptRow label="Booking ID">
          <span className="font-mono font-semibold">{booking.bookingRef}</span>
        </ReceiptRow>
        <ReceiptRow label="Payment date">{new Date().toLocaleString()}</ReceiptRow>

        <p className="mb-1 mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6F6D68]">Customer</p>
        <ReceiptRow label="Name">{booking.user?.name}</ReceiptRow>
        <ReceiptRow label="Email">{booking.user?.email}</ReceiptRow>

        <p className="mb-1 mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6F6D68]">Vehicle</p>
        <ReceiptRow label="Vehicle">{booking.vehicle?.name}</ReceiptRow>
        <ReceiptRow label="Brand">{booking.vehicle?.brand}</ReceiptRow>
        <ReceiptRow label="Year">{booking.vehicle?.year}</ReceiptRow>

        <p className="mb-1 mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6F6D68]">Rental</p>
        <ReceiptRow label="Pickup date">{new Date(booking.startDate).toLocaleDateString()}</ReceiptRow>
        <ReceiptRow label="Return date">{new Date(booking.endDate).toLocaleDateString()}</ReceiptRow>
        <ReceiptRow label="Duration">{booking.totalDays} days</ReceiptRow>
        <ReceiptRow label="Pickup location">{booking.pickupLocation}</ReceiptRow>

        <div className="mt-8 flex items-end justify-between border-t-2 border-[#111112] pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6F6D68]">Total amount</span>
          <span className="display text-4xl">₹{booking.finalAmount.toLocaleString()}</span>
        </div>

        <div className="mt-10 text-xs text-[#6F6D68]">
          <p>Thank you for choosing Wheelz.</p>
          <p>support@wheelz.com | +91 98765 43210</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={downloadPDF} className="btn-primary flex-1">
          <Download size={16} /> Download PDF
        </button>
        <button onClick={onClose} className="btn-ghost flex-1">
          Close
        </button>
      </div>
    </Modal>
  );
};

export default PaymentReceipt;
