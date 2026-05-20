import React, { useState } from "react";
import { paymentAPI } from "../services/api";
import toast from "react-hot-toast";

export default function RazorpayButton({ bookingId, amount, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
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
        key: orderData.keyId, // ✅ Now this will have the correct value
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Wheelz",
        description: `Booking: ${bookingId}`,
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
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: localStorage.getItem("user_name") || "",
          email: localStorage.getItem("user_email") || "",
          contact: localStorage.getItem("user_phone") || "",
        },
        theme: {
          color: "#f59e0b",
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
      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        `Pay ₹${amount.toLocaleString()}`
      )}
    </button>
  );
}
