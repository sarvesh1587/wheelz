import React from "react";
import html2pdf from "html2pdf.js";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold">Payment Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div id="receipt-content" className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-gray-900">W</span>
            </div>
            <h2 className="text-2xl font-bold">Wheelz</h2>
            <p className="text-gray-500">Premium Vehicle Rentals</p>
          </div>

          <div className="border-t border-b py-4 my-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-mono font-bold">{booking.bookingRef}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Payment Date:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="text-green-600 font-semibold">✓ Paid</span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Customer Details</h3>
            <p>
              <strong>Name:</strong> {booking.user?.name}
            </p>
            <p>
              <strong>Email:</strong> {booking.user?.email}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Vehicle Details</h3>
            <p>
              <strong>Vehicle:</strong> {booking.vehicle?.name}
            </p>
            <p>
              <strong>Brand:</strong> {booking.vehicle?.brand}
            </p>
            <p>
              <strong>Year:</strong> {booking.vehicle?.year}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Rental Details</h3>
            <p>
              <strong>Pickup Date:</strong>{" "}
              {new Date(booking.startDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Return Date:</strong>{" "}
              {new Date(booking.endDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Duration:</strong> {booking.totalDays} days
            </p>
            <p>
              <strong>Pickup Location:</strong> {booking.pickupLocation}
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-4">
            <div className="flex justify-between font-bold">
              <span>Total Amount:</span>
              <span className="text-amber-500">
                ₹{booking.finalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-center text-gray-400 text-xs mt-6">
            <p>Thank you for choosing Wheelz!</p>
            <p>support@wheelz.com | +91 98765 43210</p>
          </div>
        </div>

        <div className="p-6 border-t flex gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
          <button onClick={downloadPDF} className="flex-1 btn-primary">
            📄 Download PDF
          </button>
          <button onClick={onClose} className="flex-1 btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
