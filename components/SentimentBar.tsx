// components/SentimentBar.tsx
"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SentimentBarProps {
  positive: number;
  neutral: number;
  negative: number;
}

export function SentimentBar({ positive, neutral, negative }: SentimentBarProps) {
  const total = positive + neutral + negative;

  if (total === 0) {
    return <div className="text-xs text-gray-400">No sentiment data</div>;
  }

  const positivePercent = (positive / total) * 100;
  const neutralPercent = (neutral / total) * 100;
  const negativePercent = (negative / total) * 100;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-gray-200 mt-1">
            {positive > 0 && (
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${positivePercent}%` }}
              />
            )}
            {neutral > 0 && (
              <div
                className="bg-yellow-400 transition-all"
                style={{ width: `${neutralPercent}%` }}
              />
            )}
            {negative > 0 && (
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${negativePercent}%` }}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {`Positive: ${positive}, Neutral: ${neutral}, Negative: ${negative}`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}