import React, { useState } from "react";
import { paymentAPI } from "../services/api";
import toast from "react-hot-toast";

export default function RazorpayButton({ bookingId, amount, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Payment system is loading. Please try again.");
        setLoading(false);
        return;
      }

      // Create order on backend
      const orderRes = await paymentAPI.createOrder(bookingId);
      const orderData = orderRes.data;

      console.log("Order Data:", orderData);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Wheelz",
        description: `Booking #${bookingId.slice(-8)}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await paymentAPI.verifyPayment({
              bookingId: bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success("Payment successful!");
              if (onSuccess) onSuccess();
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: localStorage.getItem("user_name") || "",
          email: localStorage.getItem("user_email") || "",
          contact: localStorage.getItem("user_phone") || "",
        },
        theme: {
          color: "#F59E0B",
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error.response?.data?.message || "Payment failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="btn-primary w-full !py-4"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading…
        </>
      ) : (
        `Pay ₹${amount.toLocaleString()}`
      )}
    </button>
  );
}
