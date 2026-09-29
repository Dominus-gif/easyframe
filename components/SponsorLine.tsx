/**
 * Sponsor credit shown in every page footer. Styling lives in globals.css
 * (`.sponsor-credit`) so it inherits the site theme and keeps readable
 * contrast on the light background, instead of the old dark-theme-only colours.
 */
export default function SponsorLine({ className }: { className?: string }) {
  return (
    <a
      className={`sponsor-credit${className ? ` ${className}` : ""}`}
      href="https://nordharton.com"
      target="_blank"
      rel="noopener noreferrer sponsored"
    >
      Free for everyone, thanks to our sponsor <b>NordHarton</b>
    </a>
  );
}
