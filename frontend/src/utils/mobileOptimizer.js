const handleCreateBooking = async () => {
  if (!startDate || !endDate) {
    toast.error("Please select both pickup and return dates");
    return;
  }

  if (availability && !availability.isAvailable) {
    toast.error("Vehicle not available for selected dates");
    return;
  }

  setCreatingBooking(true);

  // ✅ Show loading with timeout warning
  const loadingToast = toast.loading("Creating booking...", {
    duration: 10000,
  });

  // ✅ Set timeout for booking request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const bookingData = {
      vehicleId: id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      pickupLocation: vehicle?.locationName || vehicle?.city,
      extras: extras,
    };

    const res = await bookingAPI.create(bookingData, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    toast.dismiss(loadingToast);
    toast.success("Booking confirmed! 🎉");

    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  } catch (err) {
    clearTimeout(timeoutId);
    toast.dismiss(loadingToast);

    if (err.name === "AbortError" || err.message?.includes("timeout")) {
      toast.error(
        "Server is busy. Your booking is being processed. Please check your dashboard.",
      );
      // Still navigate to dashboard to let user check
      setTimeout(() => navigate("/dashboard"), 2000);
    } else {
      toast.error(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    }
  } finally {
    setCreatingBooking(false);
  }
};
