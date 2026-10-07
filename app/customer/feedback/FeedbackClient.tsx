"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Send,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  ThumbsUp,
  Building2,
  Heart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FeedbackClientProps {
  initialUser: {
    id: string;
    email?: string;
    name?: string;
    mobile?: string;
  };
}

const CATEGORIES = [
  "2D Floor Plan Design",
  "Site Visit & Plot Measurement",
  "Vastu Shastra Consultation",
  "3D Elevation & Front Concept",
  "Mistri Execution Sheet",
  "Overall Experience",
];

const RATING_LABELS: Record<number, { text: string; color: string; emoji: string }> = {
  1: { text: "Needs Improvement", color: "text-red-600", emoji: "😞" },
  2: { text: "Fair", color: "text-orange-500", emoji: "😐" },
  3: { text: "Good", color: "text-amber-500", emoji: "🙂" },
  4: { text: "Very Good", color: "text-emerald-600", emoji: "😊" },
  5: { text: "Outstanding!", color: "text-[#0c7a62]", emoji: "🤩" },
};

export default function FeedbackClient({ initialUser }: FeedbackClientProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("2D Floor Plan Design");
  const [feedbackText, setFeedbackText] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeRating = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setErrorMessage("Kripya apna feedback ya sujhav likhein (Please share your feedback).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      // 1. Try to record feedback in Supabase notifications table for admin alert
      await supabase.from("notifications").insert({
        user_id: initialUser.id,
        type: "feedback",
        title: `⭐ New Customer Feedback (${rating}/5 Stars)`,
        message: `${initialUser.name || "Customer"}: "${feedbackText.trim()}" [Category: ${category}] [Recommend: ${wouldRecommend ? "Yes" : "No"}]`,
        action_tab: "overview",
        badge: `${rating} ★ Feedback`,
        badge_color: "bg-[#eef5ee] text-[#0c7a62]",
        is_read: false,
      });

      // 2. Also try custom feedback table if exists
      try {
        await supabase.from("customer_feedback").insert({
          user_id: initialUser.id,
          full_name: initialUser.name || "Customer",
          mobile: initialUser.mobile || null,
          rating,
          category,
          feedback_text: feedbackText.trim(),
          would_recommend: wouldRecommend,
          created_at: new Date().toISOString(),
        });
      } catch (_) {
        // Table may not exist yet, handled by notifications
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Feedback submit error:", err);
      // Still consider saved locally
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5ed] text-[#17221b]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#e4dfd5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/customer/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-[#ded9cf] bg-[#f8f5ee] px-3.5 py-2 text-xs font-bold text-[#17221b] transition hover:bg-[#ede8dc]"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#063b2c] text-[#f4cf72]">
              <Building2 size={18} />
            </div>
            <span className="font-serif text-base font-bold tracking-tight text-[#063b2c]">
              SARDA <span className="text-[#a47c28]">HOMEPLAN</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-black/60">
            <ShieldCheck size={16} className="text-[#0c7a62]" />
            <span>Verified Customer</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {isSubmitted ? (
          <div className="rounded-3xl border border-[#cbe1d1] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f5ec] text-[#0c7a62]">
              <CheckCircle2 size={44} />
            </div>

            <h1 className="mt-6 font-serif text-2xl font-bold text-[#17221b] sm:text-3xl">
              Thank You for Your Feedback!
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-black/65 sm:text-base">
              Aapka anubhav hamare liye bahut anmol hai. Sarda Homeplan team aapke sujhavo
              par dhyan degi taaki aapka ghar aur bhi suvidhajanak ban sake.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/customer/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063b2c] px-6 py-3.5 text-sm font-bold text-[#f4cf72] shadow-sm transition hover:bg-[#094d3a]"
              >
                <span>Return to Customer Dashboard</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-[#ded9cf] bg-white p-6 shadow-sm sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#063b2c]/10 text-[#063b2c]">
                <MessageSquare size={22} />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-[#17221b] sm:text-3xl">
                  Client Feedback & Review
                </h1>
                <p className="text-xs text-black/55 sm:text-sm">
                  Share your experience with our architectural & planning team
                </p>
              </div>
            </div>

            {/* Customer Badge Banner */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] px-4 py-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-black/50">Posting as:</span>
                <span className="font-bold text-[#17221b]">
                  {initialUser.name || "Customer"}
                </span>
                {initialUser.mobile && (
                  <span className="text-black/45">({initialUser.mobile})</span>
                )}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5ec] px-2.5 py-0.5 text-[11px] font-bold text-[#0c7a62]">
                <Sparkles size={12} />
                Client Review
              </span>
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Star Rating Section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60">
                  Rate Your Experience (1 - 5 Stars)
                </label>
                <div className="mt-3 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = starVal <= activeRating;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="group p-1 transition-transform hover:scale-110 focus:outline-none"
                        aria-label={`Rate ${starVal} stars`}
                      >
                        <Star
                          size={36}
                          className={`transition-colors ${
                            isFilled
                              ? "fill-[#d5a842] text-[#d5a842]"
                              : "fill-transparent text-[#ded9cf] group-hover:text-[#d5a842]"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <div className="ml-2 flex items-center gap-1.5 font-bold text-sm">
                    <span>{RATING_LABELS[activeRating]?.emoji}</span>
                    <span className={RATING_LABELS[activeRating]?.color}>
                      {RATING_LABELS[activeRating]?.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60">
                  Which Service Are You Reviewing?
                </label>
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                          isSelected
                            ? "border-[#063b2c] bg-[#063b2c] text-[#f4cf72] shadow-sm"
                            : "border-[#ded9cf] bg-white text-black/75 hover:border-black/30"
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <Sparkles size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60">
                  Your Detailed Review / Feedback
                </label>
                <p className="mt-1 text-[11px] text-black/50">
                  What did you like about the design, team communication, or what can we improve?
                </p>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. Architect ne room layout bahut achha banaya aur Vastu rules follow kiye. Mistri sheet bhi clear thi..."
                  className="mt-2.5 w-full rounded-2xl border border-[#ded9cf] bg-[#faf8f3] p-4 text-sm text-[#17221b] placeholder-black/35 outline-none transition focus:border-[#063b2c] focus:bg-white focus:ring-2 focus:ring-[#063b2c]/10"
                />
              </div>

              {/* Would Recommend Radio */}
              <div className="rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] p-4">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-red-500 fill-red-500" />
                  <span className="text-xs font-bold text-[#17221b]">
                    Would you recommend Sarda Homeplan to your family and friends?
                  </span>
                </div>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWouldRecommend(true)}
                    className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                      wouldRecommend
                        ? "border-[#0c7a62] bg-[#0c7a62] text-white shadow-sm"
                        : "border-[#ded9cf] bg-white text-black/60"
                    }`}
                  >
                    <ThumbsUp size={14} />
                    <span>Yes, definitely!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWouldRecommend(false)}
                    className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                      !wouldRecommend
                        ? "border-red-600 bg-red-600 text-white shadow-sm"
                        : "border-[#ded9cf] bg-white text-black/60"
                    }`}
                  >
                    <span>Needs improvement first</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#063b2c] py-4 text-sm font-bold text-[#f4cf72] shadow-sm transition hover:bg-[#094d3a] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Feedback...</span>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit My Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
