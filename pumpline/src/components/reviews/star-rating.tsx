import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => {
    const filled = i < Math.floor(rating);
    const halfFilled = !filled && i < rating;

    return (
      <Star
        key={i}
        className={cn(
          sizeMap[size],
          filled
            ? "fill-yellow-400 text-yellow-400"
            : halfFilled
              ? "fill-yellow-400/50 text-yellow-400"
              : "fill-gray-200 text-gray-200"
        )}
      />
    );
  });

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
