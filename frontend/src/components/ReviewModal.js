import React, { useState } from "react";
import { Star } from "lucide-react";
import { Modal, Spinner } from "./ui";
import { reviewAPI } from "../services/api";
import toast from "react-hot-toast";

export default function ReviewModal({
  isOpen,
  onClose,
  vehicle,
  onReviewSubmitted,
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
      const response = await reviewAPI.create({
        vehicleId: vehicle._id,
        rating,
        title: title || "",
        comment: comment.trim(),
      });

      console.log("Review response:", response.data);

      if (response.data.success) {
        toast.success("Review submitted successfully!");

        // Callback to refresh reviews
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }

        // Close modal and reset form
        onClose();
        setRating(0);
        setTitle("");
        setComment("");
      }
    } catch (error) {
      console.error("Review error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} eyebrow={`Reviewing · ${vehicle?.name || ""}`} title="Write a review" size="md">
      <form onSubmit={handleSubmit}>
        <p className="field-label mb-3">Your rating</p>
        <div className="mb-8 flex gap-2" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={32}
                strokeWidth={1.5}
                className={(hoverRating || rating) >= star ? "fill-accent text-accent" : "text-line/25"}
              />
            </button>
          ))}
        </div>

        <div className="mb-8">
          <label className="field-label">Review title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Amazing experience!"
            className="field"
          />
        </div>

        <div className="mb-8">
          <label className="field-label">Your review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share your experience…"
            className="field resize-none"
            required
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full !py-4">
          {submitting ? (
            <>
              <Spinner /> Submitting…
            </>
          ) : (
            "Submit review"
          )}
        </button>
      </form>
    </Modal>
  );
}
