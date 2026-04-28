import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { reviewAPI } from "../services/api";
import toast from "react-hot-toast";

export default function ReviewModal({
  isOpen,
  onClose,
  vehicle,
  onSubmitSuccess,
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    setSubmitting(true);
    try {
      await reviewAPI.create({
        vehicleId: vehicle._id,
        rating,
        title: title || undefined,
        comment,
      });

      toast.success("Review submitted successfully! 🎉");
      onSubmitSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Review error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setComment("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Write a Review</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-white/80 text-sm mt-1">
                Reviewing: {vehicle?.name}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Rating Stars */}
              <div className="text-center">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      {(hoverRating || rating) >= star ? (
                        <StarSolid className="w-8 h-8 text-amber-500" />
                      ) : (
                        <StarIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      )}
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    {rating === 5 && "🌟 Excellent! Loved it!"}
                    {rating === 4 && "👍 Very Good!"}
                    {rating === 3 && "😐 Good, but could be better"}
                    {rating === 2 && "😕 Not satisfied"}
                    {rating === 1 && "😡 Very Poor"}
                  </p>
                )}
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Review Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Amazing experience!"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this vehicle..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Verified Badge */}
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-green-700 dark:text-green-400">
                  ✅ Verified Booking - You can only review vehicles you've
                  booked and paid for
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
