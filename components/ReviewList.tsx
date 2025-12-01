"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
// import Modal from "./Modal";
import ReviewForm from "./ReviewForm";
import { Button, Modal } from "antd";

interface Review {
  id: string;
  userId: string | null;
  recipeId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt:
    | {
        seconds: number;
        nanoseconds: number;
      }
    | string;
}

interface ReviewListProps {
  reviews: Review[];
  recipeId: string;
  onReviewUpdate: (updatedReview: Review) => void;
  onReviewDelete: (reviewId: string) => void;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={`text-xl ${
            index < rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ReviewList({
  reviews,
  recipeId,
  onReviewUpdate,
  onReviewDelete,
}: ReviewListProps) {
  const { user } = useAuth();
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  const handleEdit = (review: Review) => {
    setEditingReview(review);
  };

  const handleDelete = async () => {
    if (!deletingReview) return;

    try {
      const response = await fetch(`/api/reviews/${deletingReview.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      onReviewDelete(deletingReview.id);
      setDeletingReview(null);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleUpdateReview = (updatedReview: Review) => {
    console.log("Updated Review:", updatedReview);
    onReviewUpdate(updatedReview);
    setEditingReview(null);
  };

  const formatDate = (timestamp: Review["createdAt"]) => {
    if (typeof timestamp === "object" && timestamp && "seconds" in timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    return "Just now";
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-primary">Reviews</h3>
        <p className="text-black">
          No reviews yet. Be the first to leave a review!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl text-primary font-semibold mb-4">Reviews</h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-center mb-2">
              <p className="text-primary font-semibold">{review.userName}</p>
              <StarDisplay rating={review.rating} />
            </div>
            <p className="text-gray-700">{review.comment}</p>
            <p className="text-sm text-gray-500 mt-2">
              {formatDate(review.createdAt)}
            </p>
            {user && user.uid === review.userId && (
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="primary"
                  onClick={() => handleEdit(review)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Edit
                </Button>
                <Button
                  type="primary"
                  danger
                  onClick={() => setDeletingReview(review)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        open={!!editingReview}
        title=""
        onCancel={() => setEditingReview(null)}
        footer={null}
      >
        <ReviewForm
          recipeId={recipeId}
          existingReview={editingReview}
          onReviewSubmit={handleUpdateReview}
          onCancel={() => setEditingReview(null)}
        />
      </Modal>

      <Modal
        open={!!deletingReview}
        onCancel={() => setDeletingReview(null)}
        title="Delete Review"
        onOk={handleDelete}
      >
        <p>Are you sure you want to delete this review?</p>
      </Modal>
    </div>
  );
}
