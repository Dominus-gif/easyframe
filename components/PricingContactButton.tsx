"use client";

import { useState } from "react";

const supportEmail = "contact@easyframe.app";

export function PricingContactButton() {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${supportEmail}`;
    }
  };

  return (
    <button className="paywall-contact-button" type="button" onClick={handleClick}>
      {copied ? "Copied support email" : "Contact"}
    </button>
  );
}
