"use client";

/**
 * "Sponsored by NordHarton" credit line for page footers.
 * Opens https://nordharton.com in a new tab. Self-contained styling so it drops
 * cleanly into any page footer regardless of that page's own style system.
 */
export default function SponsorLine() {
  return (
    <>
      <a
        className="sponsor-line"
        href="https://nordharton.com"
        target="_blank"
        rel="noopener noreferrer sponsored"
      >
        Sponsored by <span>NordHarton</span>
      </a>
      <style jsx>{`
        .sponsor-line {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(244, 245, 247, 0.5);
          text-decoration: none;
          letter-spacing: 0;
          transition: color 0.15s ease;
        }
        .sponsor-line span {
          background: linear-gradient(135deg, #7db1ff 0%, #4fd0ea 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
        }
        .sponsor-line:hover {
          color: rgba(244, 245, 247, 0.85);
        }
      `}</style>
    </>
  );
}
