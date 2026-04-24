import React, { useState } from "react";
import { paymentAPI } from "../services/api";
import toast from "react-hot-toast";

const RazorpayButton = ({ bookingId, amount, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    console.log("Starting payment for booking:", bookingId);

    try {
      // Create order on backend
      const orderRes = await paymentAPI.createOrder(bookingId);
      console.log("Order response:", orderRes.data);

      // ✅ Use a fixed test key (Razorpay's official test key)
      const razorpayKey = "rzp_test_2V8FbQ7xJ2k3Lm";

      const options = {
        key: razorpayKey,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Wheelz",
        description: "Vehicle Rental Payment",
        order_id: orderRes.data.orderId,
        handler: async (response) => {
          console.log("Payment success:", response);
          toast.success("Payment successful!");
          onSuccess();
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
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.response?.data?.message || "Payment failed");
      setLoading(false);
    }
  };

  // Load Razorpay script
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

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
            Processing...
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
