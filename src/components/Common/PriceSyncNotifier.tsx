// components/Common/PriceSyncNotifier.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface PriceSyncProps {
  expiryDates: (string | null)[];
}

export default function PriceSyncNotifier({ expiryDates }: PriceSyncProps) {
  const router = useRouter();
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    // Filter out nulls and find the closest expiry date that is in the future
    const validDates = expiryDates
      .filter((date): date is string => !!date)
      .map(date => new Date(date).getTime())
      .filter(time => time > Date.now());

    if (validDates.length === 0) return;

    // Pick the soonest expiry
    const nextExpiry = Math.min(...validDates);
    const timeUntilExpiry = nextExpiry - Date.now();

    // Set a timer to notify the user the exact moment the discount ends
    const timer = setTimeout(() => {
      if (!hasNotified) {
        toast.custom(
          (t) => (
            <span className="flex items-center gap-3">
              <b>Prices updated!</b>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.refresh(); // This clears the client cache and fetches new data
                }}
                className="bg-blue text-white px-3 py-1 rounded-lg text-xs font-bold"
              >
                Refresh View
              </button>
            </span>
          ),
          { duration: Infinity, position: "bottom-right" }
        );
        setHasNotified(true);
      }
    }, timeUntilExpiry);

    return () => clearTimeout(timer);
  }, [expiryDates, router, hasNotified]);

  return null; // This component stays invisible
}