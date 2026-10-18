"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Github, Pencil } from "lucide-react";
import { track } from "@/lib/analytics";

type Platform = "x" | "github" | "custom";

const PLATFORMS: { id: Platform; label: string; prefix: string; placeholder: string }[] = [
  { id: "x", label: "X", prefix: "x.com/", placeholder: "yourhandle" },
  { id: "github", label: "GitHub", prefix: "github.com/", placeholder: "yourhandle" },
  { id: "custom", label: "Other", prefix: "", placeholder: "type the details yourself" }
];

/**
 * The profile-card entry point. Picking a platform and typing a handle opens the
 * editor straight into profile mode with the lookup already running — the card
 * generator is otherwise buried as a tab and nobody finds it.
 */
export default function ProfileCardCTA() {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>("x");
  const [handle, setHandle] = useState("");
  const active = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0];

  const go = () => {
    const clean = handle.trim().replace(/^@/, "");
    track("profile_cta", { platform });
    const params = new URLSearchParams({ mode: "profile", platform });
    if (clean && platform !== "custom") params.set("handle", clean);
    router.push(`/editor?${params.toString()}`);
  };

  return (
    <section className="pc" id="profile-cards">
      <div className="bx-wrap">
        <div className="pc-head" data-reveal>
          <p className="bx-eyebrow"><span>New</span><span className="on">Profile cards</span></p>
          <h2 className="bx-h2">Your profile,<br />as a card worth posting</h2>
          <p className="bx-lead">
            Drop in an X or GitHub handle and get a share-ready card — name, bio, avatar and
            follower counts, on any background. No sign-up, nothing stored.
          </p>
        </div>

        <div className="pc-form" data-reveal style={{ ["--d" as string]: 1 }}>
          <div className="pc-tabs" role="group" aria-label="Platform">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={platform === p.id ? "on" : ""}
                onClick={() => setPlatform(p.id)}
              >
                {p.id === "github" ? <Github size={15} aria-hidden="true" /> : null}
                {p.id === "custom" ? <Pencil size={14} aria-hidden="true" /> : null}
                {/* X's mark is its name, so the glyph stands in for the label. */}
                {p.id === "x" ? <span className="pc-x">X</span> : p.label}
              </button>
            ))}
          </div>

          <div className="pc-field">
            {active.prefix ? <span className="pc-prefix">{active.prefix}</span> : null}
            <input
              type="text"
              value={handle}
              placeholder={active.placeholder}
              disabled={platform === "custom"}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") go(); }}
              aria-label={platform === "custom" ? "Start a blank card" : `${active.label} handle`}
              spellCheck={false}
              autoComplete="off"
            />
            <button type="button" className="pc-go" onClick={go}>
              {platform === "custom" ? "Start a card" : "Make card"} <ArrowRight size={16} />
            </button>
          </div>
          <p className="pc-note">
            {platform === "custom"
              ? "Build a card by hand — works for LinkedIn, Instagram or anything else."
              : `We read your public ${active.label} profile. Nothing is stored.`}
          </p>
        </div>
      </div>
    </section>
  );
}
