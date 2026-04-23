import React, { useState } from "react";
import { paymentAPI } from "../services/api";
import toast from "react-hot-toast";

const RazorpayButton = ({ bookingId, amount, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to load Razorpay script
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
    setError(null);
    console.log("🚀 Starting payment for booking:", bookingId);

    // 1. Load the script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      const msg =
        "Payment gateway failed to load. Please check your internet connection.";
      toast.error(msg);
      setError(msg);
      setLoading(false);
      return;
    }

    // 2. Get the Razorpay Key ID from the environment
    const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      const msg = "Payment configuration error. Please contact support.";
      console.error("❌ Razorpay key not found!");
      toast.error(msg);
      setError(msg);
      setLoading(false);
      return;
    }
    console.log("🔑 Using Razorpay Key:", razorpayKey);

    // 3. Create an order on your backend
    try {
      console.log("📦 Creating order for amount:", amount);
      const orderRes = await paymentAPI.createOrder(bookingId);
      console.log("✅ Order response:", orderRes.data);

      const { paymentIntent, amount: orderAmount } = orderRes.data;

      // 4. Configure Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: orderAmount,
        currency: "INR",
        name: "Wheelz",
        description: `Payment for Booking ${bookingId.slice(-6)}`,
        order_id: paymentIntent.id,
        handler: async (response) => {
          console.log("💰 Payment success response:", response);
          try {
            // Verify the payment on your backend
            const verifyRes = await paymentAPI.verifyPayment({
              bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success("Payment successful! Your booking is confirmed.");
              onSuccess();
            } else {
              throw new Error("Verification failed on server.");
            }
          } catch (err) {
            console.error("❌ Verification error:", err);
            toast.error(
              "Payment could not be verified. Please contact support.",
            );
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#f59e0b", // Wheelz orange color
        },
        modal: {
          ondismiss: () => {
            console.log("🛑 Payment modal closed by user.");
            setLoading(false);
            toast.error("Payment cancelled.");
            onCancel();
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("💥 Razorpay Payment Failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      razorpay.open();
    } catch (err) {
      console.error("🔥 Payment initialization error:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Could not initialize payment. Please try again.";
      toast.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Initializing Payment...
          </>
        ) : (
          `Pay ₹${amount.toLocaleString()} via Card/UPI`
        )}
      </button>
      {error && (
        <div className="text-center text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          ⚠️ {error}
        </div>
      )}
      <button onClick={onCancel} className="w-full btn-secondary">
        Cancel
      </button>
    </div>
  );
};

export default RazorpayButton;
