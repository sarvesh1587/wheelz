import React, { useState } from "react";
import { paymentAPI } from "../services/api";
import toast from "react-hot-toast";

const RazorpayButton = ({ bookingId, amount, onSuccess, onCancel }) => {
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

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error("Failed to load payment gateway");
      setLoading(false);
      return;
    }

    try {
      // Create order on backend
      const orderRes = await paymentAPI.createOrder(bookingId);
      const { orderId, amount: orderAmount, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: orderAmount,
        currency: "INR",
        name: "Wheelz",
        description: `Booking #${bookingId.slice(-6)}`,
        order_id: orderId,
        handler: async (response) => {
          // Verify payment
          const verifyRes = await paymentAPI.verifyPayment({
            bookingId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (verifyRes.data.success) {
            toast.success("Payment successful!");
            onSuccess();
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
        },
        theme: {
          color: "#f59e0b",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          `Pay ₹${amount.toLocaleString()} via Razorpay`
        )}
      </button>
      <button onClick={onCancel} className="w-full btn-secondary">
        Cancel
      </button>
    </div>
  );
};

export default RazorpayButton;
