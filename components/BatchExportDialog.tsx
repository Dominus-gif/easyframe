"use client";

import { useMemo, useState } from "react";
import { Download, Layers, X } from "lucide-react";
import { templates } from "@/lib/mockup-data";
import type { TemplatePreset } from "@/lib/types";

type BatchProgress = { done: number; total: number; label: string };

type BatchExportDialogProps = {
  open: boolean;
  onClose: () => void;
  onExport: (ids: string[], onProgress: (progress: BatchProgress) => void) => Promise<void>;
};

// Exclude tiny avatar crops from batch by default — they rarely belong in a campaign set.
const DEFAULT_GROUPS = ["Instagram", "X", "LinkedIn"];

export default function BatchExportDialog({ open, onClose, onExport }: BatchExportDialogProps) {
  const groups = useMemo(() => {
    const map = new Map<string, TemplatePreset[]>();
    for (const template of templates) {
      const key = template.platform ?? "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(template);
    }
    return Array.from(map.entries());
  }, []);

  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const template of templates) {
      if (template.platform && DEFAULT_GROUPS.includes(template.platform) && template.category !== "Avatar") {
        initial.add(template.id);
      }
    }
    return initial;
  });
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleGroup = (platform: string, items: TemplatePreset[]) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const allOn = items.every((item) => next.has(item.id));
      for (const item of items) {
        if (allOn) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });

  const runExport = async () => {
    const ids = templates.filter((template) => selected.has(template.id)).map((template) => template.id);
    if (!ids.length) return;
    setExporting(true);
    setProgress({ done: 0, total: ids.length, label: "Preparing" });
    try {
      await onExport(ids, setProgress);
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  if (!open) return null;

  const count = selected.size;
  const pct = progress && progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="batch-overlay" role="dialog" aria-modal="true" aria-label="Resize and export">
      <button className="batch-scrim" aria-label="Close" onClick={exporting ? undefined : onClose} />
      <div className="batch-modal">
        <header className="batch-head">
          <div className="batch-title">
            <Layers size={18} />
            <div>
              <strong>Resize &amp; export all</strong>
              <small>Render this design into every selected format and download as one zip.</small>
            </div>
          </div>
          <button className="batch-close" onClick={onClose} disabled={exporting} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="batch-body">
          {groups.map(([platform, items]) => {
            const allOn = items.every((item) => selected.has(item.id));
            return (
              <section className="batch-group" key={platform}>
                <button className="batch-group-head" onClick={() => toggleGroup(platform, items)}>
                  <span className={`batch-check ${allOn ? "on" : ""}`} />
                  {platform}
                  <em>{items.filter((item) => selected.has(item.id)).length}/{items.length}</em>
                </button>
                <div className="batch-items">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className={`batch-item ${selected.has(item.id) ? "on" : ""}`}
                      onClick={() => toggle(item.id)}
                    >
                      <span className="batch-item-name">{item.label}</span>
                      <span className="batch-item-size">{item.width}×{item.height}</span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="batch-foot">
          {exporting && progress ? (
            <div className="batch-progress">
              <div className="batch-progress-bar"><i style={{ width: `${pct}%` }} /></div>
              <small>{progress.label} — {progress.done}/{progress.total}</small>
            </div>
          ) : (
            <small className="batch-count">{count} format{count === 1 ? "" : "s"} selected</small>
          )}
          <button className="batch-export" onClick={runExport} disabled={exporting || count === 0}>
            <Download size={16} />
            {exporting ? "Exporting…" : `Export ${count} size${count === 1 ? "" : "s"} (.zip)`}
          </button>
        </footer>
      </div>

      <style jsx>{`
        .batch-overlay { position: fixed; inset: 0; z-index: 95; display: grid; place-items: center; padding: 24px; }
        .batch-scrim { position: absolute; inset: 0; border: 0; background: rgba(8, 10, 12, 0.6); backdrop-filter: blur(3px); cursor: pointer; }
        .batch-modal {
          position: relative;
          width: min(620px, 96vw);
          max-height: 86vh;
          display: flex;
          flex-direction: column;
          background: #14171a;
          color: #f4f4f0;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }
        .batch-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
        .batch-title { display: flex; gap: 12px; align-items: flex-start; }
        .batch-title strong { display: block; font-size: 16px; }
        .batch-title small { color: rgba(244, 244, 240, 0.55); font-size: 12px; max-width: 420px; }
        .batch-close { background: rgba(255, 255, 255, 0.06); border: 0; color: inherit; border-radius: 10px; width: 34px; height: 34px; display: grid; place-items: center; cursor: pointer; }
        .batch-close:disabled { opacity: 0.4; cursor: default; }
        .batch-body { overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 18px; }
        .batch-group { display: flex; flex-direction: column; gap: 10px; }
        .batch-group-head {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: 0;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }
        .batch-group-head em { color: rgba(244, 244, 240, 0.4); font-style: normal; font-weight: 400; font-size: 11px; }
        .batch-check { width: 16px; height: 16px; border-radius: 5px; border: 1.5px solid rgba(255, 255, 255, 0.3); }
        .batch-check.on { background: #6d5dfc; border-color: #6d5dfc; }
        .batch-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
        .batch-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          text-align: left;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 9px 11px;
          color: #f4f4f0;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .batch-item.on { border-color: #6d5dfc; background: rgba(109, 93, 252, 0.16); }
        .batch-item-name { font-size: 12.5px; }
        .batch-item-size { font-size: 11px; color: rgba(244, 244, 240, 0.45); }
        .batch-foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; border-top: 1px solid rgba(255, 255, 255, 0.07); }
        .batch-count { color: rgba(244, 244, 240, 0.6); font-size: 13px; }
        .batch-progress { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .batch-progress-bar { height: 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); overflow: hidden; }
        .batch-progress-bar i { display: block; height: 100%; background: linear-gradient(90deg, #6d5dfc, #ff5f8f); transition: width 0.2s; }
        .batch-progress small { color: rgba(244, 244, 240, 0.55); font-size: 11px; }
        .batch-export {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6d5dfc, #ff5f8f);
          border: 0;
          color: #fff;
          border-radius: 12px;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .batch-export:disabled { opacity: 0.45; cursor: default; }
      `}</style>
    </div>
  );
}
