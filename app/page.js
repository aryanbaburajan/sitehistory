"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import archive from "../versions.json";
export default function Home() {
  const filterRef = useRef(null);
  const [selected, setSelected] = useState(() => archive.map((v) => v.id));
  const [current, setCurrent] = useState(archive[0].id),
    [filter, setFilter] = useState(false),
    [status, setStatus] = useState("");

  const versions = useMemo(
    () => archive.filter((v) => selected.includes(v.id)),
    [selected],
  );
  const active = archive.find((v) => v.id === current) || versions[0];
  const activeIndex = active
    ? versions.findIndex((v) => v.id === active.id)
    : -1;
  const move = useCallback(
    (n) => {
      const i = versions.findIndex((v) => v.id === active?.id);
      const position = archive.findIndex((v) => v.id === active?.id);
      const next =
        i >= 0
          ? versions[i + n]
          : n < 0
            ? [...versions]
                .reverse()
                .find((v) => archive.findIndex((a) => a.id === v.id) < position)
            : versions.find(
                (v) => archive.findIndex((a) => a.id === v.id) > position,
              );
      if (next) setCurrent(next.id);
    },
    [versions, active],
  );
  useEffect(() => {
    function keydown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setFilter((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setFilter(false);
        return;
      }
      if (
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.isComposing ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) ||
        e.target.isContentEditable
      )
        return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        move(e.key === "ArrowLeft" ? -1 : 1);
      }
    }
    document.addEventListener("keydown", keydown);
    const frames = document.querySelectorAll("iframe");
    const attach = (e) => {
      try {
        e.target.contentDocument.addEventListener("keydown", keydown);
      } catch {}
    };
    frames.forEach((f) => {
      f.addEventListener("load", attach);
      try {
        f.contentDocument?.addEventListener("keydown", keydown);
      } catch {}
    });
    return () => {
      document.removeEventListener("keydown", keydown);
      frames.forEach((f) => {
        f.removeEventListener("load", attach);
        try {
          f.contentDocument?.removeEventListener("keydown", keydown);
        } catch {}
      });
    };
  }, [move]);
  useEffect(() => {
    if (!filter) return;
    const dismiss = (e) => {
      if (!filterRef.current?.contains(e.target)) setFilter(false);
    };
    const dismissFrame = () => setFilter(false);
    const frames = [...document.querySelectorAll("iframe")];
    const attach = (e) => {
      try {
        e.target.contentDocument?.addEventListener("pointerdown", dismissFrame);
      } catch {}
    };
    document.addEventListener("pointerdown", dismiss);
    frames.forEach((frame) => {
      frame.addEventListener("load", attach);
      try {
        frame.contentDocument?.addEventListener("pointerdown", dismissFrame);
      } catch {}
    });
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      frames.forEach((frame) => {
        frame.removeEventListener("load", attach);
        try {
          frame.contentDocument?.removeEventListener(
            "pointerdown",
            dismissFrame,
          );
        } catch {}
      });
    };
  }, [filter]);
  function toggle(id) {
    setSelected((old) =>
      old.includes(id) ? old.filter((v) => v !== id) : [...old, id],
    );
  }
  async function copy() {
    const text =
      `Selected archive versions (${versions.length}):\n\n` +
      versions.map((v) => `- ${v.id} | ${v.date} | ${v.subject}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied. Paste it to an agent.");
    } catch {
      setStatus(text);
    }
  }
  const date = active
    ? new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${active.date.slice(0, 7)}-01T00:00:00Z`))
    : "No versions";
  return (
    <>
      <main>
        {archive.map((v) => (
          <iframe
            key={v.id}
            title={v.subject}
            src={v.url}
            className={v.id === active?.id ? "active" : ""}
            tabIndex={v.id === active?.id ? 0 : -1}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        ))}
        {!active && <div className="message">Select a version to view it.</div>}
      </main>
      <section
        ref={filterRef}
        className={`filter${filter ? " is-open" : ""}`}
        inert={!filter}
        aria-hidden={!filter}
        aria-label="Filter versions"
      >
        <div className="choices">
          {archive.map((v) => (
            <div className="choice" key={v.id}>
              <input
                type="checkbox"
                checked={selected.includes(v.id)}
                onChange={() => toggle(v.id)}
                aria-label={`Include ${v.subject}`}
              />
              <button
                type="button"
                className="choice-open"
                onClick={() => setCurrent(v.id)}
              >
                <strong>{v.subject}</strong>
              </button>
            </div>
          ))}
        </div>
        <div className="filter-footer">
          <span role="status">{status}</span>
          <button onClick={copy}>Copy selected versions</button>
        </div>
      </section>
      <nav className="player" aria-label="Navigate site versions">
        <button
          onClick={() => move(-1)}
          hidden={
            !active ||
            !versions.some(
              (v) =>
                archive.findIndex((a) => a.id === v.id) <
                archive.findIndex((a) => a.id === active.id),
            )
          }
          aria-label="Previous version"
        >
          ←
        </button>
        <div className="player-info" aria-live="polite">
          <strong>{date}</strong>
          <span className="player-count">
            {activeIndex >= 0
              ? `${String(activeIndex + 1).padStart(2, "0")} / ${String(versions.length).padStart(2, "0")}`
              : "PREVIEW"}
          </span>
        </div>
        <button
          onClick={() => move(1)}
          hidden={
            !active ||
            !versions.some(
              (v) =>
                archive.findIndex((a) => a.id === v.id) >
                archive.findIndex((a) => a.id === active.id),
            )
          }
          aria-label="Next version"
        >
          →
        </button>
      </nav>
    </>
  );
}
