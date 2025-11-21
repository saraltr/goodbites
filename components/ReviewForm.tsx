"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from './StarRating';

interface ReviewFormProps {
  recipeId: string;
  onReviewSubmit: (newReview: any) => void;
}

export default function ReviewForm({ recipeId, onReviewSubmit }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    if (comment.trim() === '') {
      setError('Please enter a comment.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/recipes/${recipeId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review.');
      }

      const newReview = await response.json();
      onReviewSubmit(newReview);
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="mt-8 p-4 border rounded-lg bg-gray-50 text-center">
        <p>Please <a href="/login" className="text-green-600 hover:underline">log in</a> to leave a review.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Your Rating</label>
          <StarRating rating={rating} setRating={setRating} />
        </div>
        <div className="mb-4">
          <label htmlFor="comment" className="block text-gray-700 mb-2">Your Comment</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded-lg"
            rows={4}
            required
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
