"use client";

import { useEffect, useState } from "react";
import { CHECKS, type PanicResult } from "@/lib/panicTest";
import { TOPICS } from "@/lib/topics";

// Screen 12: Content engine (brief item 5; Step 3, section 5). Hidden, passcode-locked, for Aayushi only.
// Paste a claim and its links → the AI agent reads them and runs the panic test → she approves or rejects.

type Status = "waiting" | "approved" | "rejected" | "watch";
type Entry = { id: string; claim: string; urls: string[]; result: PanicResult; status: Status; checkedAt: string; decidedAt?: string };

const LOG_KEY = "raise.engine.log";
const PASS_KEY = "raise.engine.passcode";

const TABS: { status: Status; label: string }[] = [
  { status: "waiting", label: "Waiting for you" },
  { status: "approved", label: "Approved" },
  { status: "rejected", label: "Rejected by you" },
  { status: "watch", label: "Watch list" },
];

function loadLog(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]") as Entry[];
  } catch {
    return [];
  }
}

function saveLog(log: Entry[]) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {}
}

const topicName = (id: string | null) => TOPICS.find((t) => t.id === id)?.name ?? "No matching topic";
const date = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function Engine() {
  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [lockError, setLockError] = useState("");
  const [claim, setClaim] = useState("");
  const [links, setLinks] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [log, setLog] = useState<Entry[]>([]);
  const [tab, setTab] = useState<Status>("waiting");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setLog(loadLog());
    try {
      const saved = sessionStorage.getItem(PASS_KEY);
      if (saved) {
        setPasscode(saved);
        setUnlocked(true);
      }
    } catch {}
  }, []);

  async function unlock() {
    setLockError("");
    const res = await fetch("/api/engine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode, checkOnly: true }),
    });
    if (res.ok) {
      try {
        sessionStorage.setItem(PASS_KEY, passcode);
      } catch {}
      setUnlocked(true);
    } else {
      setLockError("That passcode didn't work.");
    }
  }

  function update(next: Entry[]) {
    setLog(next);
    saveLog(next);
  }

  async function run() {
    const urls = links.split(/\s+/).map((u) => u.trim()).filter(Boolean);
    setError("");
    setRunning(true);
    try {
      const res = await fetch("/api/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, claim, urls }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        if (res.status === 401) setUnlocked(false);
        return;
      }
      const result = data.result as PanicResult;
      const entry: Entry = {
        id: `${Date.now()}`,
        claim: claim.trim(),
        urls,
        result,
        // Failed the panic test → watch list. Passed → still needs Aayushi's approval.
        status: result.verdict === "accept" ? "waiting" : "watch",
        checkedAt: new Date().toISOString(),
      };
      update([entry, ...log]);
      setTab(entry.status);
      setOpenId(entry.id);
      setClaim("");
      setLinks("");
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setRunning(false);
    }
  }

  function decide(id: string, status: "approved" | "rejected") {
    update(log.map((e) => (e.id === id ? { ...e, status, decidedAt: new Date().toISOString() } : e)));
    setTab(status);
  }

  if (!unlocked) {
    return (
      <main style={{ minHeight: "100dvh", background: "var(--cream)" }}>
        <div style={{ maxWidth: 400, margin: "0 auto", padding: "64px 16px" }}>
          <h1 style={{ fontSize: 28 }}>Content engine</h1>
          <p className="why">For the Raise team only.</p>
          <input
            className="text-input"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            placeholder="Passcode"
            autoComplete="off"
          />
          {lockError && <p style={{ color: "#b4472f", margin: "-8px 0 12px" }}>{lockError}</p>}
          <button className="btn-primary btn-block" onClick={unlock} disabled={!passcode}>
            Open
          </button>
        </div>
      </main>
    );
  }

  const shown = log.filter((e) => e.status === tab);
  const urlCount = links.split(/\s+/).filter(Boolean).length;

  return (
    <main style={{ minHeight: "100dvh", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", padding: "24px 16px 48px" }}>
        <h1 style={{ fontSize: 30 }}>Content engine</h1>
        <p className="why">
          Paste a new claim and its sources. The AI agent reads the sources and runs the panic test. Nothing reaches a Talk Card
          until you approve it.
        </p>

        {/* New claim */}
        <section className="notice">
          <label htmlFor="claim" style={{ fontWeight: 700, color: "var(--ink)" }}>
            The claim
          </label>
          <textarea
            id="claim"
            className="text-input"
            rows={3}
            maxLength={500}
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="e.g. AI 'nudify' apps are being used to make fake images of Indian students"
            style={{ marginTop: 6 }}
          />
          <label htmlFor="links" style={{ fontWeight: 700, color: "var(--ink)" }}>
            Source links <span style={{ fontWeight: 400, color: "var(--muted)" }}>(one per line, up to 5)</span>
          </label>
          <textarea
            id="links"
            className="text-input"
            rows={3}
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            placeholder={"https://…\nhttps://…"}
            style={{ marginTop: 6, fontSize: 15 }}
          />
          {error && <p style={{ color: "#b4472f", margin: "-6px 0 12px" }}>{error}</p>}
          <button className="btn-primary btn-block" onClick={run} disabled={running || claim.trim().length < 10 || urlCount === 0}>
            {running ? `The agent is reading ${urlCount} source${urlCount === 1 ? "" : "s"}…` : "Run the panic test"}
          </button>
          {running && <p className="why" style={{ textAlign: "center", marginBottom: 0 }}>This can take up to a minute.</p>}
        </section>

        {/* The four checks, as a reminder */}
        <details className="sources" style={{ marginTop: 16 }}>
          <summary>What the panic test checks</summary>
          <ul className="card-list" style={{ marginTop: 8, fontSize: 15 }}>
            {CHECKS.map((c) => (
              <li key={c.id}>
                <strong>{c.name}:</strong> {c.rule}
              </li>
            ))}
          </ul>
        </details>

        {/* Log */}
        <h2 className="section-title" style={{ marginTop: 28 }}>
          Log
        </h2>
        <div className="chips" style={{ marginBottom: 14 }}>
          {TABS.map((t) => (
            <button key={t.status} className={`chip${tab === t.status ? " selected" : ""}`} onClick={() => setTab(t.status)}>
              {t.label} · {log.filter((e) => e.status === t.status).length}
            </button>
          ))}
        </div>

        {shown.length === 0 && <p className="why">Nothing here yet.</p>}

        <div style={{ display: "grid", gap: 12 }}>
          {shown.map((e) => (
            <EntryCard key={e.id} entry={e} open={openId === e.id} onToggle={() => setOpenId(openId === e.id ? null : e.id)} onDecide={decide} />
          ))}
        </div>
      </div>
    </main>
  );
}

function EntryCard({
  entry,
  open,
  onToggle,
  onDecide,
}: {
  entry: Entry;
  open: boolean;
  onToggle: () => void;
  onDecide: (id: string, status: "approved" | "rejected") => void;
}) {
  const r = entry.result;
  const passed = CHECKS.filter((c) => r.checks[c.id].pass).length;

  return (
    <article className="engine-entry">
      <button onClick={onToggle} className="engine-entry-head" aria-expanded={open}>
        <span style={{ flex: 1, textAlign: "left" }}>
          <span style={{ display: "block", fontWeight: 700, color: "var(--ink)" }}>{entry.claim}</span>
          <span style={{ display: "block", fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
            {date(entry.checkedAt)} · {passed} of 4 checks passed · {topicName(r.topic)}
          </span>
        </span>
        <span className={`verdict ${r.verdict}`}>{r.verdict === "accept" ? "Passed" : "Watch list"}</span>
      </button>

      {open && (
        <div style={{ padding: "4px 16px 16px" }}>
          {r.claimSummary && <p style={{ margin: "0 0 12px", fontStyle: "italic" }}>{r.claimSummary}</p>}

          <div style={{ display: "grid", gap: 8 }}>
            {CHECKS.map((c) => (
              <div key={c.id} className="check-row">
                <span aria-hidden="true">{r.checks[c.id].pass ? "✅" : "❌"}</span>
                <span>
                  <strong>{c.name}</strong> {r.checks[c.id].pass ? "passed" : "failed"}: {r.checks[c.id].reason}
                </span>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 17, margin: "16px 0 8px" }}>Sources</h3>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 8, fontSize: 15 }}>
            {r.sources.map((s) => (
              <li key={s.url}>
                <span aria-hidden="true">{s.opened ? "📖" : "⚠️"}</span>{" "}
                <a href={s.url} target="_blank" rel="noreferrer" style={{ color: "var(--teal)", wordBreak: "break-all" }}>
                  {s.url}
                </a>
                <div style={{ color: "var(--muted)", marginTop: 2 }}>
                  {s.opened ? `${s.kind ? s.kind + " · " : ""}${s.note ?? ""}` : "Couldn't open this link, so it wasn't used as evidence."}
                </div>
              </li>
            ))}
          </ul>

          {r.notes.length > 0 && (
            <ul style={{ margin: "12px 0 0", paddingLeft: 20, color: "#8a5a00", fontSize: 14 }}>
              {r.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}

          {r.verdict === "accept" && (
            <>
              <h3 style={{ fontSize: 17, margin: "16px 0 8px" }}>Draft “why now” line for {topicName(r.topic)}</h3>
              <p className="first-line" style={{ margin: 0, fontSize: 16 }}>
                {r.draftWhyNow ?? "No usable draft. Write the line by hand."}
              </p>
            </>
          )}

          {entry.status === "waiting" && (
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn-primary" onClick={() => onDecide(entry.id, "approved")}>
                Approve
              </button>
              <button className="btn-secondary" onClick={() => onDecide(entry.id, "rejected")}>
                Reject
              </button>
            </div>
          )}
          {entry.status === "approved" && (
            <p className="notice" style={{ marginTop: 16, background: "#e6f2f0" }}>
              ✅ Approved {entry.decidedAt ? date(entry.decidedAt) : ""}. Next: add the line to the {topicName(r.topic)} card in
              content/base-talk-cards.md and update its “Checked on” date. The advisor checks it before it goes live.
            </p>
          )}
          {entry.status === "watch" && (
            <p className="notice" style={{ marginTop: 16 }}>
              👀 On the watch list. Not published. If many parents ask about it, add one calm myth-buster line instead.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
