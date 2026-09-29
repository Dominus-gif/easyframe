import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight, LayoutGrid, Gift, ShieldCheck, Smartphone, Tablet, Laptop, AppWindow, Watch, Monitor,
  Store, Presentation, Share2, LayoutTemplate, Rocket, Check
} from "lucide-react";
import { SITE_URL } from "@/lib/site";
import StarttFX from "@/components/site/StarttFX";
import JsonLd from "@/components/site/JsonLd";
import AccountLink from "@/components/auth/AccountLink";
import SponsorLine from "@/components/SponsorLine";

const rd = (i: number): CSSProperties => ({ "--d": i } as CSSProperties);

const floatTiles = [
  { Icon: Smartphone, cls: "t1", par: -40 },
  { Icon: Tablet, cls: "t2", par: -62 },
  { Icon: Laptop, cls: "t3", par: -30 },
  { Icon: AppWindow, cls: "t4", par: -68 },
  { Icon: Watch, cls: "t5", par: -46 },
  { Icon: Monitor, cls: "t6", par: -34 }
];

const deviceNames = [
  "iPhone", "Google Pixel", "Android Phone", "iPad", "iPad mini", "MacBook Pro", "Surface Laptop",
  "Browser Window", "Apple Watch", "Watch Ultra", "Desktop Monitor", "Ultrawide", "Chromebook",
  "Foldable", "Smart TV", "E-Reader"
];

const swatches = [
  "linear-gradient(135deg,#8FB4FF,#D6B8FF)", "linear-gradient(135deg,#FFB8D9,#FFD7A8)",
  "linear-gradient(135deg,#1753FE,#7C6CFF)", "linear-gradient(135deg,#A8E6FF,#8FB4FF)",
  "linear-gradient(135deg,#0A0A0A,#3B3F4A)", "linear-gradient(135deg,#FFE3F1,#E9E2FF)",
  "linear-gradient(135deg,#FF6FB8,#FFB257)", "linear-gradient(135deg,#E7EFFF,#FFFFFF)",
  "linear-gradient(135deg,#5FD4FF,#2F6BFF)"
];

const sliders = [
  { label: "Scale", value: "86", fill: 62 },
  { label: "Tilt 3D", value: "-14°", fill: 38 },
  { label: "Shadow", value: "60", fill: 60 },
  { label: "Corners", value: "34", fill: 34 }
];

const destinations = [
  { title: "App Store listings", body: "Frames sized for every store screenshot slot.", Icon: Store },
  { title: "Pitch decks", body: "Clean device shots that drop into any slide.", Icon: Presentation },
  { title: "Social posts", body: "Square and vertical crops for Instagram and X.", Icon: Share2 },
  { title: "Landing page heroes", body: "Wide compositions for the top of your site.", Icon: LayoutTemplate },
  { title: "Launch day", body: "Gallery images for Product Hunt and your changelog.", Icon: Rocket }
];

const audiences = [
  { who: "App developers", tag: "store listings", tone: "blue", body: "Ship App Store and Play Store screenshots that look like a designer made them." },
  { who: "Designers", tag: "client reviews", tone: "orange", body: "Put concepts on real hardware in seconds, then get back to designing." },
  { who: "Marketers", tag: "every channel", tone: "pink", body: "On-brand visuals for posts, emails and ads without waiting on the design queue." },
  { who: "Founders", tag: "investor decks", tone: "blue", body: "Show the product in your deck the way customers will see it." },
  { who: "Indie hackers", tag: "launch day", tone: "orange", body: "Launch assets for Product Hunt and X, with no design budget." },
  { who: "Agencies", tag: "fast turnarounds", tone: "pink", body: "Client-ready mockups from a browser tab, with nothing to install." }
];

function Phone({ className = "" }: { className?: string }) {
  return (
    <div className={`bx-phone ${className}`}>
      <span className="bx-island" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/showcase/app-screen.webp" alt="" width={780} height={1688} loading="eager" />
    </div>
  );
}

