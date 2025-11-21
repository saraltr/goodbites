"use client";

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | any; // Firestore timestamp can be complex
}

interface ReviewListProps {
  reviews: Review[];
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <span key={index} className={`text-xl ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Reviews</h3>
        <p>No reviews yet. Be the first to leave a review!</p>
      </div>
    );
  }

  const formatDate = (timestamp: Review['createdAt']) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    return 'Just now'; // Fallback for new reviews before page refresh
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Reviews</h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">{review.userName}</p>
              <StarDisplay rating={review.rating} />
            </div>
            <p className="text-gray-700">{review.comment}</p>
            <p className="text-sm text-gray-500 mt-2">{formatDate(review.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
