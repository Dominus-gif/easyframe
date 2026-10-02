/**
 * Sponsor credit shown in every page footer. Styling lives in globals.css
 * (`.sponsor-credit`) so it inherits the site theme and keeps readable
 * contrast on the light background.
 *
 * The link is deliberately followed (no rel="sponsored"/"nofollow") at the
 * site owner's request — see the note in the commit message about Google's
 * guidance on paid links.
 */
export default function SponsorLine({ className }: { className?: string }) {
  return (
    <a
      className={`sponsor-credit${className ? ` ${className}` : ""}`}
      href="https://nordharton.com"
      target="_blank"
      rel="noopener noreferrer"
    >
      Free for everyone, thanks to our sponsor <b>NordHarton</b>
    </a>
  );
}
