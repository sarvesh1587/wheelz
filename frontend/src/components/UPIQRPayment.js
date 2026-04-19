import React, { useState } from "react";
import { paymentAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  QrCodeIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const UPIQRPayment = ({ bookingId, amount, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'pending', 'success', 'failed'

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.createQRCode(bookingId);
      setQrCode(res.data);
      toast.success("QR Code generated! Scan with any UPI app");
      setPaymentStatus("pending");

      // Start checking payment status
      checkPaymentStatus(res.data.qrCodeId);
    } catch (err) {
      console.error("QR generation error:", err);
      toast.error(err.response?.data?.message || "Failed to generate QR Code");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (qrCodeId) => {
    setCheckingStatus(true);

    // Poll for payment status every 3 seconds for up to 5 minutes
    let attempts = 0;
    const maxAttempts = 100; // 100 * 3 seconds = 5 minutes

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await paymentAPI.checkQRStatus(qrCodeId);
        console.log("QR Status check:", res.data);

        // Check if payment is received
        if (
          res.data.status === "closed" ||
          (res.data.paymentsReceived && res.data.paymentsReceived > 0)
        ) {
          clearInterval(interval);
          setPaymentStatus("success");
          setCheckingStatus(false);
          toast.success("Payment received successfully!");
          onSuccess();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setCheckingStatus(false);
          setPaymentStatus("failed");
          toast.error("Payment timeout. Please try again.");
        }
      } catch (err) {
        console.error("Status check error:", err);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setCheckingStatus(false);
        }
      }
    }, 3000); // Check every 3 seconds
  };

  const copyUPILink = () => {
    if (qrCode?.shortUrl) {
      navigator.clipboard.writeText(qrCode.shortUrl);
      toast.success("UPI link copied to clipboard!");
    }
  };

  const regenerateQR = () => {
    setQrCode(null);
    setPaymentStatus(null);
    generateQRCode();
  };

  return (
    <div className="space-y-4">
      {!qrCode ? (
        // Generate QR Button
        <button
          onClick={generateQRCode}
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <QrCodeIcon className="w-5 h-5" />
              Generate QR Code for UPI Payment
            </>
          )}
        </button>
      ) : (
        // QR Code Display
        <div className="text-center space-y-4">
          {/* QR Code Image */}
          <div className="bg-white p-4 rounded-xl inline-block mx-auto shadow-md">
            <img
              src={qrCode.qrImageUrl}
              alt="UPI QR Code"
              className="w-48 h-48 mx-auto"
            />
          </div>

          {/* Payment Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <code className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg font-mono">
                Amount: ₹{amount.toLocaleString()}
              </code>
              <button
                onClick={copyUPILink}
                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                title="Copy UPI link"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Scan with Google Pay, PhonePe, Paytm, or any UPI app
            </p>
          </div>

          {/* Payment Status Indicator */}
          {checkingStatus && (
            <div className="flex items-center justify-center gap-2 text-sm text-amber-500">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Waiting for payment confirmation...</span>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="text-sm text-red-500">
              Payment verification timeout. Please try again.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              onClick={() => window.open(qrCode.shortUrl, "_blank")}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-2 transition font-medium"
            >
              Pay with UPI App
            </button>
          </div>

          {/* Regenerate QR Option */}
          <button
            onClick={regenerateQR}
            className="text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1 mx-auto"
          >
            <ArrowPathIcon className="w-3 h-3" />
            Regenerate QR Code
          </button>
        </div>
      )}

      {/* Footer Note */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <p className="text-xs text-gray-500 text-center">
          🔒 Secure UPI payment powered by Razorpay
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          Payment will be confirmed automatically after successful transaction
        </p>
      </div>
    </div>
  );
};

export default UPIQRPayment;
