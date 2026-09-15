"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

interface FeedbackCTAProps {
  context: "projects" | "extras";
  title: string;
}

export function FeedbackCTA({ context, title }: FeedbackCTAProps) {
  const handleClick = useCallback(() => {
    trackEvent("feedback_cta_clicked", { context, title });
  }, [context, title]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-love/30 bg-gradient-to-br from-love/15 via-pine/15 to-gold/15 p-[1px] shadow-lg shadow-love/20">
      <div className="relative rounded-[calc(theme(borderRadius.3xl)-1px)] bg-[#15131e]/80 p-8 backdrop-blur-md">
        <div className="absolute -inset-1 w-[110%] h-[110%] bg-[radial-gradient(circle_at_top,_rgba(235,111,146,0.12),transparent_55%)] blur-2xl opacity-70" />
        <div className="relative space-y-4">
          <h3 className="font-display text-2xl font-semibold text-foreground">
            Questions About This {context === "projects" ? "Project" : "Post"}?
          </h3>
          <p className="max-w-xl text-sm text-muted-foreground leading-relaxed">
            {context === "projects"
              ? "Ask about how it works, or point out something I missed."
              : "If you try it, I'd like to hear what you changed and how it went."}
          </p>
          <Button
            asChild
            size="lg"
            variant="gradient"
            className="gradient-button-reverse group mt-4 w-fit"
            onClick={handleClick}
          >
            <Link href="/contact">
              Contact me
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
