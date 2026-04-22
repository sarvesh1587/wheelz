import BookingConfirmationModal from "../components/BookingConfirmationModal";

// Add state for modal
const [showConfirmationModal, setShowConfirmationModal] = useState(false);
const [confirmedBooking, setConfirmedBooking] = useState(null);

// Update handleCreateBooking function
const handleCreateBooking = async () => {
  if (!startDate || !endDate) {
    toast.error("Please select dates");
    return;
  }
  if (!availability?.isAvailable) {
    toast.error("Vehicle not available for selected dates");
    return;
  }

  setCreatingBooking(true);
  try {
    const res = await bookingAPI.create({
      vehicleId: id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      pickupLocation: vehicle.locationName,
      extras,
    });

    setCreatedBooking(res.data.booking);

    // Process payment automatically (mock payment)
    await paymentAPI.confirm(res.data.booking._id, "mock");

    // Show confirmation modal instead of navigating away
    setConfirmedBooking(res.data.booking);
    setShowConfirmationModal(true);

    toast.success("Booking confirmed!");
  } catch (err) {
    toast.error(err.response?.data?.message || "Booking failed");
  } finally {
    setCreatingBooking(false);
  }
};

// Add modal at the end of return (before closing divs)
{
  showConfirmationModal && (
    <BookingConfirmationModal
      booking={confirmedBooking}
      onClose={() => {
        setShowConfirmationModal(false);
        navigate("/dashboard");
      }}
    />
  );
}
