"use client";

import { Star } from "lucide-react";
import { RESTAURANT_RATING_MAX, RESTAURANT_RATING_MIN } from "@/lib/constants/restaurants";
import { cn } from "@/lib/utils";

interface RestaurantStarRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  className?: string;
}

export function RestaurantStarRating({
  value,
  onChange,
  size = "md",
  className,
}: RestaurantStarRatingProps) {
  const interactive = typeof onChange === "function";
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} role="img">
      {Array.from({ length: RESTAURANT_RATING_MAX }, (_, index) => {
        const starValue = index + 1;
        const filled = value !== null && starValue <= value;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange(starValue)}
              className={cn(
                "cursor-pointer rounded-none p-0.5 transition-colors",
                filled ? "text-amber-500" : "text-muted-foreground/40 hover:text-amber-400"
              )}
              aria-label={`${starValue}`}
            >
              <Star className={cn(iconSize, filled && "fill-current")} />
            </button>
          );
        }

        return (
          <Star
            key={starValue}
            className={cn(
              iconSize,
              filled ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"
            )}
          />
        );
      })}
      {value !== null && (
        <span className="sr-only">
          {value} / {RESTAURANT_RATING_MAX}
        </span>
      )}
      {interactive && value === null && (
        <input type="hidden" name="rating" value="" />
      )}
      {interactive && value !== null && value >= RESTAURANT_RATING_MIN && (
        <input type="hidden" name="rating" value={String(value)} />
      )}
    </div>
  );
}
