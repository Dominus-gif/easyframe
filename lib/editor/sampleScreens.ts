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
