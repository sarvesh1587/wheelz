import React, { useState } from "react";
import { paymentAPI } from "../services/api";
import toast from "react-hot-toast";

const RazorpayButton = ({ bookingId, amount, onSuccess, onCancel }) => {
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
    console.log("Starting payment for booking:", bookingId);

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error("Failed to load payment gateway");
      setLoading(false);
      return;
    }

    try {
      console.log("Creating order for amount:", amount);

      // Create order on backend
      const orderRes = await paymentAPI.createOrder(bookingId);
      console.log("Order response:", orderRes.data);

      const { orderId, amount: orderAmount, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: orderAmount,
        currency: "INR",
        name: "Wheelz",
        description: `Booking Payment`,
        order_id: orderId,
        handler: async (response) => {
          console.log("Payment response:", response);
          try {
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
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#f59e0b",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled");
            onCancel();
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        toast.error("Payment failed: " + response.error.description);
        setLoading(false);
      });
      razorpay.open();
    } catch (err) {
      console.error("Payment initialization error:", err);
      toast.error(
        err.response?.data?.message || "Failed to initialize payment",
      );
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
            Initializing...
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
