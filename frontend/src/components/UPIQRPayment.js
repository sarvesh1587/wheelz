import React, { useState } from "react";
import { paymentAPI } from "../services/api";
import toast from "react-hot-toast";

const UPIQRPayment = ({ bookingId, amount, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  const generateQRCode = async () => {
    console.log("Generating QR code for booking:", bookingId);
    setLoading(true);
    try {
      const res = await paymentAPI.createQRCode(bookingId);
      console.log("QR Code response:", res.data);
      setQrCode(res.data);
      toast.success("QR Code generated! Scan with any UPI app");
    } catch (err) {
      console.error("QR generation error:", err);
      toast.error(err.response?.data?.message || "Failed to generate QR Code");
    } finally {
      setLoading(false);
    }
  };

  if (!qrCode) {
    return (
      <div className="space-y-3">
        <button
          onClick={generateQRCode}
          disabled={loading}
          className="w-full bg-ink text-canvas hover:bg-accent hover:text-accent-ink py-3 rounded-xl font-semibold transition"
        >
          {loading ? "Generating..." : "Generate QR Code for UPI Payment"}
        </button>
        <button onClick={onCancel} className="w-full btn-secondary">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="bg-surface p-4 rounded-xl inline-block mx-auto border border-line/10">
        <img
          src={qrCode.qrImageUrl}
          alt="UPI QR Code"
          className="w-48 h-48 mx-auto"
        />
      </div>

      <div className="bg-raised p-3 rounded-xl">
        <p className="text-sm font-medium text-accent">
          Amount: ₹{amount.toLocaleString()}
        </p>
        <p className="text-xs text-muted mt-1">
          Scan with Google Pay, PhonePe, Paytm, or any UPI app
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 btn-secondary">
          Cancel
        </button>
        <button
          onClick={() => window.open(qrCode.shortUrl, "_blank")}
          className="flex-1 bg-ink text-canvas hover:bg-accent hover:text-accent-ink rounded-xl py-2 transition"
        >
          Pay with UPI App
        </button>
      </div>

      <button
        onClick={() => {
          setQrCode(null);
          generateQRCode();
        }}
        className="text-xs text-accent hover:underline"
      >
        Regenerate QR Code
      </button>
    </div>
  );
};

export default UPIQRPayment;
