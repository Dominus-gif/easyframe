// Canvas-drawn sample app UIs used as *real raster screenshots* fed into the actual
// EasyFrame compositor for the homepage live demo and device gallery. These are genuine
// images the product engine frames — not decorative divs layered over a fake frame.
// Light UIs so device screens read as real screenshots on the white marketing site.

type Screen = { draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; name: string };

const W = 470;
const H = 1000;

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function statusBar(ctx: CanvasRenderingContext2D, ink: string) {
  ctx.fillStyle = ink;
  ctx.font = "700 26px Inter, system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("9:41", 34, 46);
  ctx.textAlign = "right";
  ctx.globalAlpha = 0.55;
  ctx.fillText("● ● ●", W - 30, 46);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

const SCREENS: Screen[] = [
  {
    name: "Discover",
    draw: (ctx) => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);
      statusBar(ctx, "#111318");

      ctx.fillStyle = "#0f1115";
      ctx.font = "600 44px Inter, system-ui, sans-serif";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("Discover", 30, 128);
      ctx.fillStyle = "#6E41E2";
      ctx.beginPath();
      ctx.arc(W - 52, 112, 22, 0, Math.PI * 2);
      ctx.fill();

      const hg = ctx.createLinearGradient(30, 160, W - 30, 420);
      hg.addColorStop(0, "#6E41E2");
      hg.addColorStop(1, "#8B5CF6");
      ctx.fillStyle = hg;
      rr(ctx, 30, 160, W - 60, 250, 26);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      rr(ctx, 52, 350, 150, 44, 22);
      ctx.fill();
      ctx.fillStyle = "#6E41E2";
      ctx.font = "700 24px Inter, system-ui, sans-serif";
      ctx.fillText("Featured", 74, 379);

      const tiles = ["#F6F2FF", "#ECF2FF", "#FFF7FC", "#F3F6F4"];
      const accents = ["#6E41E2", "#3B82F6", "#EC4899", "#10B981"];
      let i = 0;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          const x = 30 + c * ((W - 60) / 2 + 10);
          const y = 450 + r * 200;
          ctx.fillStyle = tiles[i % tiles.length];
          rr(ctx, x, y, (W - 80) / 2, 180, 20);
          ctx.fill();
          ctx.fillStyle = accents[i % accents.length];
          rr(ctx, x + 18, y + 18, 62, 62, 16);
          ctx.fill();
          ctx.fillStyle = "#C9CDD6";
          rr(ctx, x + 18, y + 96, 120, 12, 6);
          ctx.fill();
          rr(ctx, x + 18, y + 120, 80, 10, 5);
          ctx.fill();
          i++;
        }
      }
      ctx.fillStyle = "#F4F5F7";
      rr(ctx, 24, H - 118, W - 48, 78, 24);
      ctx.fill();
      const cols = ["#6E41E2", "#C9CDD6", "#C9CDD6", "#C9CDD6"];
      cols.forEach((col, k) => {
        ctx.fillStyle = col;
        rr(ctx, 60 + k * 92, H - 92, 26, 26, 8);
        ctx.fill();
      });
    }
  },
  {
    name: "Balance",
    draw: (ctx) => {
      ctx.fillStyle = "#F7F8FA";
      ctx.fillRect(0, 0, W, H);
      statusBar(ctx, "#111318");

      ctx.fillStyle = "#8A8F9A";
      ctx.font = "600 24px Inter, system-ui, sans-serif";
      ctx.fillText("Total balance", 34, 150);
      ctx.fillStyle = "#0f1115";
      ctx.font = "600 62px Inter, system-ui, sans-serif";
      ctx.fillText("$12,480", 32, 214);
      ctx.fillStyle = "#12A150";
      ctx.font = "600 24px Inter, system-ui, sans-serif";
      ctx.fillText("▲ 4.8%  this month", 34, 258);

      ctx.fillStyle = "#FFFFFF";
      rr(ctx, 30, 300, W - 60, 260, 24);
      ctx.fill();
      ctx.strokeStyle = "#6E41E2";
      ctx.lineWidth = 5;
      ctx.beginPath();
      const pts = [0.5, 0.42, 0.55, 0.38, 0.6, 0.3, 0.48, 0.2];
      pts.forEach((p, k) => {
        const x = 54 + (k * (W - 108)) / (pts.length - 1);
        const y = 300 + 40 + p * 180;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      for (let r = 0; r < 4; r++) {
        ctx.fillStyle = "#FFFFFF";
        rr(ctx, 30, 600 + r * 84, W - 60, 68, 18);
        ctx.fill();
        ctx.fillStyle = r === 0 ? "#6E41E2" : "#EEF0F4";
        ctx.beginPath();
        ctx.arc(64, 634 + r * 84, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2A2F3A";
        rr(ctx, 96, 622 + r * 84, 150, 12, 6);
        ctx.fill();
        ctx.fillStyle = "#C9CDD6";
        rr(ctx, 96, 642 + r * 84, 96, 10, 5);
        ctx.fill();
      }
    }
  },
  {
    name: "Move",
    draw: (ctx) => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);
      statusBar(ctx, "#111318");

      ctx.fillStyle = "#0f1115";
      ctx.font = "600 40px Inter, system-ui, sans-serif";
      ctx.fillText("Today", 32, 130);

      const cx = W / 2;
      const cy = 340;
      const rad = 120;
      ctx.lineWidth = 26;
      ctx.strokeStyle = "#EEF0F4";
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#6E41E2";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, cy, rad, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.5);
      ctx.stroke();
      ctx.fillStyle = "#0f1115";
      ctx.textAlign = "center";
      ctx.font = "600 58px Inter, system-ui, sans-serif";
      ctx.fillText("74%", cx, cy + 6);
      ctx.font = "500 22px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#8A8F9A";
      ctx.fillText("of daily goal", cx, cy + 44);
      ctx.textAlign = "left";

      const stats = ["Steps", "Calories", "Distance"];
      const accents = ["#6E41E2", "#3B82F6", "#EC4899"];
      stats.forEach((s, k) => {
        ctx.fillStyle = "#F7F8FA";
        rr(ctx, 30, 520 + k * 130, W - 60, 112, 22);
        ctx.fill();
        ctx.fillStyle = accents[k];
        rr(ctx, 50, 548 + k * 130, 56, 56, 16);
        ctx.fill();
        ctx.fillStyle = "#2A2F3A";
        ctx.font = "600 26px Inter, system-ui, sans-serif";
        ctx.fillText(s, 128, 590 + k * 130);
      });
    }
  },
  {
    name: "Messages",
    draw: (ctx) => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);
      statusBar(ctx, "#111318");
      ctx.fillStyle = "#0f1115";
      ctx.font = "600 34px Inter, system-ui, sans-serif";
      ctx.fillText("Messages", 30, 120);
      ctx.strokeStyle = "#EEF0F4";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 150);
      ctx.lineTo(W, 150);
      ctx.stroke();
      const bubbles = [
        { me: false, w: 260, h: 64, y: 200 },
        { me: true, w: 300, h: 92, y: 290 },
        { me: false, w: 210, h: 56, y: 410 },
        { me: true, w: 250, h: 60, y: 496 },
        { me: false, w: 290, h: 88, y: 586 },
        { me: true, w: 180, h: 56, y: 700 }
      ];
      bubbles.forEach((b) => {
        const x = b.me ? W - 30 - b.w : 30;
        ctx.fillStyle = b.me ? "#6E41E2" : "#F1F2F5";
        rr(ctx, x, b.y, b.w, b.h, 20);
        ctx.fill();
        ctx.fillStyle = b.me ? "rgba(255,255,255,.85)" : "#B9BDC7";
        rr(ctx, x + 18, b.y + 18, b.w - 60, 10, 5);
        ctx.fill();
        if (b.h > 70) {
          rr(ctx, x + 18, b.y + 40, b.w - 90, 10, 5);
          ctx.fill();
        }
      });
      ctx.fillStyle = "#F4F5F7";
      rr(ctx, 30, H - 108, W - 60, 60, 30);
      ctx.fill();
      ctx.fillStyle = "#6E41E2";
      ctx.beginPath();
      ctx.arc(W - 62, H - 78, 22, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  {
    name: "Player",
    draw: (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#F6F2FF");
      g.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      statusBar(ctx, "#111318");
      const ag = ctx.createLinearGradient(50, 120, W - 50, 500);
      ag.addColorStop(0, "#6E41E2");
      ag.addColorStop(1, "#EC4899");
      ctx.fillStyle = ag;
      rr(ctx, 50, 120, W - 100, 370, 28);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.beginPath();
      ctx.arc(W / 2, 305, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(W / 2, 305, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0f1115";
      ctx.font = "600 36px Inter, system-ui, sans-serif";
      ctx.fillText("Midnight Drive", 50, 570);
      ctx.fillStyle = "#8A8F9A";
      ctx.font = "400 24px Inter, system-ui, sans-serif";
      ctx.fillText("The Wknd Tapes", 50, 606);
      ctx.fillStyle = "#EAE6F2";
      rr(ctx, 50, 660, W - 100, 8, 4);
      ctx.fill();
      ctx.fillStyle = "#6E41E2";
      rr(ctx, 50, 660, (W - 100) * 0.42, 8, 4);
      ctx.fill();
      ctx.fillStyle = "#0f1115";
      [W / 2 - 120, W / 2, W / 2 + 120].forEach((cx, i) => {
        ctx.beginPath();
        ctx.arc(cx, 760, i === 1 ? 34 : 20, 0, Math.PI * 2);
        ctx.fillStyle = i === 1 ? "#6E41E2" : "#C9CDD6";
        ctx.fill();
      });
    }
  },
  {
    name: "Schedule",
    draw: (ctx) => {
      ctx.fillStyle = "#F7F8FA";
      ctx.fillRect(0, 0, W, H);
      statusBar(ctx, "#111318");
      ctx.fillStyle = "#0f1115";
      ctx.font = "600 40px Inter, system-ui, sans-serif";
      ctx.fillText("Today", 30, 128);
      ctx.fillStyle = "#8A8F9A";
      ctx.font = "500 22px Inter, system-ui, sans-serif";
      ctx.fillText("Wed · 12 items", 30, 162);
      const items = [
        { t: "09:00", c: "#6E41E2", h: 92 },
        { t: "10:30", c: "#3B82F6", h: 128 },
        { t: "13:00", c: "#EC4899", h: 92 },
        { t: "15:30", c: "#10B981", h: 110 }
      ];
      let y = 210;
      items.forEach((it) => {
        ctx.fillStyle = "#B9BDC7";
        ctx.font = "600 20px Inter, system-ui, sans-serif";
        ctx.fillText(it.t, 30, y + 30);
        ctx.fillStyle = "#FFFFFF";
        rr(ctx, 120, y, W - 150, it.h, 18);
        ctx.fill();
        ctx.fillStyle = it.c;
        rr(ctx, 120, y, 6, it.h, 3);
        ctx.fill();
        ctx.fillStyle = "#2A2F3A";
        rr(ctx, 150, y + 24, 160, 12, 6);
        ctx.fill();
        ctx.fillStyle = "#C9CDD6";
        rr(ctx, 150, y + 48, 100, 10, 5);
        ctx.fill();
        y += it.h + 20;
      });
    }
  },
  {
    name: "Shop",
    draw: (ctx) => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);
      statusBar(ctx, "#111318");
      ctx.fillStyle = "#0f1115";
      ctx.font = "600 34px Inter, system-ui, sans-serif";
      ctx.fillText("Shop", 30, 120);
      const hero = ctx.createLinearGradient(30, 150, W - 30, 470);
      hero.addColorStop(0, "#FFE9D6");
      hero.addColorStop(1, "#FFD1DC");
      ctx.fillStyle = hero;
      rr(ctx, 30, 150, W - 60, 320, 24);
      ctx.fill();
      ctx.fillStyle = "#C98A6A";
      rr(ctx, 150, 210, W - 300, 200, 20);
      ctx.fill();
      ctx.fillStyle = "#0f1115";
      ctx.font = "600 30px Inter, system-ui, sans-serif";
      ctx.fillText("Aran Knit Sweater", 34, 528);
      ctx.fillStyle = "#6E41E2";
      ctx.font = "700 34px Inter, system-ui, sans-serif";
      ctx.fillText("$89", 34, 574);
      ctx.fillStyle = "#F1F2F5";
      [0, 1, 2].forEach((k) => {
        rr(ctx, 34 + k * 78, 610, 62, 62, 14);
        ctx.fill();
      });
      ctx.fillStyle = "#EFC7CF";
      rr(ctx, 34, 610, 62, 62, 14);
      ctx.fill();
      ctx.fillStyle = "#0f1115";
      rr(ctx, 30, H - 120, W - 60, 68, 34);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "600 24px Inter, system-ui, sans-serif";
      ctx.fillText("Add to cart", W / 2, H - 82);
      ctx.textAlign = "left";
    }
  },
  {
    name: "Weather",
    draw: (ctx) => {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#5B8DEF");
      sky.addColorStop(1, "#9BC0FF");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      statusBar(ctx, "#FFFFFF");
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.font = "500 30px Inter, system-ui, sans-serif";
      ctx.fillText("San Francisco", W / 2, 150);
      ctx.font = "200 150px Inter, system-ui, sans-serif";
      ctx.fillText("18°", W / 2, 310);
      ctx.font = "500 26px Inter, system-ui, sans-serif";
      ctx.fillText("Partly Cloudy", W / 2, 360);
      ctx.globalAlpha = 0.85;
      ctx.font = "400 22px Inter, system-ui, sans-serif";
      ctx.fillText("H:21°   L:13°", W / 2, 398);
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255,255,255,.16)";
      rr(ctx, 30, 470, W - 60, 200, 24);
      ctx.fill();
      const hrs = ["Now", "1PM", "2PM", "3PM", "4PM"];
      hrs.forEach((hr, k) => {
        const x = 66 + k * 78;
        ctx.fillStyle = "rgba(255,255,255,.85)";
        ctx.textAlign = "center";
        ctx.font = "500 18px Inter, system-ui, sans-serif";
        ctx.fillText(hr, x, 512);
        ctx.fillStyle = "#FFE07A";
        ctx.beginPath();
        ctx.arc(x, 560, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "600 20px Inter, system-ui, sans-serif";
        ctx.fillText(18 - k + "°", x, 630);
      });
      ctx.textAlign = "left";
    }
  },
  {
    name: "Notes",
    draw: (ctx) => {
      ctx.fillStyle = "#FBFBF7";
      ctx.fillRect(0, 0, W, H);
      statusBar(ctx, "#111318");
      ctx.fillStyle = "#0f1115";
      ctx.font = "600 40px Inter, system-ui, sans-serif";
      ctx.fillText("Notes", 30, 128);
      const notes = [
        { c: "#FFF3C4", h: 150 },
        { c: "#D7EBFF", h: 120 },
        { c: "#FADCE6", h: 170 },
        { c: "#DDF3E4", h: 120 }
      ];
      let y = 180;
      notes.forEach((n) => {
        ctx.fillStyle = n.c;
        rr(ctx, 30, y, W - 60, n.h, 18);
        ctx.fill();
        ctx.fillStyle = "#2A2F3A";
        rr(ctx, 52, y + 24, 200, 14, 7);
        ctx.fill();
        ctx.fillStyle = "rgba(42,47,58,.35)";
        for (let ln = 0; ln < Math.floor((n.h - 60) / 26); ln++) {
          rr(ctx, 52, y + 58 + ln * 26, W - 60 - 44 - (ln % 2 ? 60 : 0), 9, 4);
          ctx.fill();
        }
        y += n.h + 16;
      });
    }
  }
];

/** Draw sample screen #i onto a fresh canvas and return it (for the compositor). */
export function sampleScreenCanvas(i: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (ctx) SCREENS[((i % SCREENS.length) + SCREENS.length) % SCREENS.length].draw(ctx, W, H);
  return c;
}

export const SAMPLE_COUNT = SCREENS.length;
export const SAMPLE_NAMES = SCREENS.map((s) => s.name);
