export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initRazorpayPayment = async (options) => {
  const isScriptLoaded = await loadRazorpayScript();

  if (!isScriptLoaded) {
    throw new Error("Razorpay SDK failed to load");
  }

  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: options.amount,
      currency: "INR",
      name: "Wheelz",
      description: options.description,
      order_id: options.orderId,
      handler: (response) => {
        resolve(response);
      },
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: {
        color: "#f59e0b",
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment cancelled by user"));
        },
      },
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
  });
};
