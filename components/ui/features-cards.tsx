import * as React from "react";
import {
  Frame, Sparkles, Palette, ImageDown, Gift, ShieldCheck, type LucideIcon
} from "lucide-react";
import { Card } from "@/components/ui/card";

const displayFont = { fontFamily: '"Inter Tight", Inter, system-ui, sans-serif' } as const;

const features: { title: string; description: string; Icon: LucideIcon }[] = [
  { title: "Instant device frames", description: "Every major phone, tablet and laptop frame, ready in one click.", Icon: Frame },
  { title: "Realistic screenshots", description: "Your app looks exactly as it does on the real hardware.", Icon: Sparkles },
  { title: "Custom branding", description: "Add your logo, colors and captions to make it yours.", Icon: Palette },
  { title: "Export anywhere", description: "PNG, JPG or share link — perfect for App Store listings and decks.", Icon: ImageDown },
  { title: "Free forever", description: "No paywalls, no watermarks, no account required.", Icon: Gift },
  { title: "Private by design", description: "Everything runs in your browser — nothing is ever uploaded.", Icon: ShieldCheck }
];

export default function FeaturesCards() {
  return (
    <section id="features">
      <div className="py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center" data-reveal>
            <h2
              className="text-balance text-4xl font-medium tracking-tight text-[#FDFFF0] md:text-5xl"
              style={displayFont}
            >
              One tool for every mockup need
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#969692]">
              Everything you need to turn a screenshot into a share-ready shot.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureCard key={f.title} title={f.title} description={f.description} index={i}>
                <f.Icon strokeWidth={1.9} />
              </FeatureCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const FeatureCard = ({
  title,
  description,
  children,
  index = 0
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  index?: number;
}) => {
  return (
    <Card variant="soft" className="p-6" data-reveal style={{ "--d": index % 3 } as React.CSSProperties}>
      <div className="relative">
        <div className="grid size-11 place-items-center rounded-[13px] border border-[#FF0055]/25 bg-[#FF0055]/10 text-[#FF0055] *:size-5">
          {children}
        </div>

        <div className="mt-6 space-y-1.5">
          <h3 className="text-lg font-semibold text-[#FDFFF0]" style={displayFont}>
            {title}
          </h3>
          <p className="line-clamp-2 text-[15px] leading-relaxed text-[#969692]">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
};
