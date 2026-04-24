import React, { useState, useEffect } from "react";
import { paymentAPI } from "../services/api";
import toast from "react-hot-toast";

const RazorpayButton = ({ bookingId, amount, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Razorpay script once when component mounts
  useEffect(() => {
    if (window.Razorpay) {
      setIsScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => console.error("Failed to load Razorpay script");
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      toast.error("Payment system is still loading. Please try again.");
      return;
    }

    setLoading(true);
    console.log("Starting payment for booking:", bookingId);

    try {
      // 1. Create an order on YOUR backend
      const orderRes = await paymentAPI.createOrder(bookingId);
      console.log("Order created:", orderRes.data);

      const razorpayKey =
        process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_ShPo542q8R01pa";
      const options = {
        key: razorpayKey, // Using your exact key
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Wheelz",
        description: `Payment for Booking`,
        order_id: orderRes.data.orderId, // The order ID you created in step 1
        handler: async (response) => {
          console.log("Payment Success:", response);
          // Optional: Verify the payment signature on your backend here
          toast.success("Payment successful!");
          onSuccess();
        },
        prefill: {
          name: "Customer Name",
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
      razorpay.open();
    } catch (err) {
      console.error("Payment initialization failed:", err);
      toast.error(
        err.response?.data?.message ||
          "Could not initialize payment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handlePayment}
        disabled={loading || !isScriptLoaded}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₹${amount.toLocaleString()}`
        )}
      </button>
      <button onClick={onCancel} className="w-full btn-secondary">
        Cancel
      </button>
    </div>
  );
};

export default RazorpayButton;
