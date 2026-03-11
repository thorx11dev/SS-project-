import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { Star, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductReviewsProps {
  productId: number;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [newReview, setNewReview] = useState({
    customer_name: '',
    rating: 5,
    comment: ''
  });

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      if (Array.isArray(data)) {
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error(err);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.customer_name.trim()) {
      setError('Name is required');
      return;
    }
    if (!newReview.comment.trim()) {
      setError('Comment is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });

      if (!res.ok) throw new Error('Failed to submit review');

      // Reset form and refresh reviews
      setNewReview({ customer_name: '', rating: 5, comment: '' });
      toast.success('Review submitted successfully!');
      await fetchReviews();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="py-16 border-t border-[var(--color-ink)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Reviews Summary & Form */}
        <div className="lg:col-span-1 space-y-10">
          <div>
            <h2 className="text-4xl font-display font-bold uppercase mb-4">Reviews</h2>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex text-[var(--color-brand-accent)]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={24} 
                    fill={star <= Math.round(averageRating) ? "currentColor" : "none"} 
                    className={star <= Math.round(averageRating) ? "text-[var(--color-brand-accent)]" : "text-[var(--color-ink)]/20"}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="text-2xl font-mono font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-[var(--color-ink)]/50 text-xs font-mono uppercase tracking-widest">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="bg-[var(--color-card)] p-6 border border-[var(--color-ink)]">
            <h3 className="font-bold uppercase tracking-widest text-xs font-mono mb-6">Write a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="text-red-500 text-xs font-mono">{error}</div>}
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 font-mono mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={24} 
                        fill={star <= newReview.rating ? "currentColor" : "none"} 
                        className={star <= newReview.rating ? "text-[var(--color-brand-accent)]" : "text-[var(--color-ink)]/20"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 font-mono mb-2">Name</label>
                <input
                  type="text"
                  value={newReview.customer_name}
                  onChange={(e) => setNewReview({ ...newReview, customer_name: e.target.value })}
                  className="input-field bg-[var(--color-canvas)]"
                  placeholder="YOUR NAME"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 font-mono mb-2">Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="input-field bg-[var(--color-canvas)] min-h-[100px] resize-y"
                  placeholder="SHARE YOUR EXPERIENCE..."
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-[var(--color-ink)] text-[var(--color-canvas)] font-mono font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-brand-accent)] hover:text-[var(--color-ink)] transition-colors border border-[var(--color-ink)]"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
              </button>
            </form>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-10 text-[var(--color-ink)]/50 font-mono text-xs uppercase tracking-widest">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 bg-[var(--color-card)] border border-[var(--color-ink)]">
              <p className="text-[var(--color-ink)]/50 font-mono text-sm">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 border border-[var(--color-ink)] bg-[var(--color-canvas)]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[var(--color-card)] border border-[var(--color-ink)] flex items-center justify-center text-[var(--color-ink)]">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-display font-bold uppercase text-lg leading-none">{review.customer_name}</p>
                        <p className="text-[10px] text-[var(--color-ink)]/50 font-mono uppercase tracking-widest mt-1">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-[var(--color-brand-accent)]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={14} 
                          fill={star <= review.rating ? "currentColor" : "none"} 
                          className={star <= review.rating ? "text-[var(--color-brand-accent)]" : "text-[var(--color-ink)]/20"}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[var(--color-ink)]/80 font-mono text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