export default function HomeLanding() {
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EasyFrame",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: "Free device mockup generator. Frame screenshots in iPhone, iPad, MacBook, tablet, browser, and watch mockups — in your browser, no account required.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };

  return (
    <div className="bx">
      {/* Nav */}
      <nav className="bx-nav" aria-label="Primary">
        <div className="bx-wrap bx-nav-in">
          <Link href="/" className="bx-logo" aria-label="EasyFrame home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/easyframe-app-icon.svg" alt="" width={34} height={34} />
            <span>EasyFrame</span>
          </Link>
          <div className="bx-nav-links">
            <Link href="#features">Features</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div className="bx-nav-right">
            <AccountLink className="bx-account" />
            <Link href="/editor" className="bx-btn bx-btn-blue bx-btn-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="bx-hero">
        <div className="bx-wrap bx-hero-in">
          <p className="bx-badges" data-reveal>
            <span><Gift size={15} aria-hidden="true" /> Free forever, no account</span>
            <i aria-hidden="true" />
            <span><ShieldCheck size={15} aria-hidden="true" /> Your images stay on your device</span>
          </p>
          <h1 className="bx-h1" data-reveal="blur" style={rd(1)}>Device mockups<br />without designing</h1>
          <p className="bx-lead" data-reveal style={rd(2)}>
            Drop in a screenshot and get a polished, store-ready mockup in seconds. No Figma file, no Photoshop template, no sign-up.
          </p>
          <div className="bx-ctas" data-reveal style={rd(3)}>
            <Link href="/editor" className="bx-btn bx-btn-blue bx-btn-lg">Open the editor <ArrowRight size={18} /></Link>
            <Link href="/templates" className="bx-btn bx-btn-white bx-btn-lg"><LayoutGrid size={17} /> See templates</Link>
          </div>
        </div>

        <div className="bx-stage">
          {floatTiles.map(({ Icon, cls, par }) => (
            <span className={`bx-tile ${cls}`} key={cls} data-par={par} aria-hidden="true"><Icon size={26} strokeWidth={1.8} /></span>
          ))}

          <div className="bx-window" data-reveal style={rd(4)} role="img" aria-label="The EasyFrame editor framing an app screenshot in an iPhone on a pastel gradient">
            <div className="bx-chrome" aria-hidden="true">
              <i /><i /><i />
              <span>Untitled mockup — EasyFrame</span>
            </div>
            <div className="bx-app" aria-hidden="true">
              <aside className="bx-rail">
                <p className="bx-rail-h">Background</p>
                <div className="bx-swatches">
                  {swatches.map((bg, i) => (
                    <span key={bg} className={i === 0 ? "on" : undefined} style={{ background: bg }} />
                  ))}
                </div>
                <p className="bx-rail-h">Device</p>
                <ul className="bx-devlist">
                  <li className="on"><Smartphone size={14} /> iPhone <Check size={13} /></li>
                  <li><Smartphone size={14} /> Google Pixel</li>
                  <li><Tablet size={14} /> iPad</li>
                  <li><Laptop size={14} /> MacBook Pro</li>
                </ul>
              </aside>

              <div className="bx-canvas">
                <div className="bx-select">
                  <Phone className="bx-tilt" />
                  <b className="h1" /><b className="h2" /><b className="h3" /><b className="h4" />
                </div>
              </div>

              <aside className="bx-rail bx-rail-r">
                <p className="bx-rail-h">Adjust</p>
                {sliders.map((s) => (
                  <div className="bx-slider" key={s.label}>
                    <div><span>{s.label}</span><em>{s.value}</em></div>
                    <div className="bx-track"><span style={{ width: `${s.fill}%` }} /><b style={{ left: `${s.fill}%` }} /></div>
                  </div>
                ))}
                <span className="bx-export">Export PNG</span>
              </aside>
            </div>
          </div>

          <p className="bx-note bx-note-a" data-par={-28} aria-hidden="true">your screenshot, framed</p>
          <p className="bx-note bx-note-b" data-par={-38} aria-hidden="true">18 devices to pick from</p>
        </div>
      </header>

      {/* Device strip */}
      <section className="bx-strip" aria-label="Supported devices">
        <p className="bx-strip-h">Frames for every screen you ship</p>
        <div className="bx-marquee">
          <div className="bx-marquee-track">
            {[...deviceNames, ...deviceNames].map((d, i) => (
              <span key={`${d}-${i}`} aria-hidden={i >= deviceNames.length ? "true" : undefined}>{d}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Before & after */}
      <section className="bx-section">
        <div className="bx-wrap">
          <div className="bx-head" data-reveal>
            <p className="bx-eyebrow"><span>Before</span><span className="amp">&amp;</span><span>After</span></p>
            <h2 className="bx-h2s">What your audience actually sees</h2>
          </div>
          <div className="bx-ba">
            <figure className="bx-ba-card bx-before" data-reveal="left">
              <span className="bx-ba-tag">Before</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/showcase/app-screen.webp" alt="A plain app screenshot with no frame or background" width={780} height={1688} loading="lazy" />
              <figcaption>A raw screenshot</figcaption>
            </figure>
            <figure className="bx-ba-card bx-after" data-reveal="right" data-bgpar={-14}>
              <span className="bx-ba-tag on">After</span>
              <Phone className="bx-tilt-soft" />
              <figcaption>The same screenshot, framed in EasyFrame</figcaption>
            </figure>
          </div>
          <p className="bx-ba-line" data-reveal>
            Flat screenshots get scrolled past. EasyFrame helps you post visuals that <span>look designed.</span>
          </p>
        </div>
      </section>

      {/* Feature group 1 */}
      <section className="bx-section bx-wash" id="features">
        <div className="bx-wrap">
          <div className="bx-head" data-reveal>
            <p className="bx-eyebrow"><span>Frame</span><span className="on">Devices</span></p>
            <h2 className="bx-h2">Every device,<br />one click</h2>
            <p className="bx-lead">Pick a frame, drop in your screenshot and it snaps into the screen — corners, notch and all.</p>
          </div>
          <div className="bx-cards">
            <article className="bx-fcard" data-reveal="left">
              <div className="bx-vis bx-vis-blue" data-bgpar={-18}>
                <div className="bx-devrow">
                  <span className="d-watch" /><span className="d-phone" /><span className="d-tab" /><span className="d-lap" />
                </div>
              </div>
              <div className="bx-fcopy">
                <h3>18 device frames</h3>
                <p>iPhone, Pixel, iPad, MacBook, browser windows, Apple Watch, TVs and more.</p>
              </div>
            </article>
            <article className="bx-fcard" data-reveal style={rd(1)}>
              <div className="bx-vis bx-vis-lilac" data-bgpar={-18}>
                <div className="bx-swatchgrid">
                  {swatches.map((bg) => <span key={bg} style={{ background: bg }} />)}
                </div>
              </div>
              <div className="bx-fcopy">
                <h3>Backgrounds that pop</h3>
                <p>Mesh, radial and linear gradients with a film-grain finish, or solid colors.</p>
              </div>
            </article>
            <article className="bx-fcard" data-reveal="right">
              <div className="bx-vis bx-vis-peach" data-bgpar={-18}>
                <Phone className="bx-mini bx-tilt" />
              </div>
              <div className="bx-fcopy">
                <h3>3D tilt and layers</h3>
                <p>Rotate your device in 3D and move it above or below the other layers.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Feature group 2 */}
      <section className="bx-section">
        <div className="bx-wrap">
          <div className="bx-head" data-reveal>
            <p className="bx-eyebrow"><span>Compose</span><span className="on">Export</span></p>
            <h2 className="bx-h2">Build the whole<br />store listing</h2>
            <p className="bx-lead">Arrange several screens, crop to the size you need and export — without leaving the tab.</p>
          </div>
          <div className="bx-cards">
            <article className="bx-fcard" data-reveal="left">
              <div className="bx-vis bx-vis-lilac" data-bgpar={-18}>
                <div className="bx-collage" aria-hidden="true">
                  {[1, 2, 3, 4].map((n) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={n} src={`/showcase/photo-${n}.webp`} alt="" width={800} height={800} loading="lazy" />
                  ))}
                </div>
              </div>
              <div className="bx-fcopy">
                <h3>Collage layouts</h3>
                <p>Arrange several photos on one canvas — grids, polaroids and more.</p>
              </div>
            </article>
            <article className="bx-fcard" data-reveal style={rd(1)}>
              <div className="bx-vis bx-vis-blue" data-bgpar={-18}>
                <div className="bx-crop">
                  <span className="bx-crop-size">1290 × 2796</span>
                  <b /><b /><b /><b />
                </div>
              </div>
              <div className="bx-fcopy">
                <h3>Crop to any size</h3>
                <p>App Store, Instagram, X and slide sizes — or crop freely to your own.</p>
              </div>
            </article>
            <article className="bx-fcard" data-reveal="right">
              <div className="bx-vis bx-vis-peach" data-bgpar={-18}>
                <div className="bx-files">
                  <span>PNG</span><span>JPEG</span><span>WebP</span><span className="pro">4K · Premium</span>
                </div>
              </div>
              <div className="bx-fcopy">
                <h3>Export in HD</h3>
                <p>Up to 2048px free. 4K and transparent PNGs come with Premium.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="bx-section bx-wash">
        <div className="bx-wrap">
          <div className="bx-head" data-reveal>
            <h2 className="bx-h2s">Your screenshots. Your brand. Your channels.</h2>
            <p className="bx-lead">No design tools. No templates to hunt down. Just better visuals.</p>
          </div>
          <div className="bx-dest">
            {destinations.map((d, i) => (
              <article className="bx-dcard" data-reveal="scale" style={rd(i % 3)} key={d.title}>
                <span className="bx-dic"><d.Icon size={20} strokeWidth={1.8} /></span>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </article>
            ))}
            <article className="bx-dcard bx-dcard-cta" data-reveal style={rd(2)}>
              <h3>Private by design</h3>
              <p>Everything runs in your browser. Your screenshots are never uploaded.</p>
              <Link href="/templates" className="bx-textlink">Browse templates <ArrowRight size={15} /></Link>
            </article>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bx-section bx-who">
        <div className="bx-wrap">
          <div className="bx-head" data-reveal>
            <p className="bx-eyebrow"><span>Who it&apos;s for</span></p>
            <h2 className="bx-h2">Made for everyone<br />who ships</h2>
            <p className="bx-lead">If you have a screen to show, EasyFrame makes it look finished.</p>
          </div>
        </div>
        <div className="bx-marquee bx-marquee-cards">
          <div className="bx-marquee-track">
            {[...audiences, ...audiences].map((a, i) => (
              <article className="bx-ucard" key={`${a.who}-${i}`} aria-hidden={i >= audiences.length ? "true" : undefined}>
                <p>{a.body}</p>
                <footer><strong>{a.who}</strong><span className={`bx-hand ${a.tone}`}>/ {a.tag}</span></footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bx-final" data-bgpar={-22}>
        <div className="bx-wrap">
          <div className="bx-glass" data-reveal="scale">
            <h2 className="bx-h2">Mockups that<br />just work</h2>
            <p className="bx-lead">The free mockup tool that lives in a browser tab.</p>
            <Link href="/editor" className="bx-btn bx-btn-blue bx-btn-lg">Try EasyFrame free <ArrowRight size={18} /></Link>
            <small>Works in any modern browser · No account needed</small>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bx-footer">
        <div className="bx-wrap bx-footer-in">
          <div className="bx-footer-brand">
            <Link href="/" className="bx-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/easyframe-app-icon.svg" alt="" width={30} height={30} />
              <span>EasyFrame</span>
            </Link>
            <p>Free device mockups, made in your browser.</p>
          </div>
          <nav aria-label="Product">
            <h4>Product</h4>
            <Link href="/editor">Editor</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
          </nav>
          <nav aria-label="Mockups">
            <h4>Mockups</h4>
            <Link href="/iphone-mockups">iPhone</Link>
            <Link href="/tablet-mockups">Tablet</Link>
            <Link href="/laptop-mockups">Laptop</Link>
            <Link href="/browser-mockups">Browser</Link>
          </nav>
          <nav aria-label="Legal">
            <h4>Legal</h4>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
        <div className="bx-wrap bx-footer-copy">
          <span>© {new Date().getFullYear()} EasyFrame</span>
          <SponsorLine />
        </div>
      </footer>

      <StarttFX />
      <JsonLd data={softwareLd} />
    </div>
  );
}
