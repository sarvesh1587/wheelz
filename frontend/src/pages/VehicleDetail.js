<div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
  <div className="flex items-end gap-3 mb-4">
    <div>
      <span className="text-3xl font-bold text-gray-900 dark:text-white">
        ₹{(vehicle.currentPrice || vehicle.basePrice).toLocaleString()}
      </span>
      <span className="text-gray-500 text-sm">/day</span>
    </div>
    {isPeak && (
      <div className="text-sm">
        <span className="line-through text-gray-400">
          ₹{vehicle.basePrice.toLocaleString()}
        </span>
        <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-lg">
          🔥 Peak Pricing
        </span>
      </div>
    )}
  </div>

  <div className="flex items-center gap-2 mb-4">
    <div
      className={`w-2.5 h-2.5 rounded-full ${vehicle.isAvailable ? "bg-green-500" : "bg-red-500"}`}
    />
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {vehicle.isAvailable ? "Available Now" : "Currently Unavailable"}
    </span>
  </div>

  {vehicle.isAvailable ? (
    <>
      <button
        onClick={() =>
          isAuthenticated ? navigate(`/book/${id}`) : navigate("/login")
        }
        className="w-full btn-primary flex items-center justify-center gap-2 mb-3"
      >
        <CalendarDaysIcon className="w-5 h-5" />
        {isAuthenticated ? "Book Now" : "Login to Book"}
      </button>

      {/* ✅ Call Vendor Button */}
      <button
        onClick={callVendor}
        className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 font-medium"
      >
        <PhoneIcon className="w-5 h-5" />
        Call Vendor for Details
      </button>

      <p className="text-xs text-gray-500 text-center mt-2">
        📞 Call vendor to confirm availability or ask questions
      </p>
    </>
  ) : (
    <button
      disabled
      className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
    >
      Not Available
    </button>
  )}
</div>;
