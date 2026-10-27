"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import HelpPill from "@/components/HelpPill";
import Logo from "@/components/Logo";
import { clearMyData, greetName, loadProfile, updateProfile, type Profile } from "@/lib/profile";
import { choiceLabel, PROFILE_CHOICES, type ChoiceKey } from "@/lib/profileOptions";

// Screen 15: Profile / Settings (brainstorm screen 14), adapted to Raise's rules:
// no account, so no log in / log out and no "saved topics". Everything here lives on this phone.

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState<ChoiceKey | "nickname" | null>(null);
  const [nickname, setNickname] = useState("");
  const [saved, setSaved] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [about, setAbout] = useState(false);
  const [reminders, setReminders] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/");
      return;
    }
    setProfile(p);
    setNickname(p.nickname);
  }, [router]);

  if (!profile) return <main style={{ minHeight: "100dvh", background: "var(--cream)" }} />;

  function choose(key: ChoiceKey, value: string) {
    const next = updateProfile({ [key]: value } as Partial<Profile>);
    if (next) setProfile(next);
    setEditing(null);
    setSaved(key === "language" ? "Saved. Your next Talk Card will be in this language." : "Saved. Your next Talk Card will fit this.");
  }

  function saveNickname() {
    const next = updateProfile({ nickname: nickname.trim().slice(0, 20) });
    if (next) setProfile(next);
    setEditing(null);
    setSaved("Saved.");
  }

  function clearEverything() {
    clearMyData();
    router.replace("/");
  }

  const name = greetName(profile);

  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="avatar" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26 }}>Hi, {name}</h1>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>Your details stay on this phone. No account needed.</div>
          </div>
          <HelpPill />
        </div>

        {saved && (
          <p className="notice" role="status" style={{ marginTop: 16, background: "#e6f2f0" }}>
            ✓ {saved}
          </p>
        )}

        {/* About you and your child: every setup answer, editable */}
        <h2 className="section-title">About you and your child</h2>
        <div className="settings-list">
          <div className="settings-row">
            <button className="settings-row-head" onClick={() => setEditing(editing === "nickname" ? null : "nickname")} aria-expanded={editing === "nickname"}>
              <span className="settings-label">What we call you</span>
              <span className="settings-value">{profile.nickname || "Not set"}</span>
              <span className="settings-change">Change</span>
            </button>
            {editing === "nickname" && (
              <div className="settings-edit">
                <input
                  className="text-input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Mumma, Papa, Meera"
                  maxLength={20}
                  autoComplete="off"
                  aria-label="What we call you"
                  style={{ marginBottom: 10 }}
                />
                <button className="btn-primary btn-block" onClick={saveNickname}>
                  Save
                </button>
              </div>
            )}
          </div>

          {PROFILE_CHOICES.map((c) => (
            <div key={c.key} className="settings-row">
              <button className="settings-row-head" onClick={() => setEditing(editing === c.key ? null : c.key)} aria-expanded={editing === c.key}>
                <span className="settings-label">{c.label}</span>
                <span className="settings-value">{choiceLabel(c.key, profile)}</span>
                <span className="settings-change">Change</span>
              </button>
              {editing === c.key && (
                <div className="settings-edit" style={{ display: "grid", gap: 8 }}>
                  <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>{c.why}</p>
                  {c.options.map((o) => (
                    <button key={o.value} className={`option${profile[c.key] === o.value ? " selected" : ""}`} onClick={() => choose(c.key, o.value)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* More */}
        <h2 className="section-title">More</h2>
        <div className="settings-list">
          <Link href="/progress" className="settings-link">
            <span aria-hidden="true">📈</span> My progress <span className="settings-arrow">→</span>
          </Link>

          <button className="settings-link" onClick={() => setReminders(!reminders)} aria-expanded={reminders}>
            <span aria-hidden="true">🔔</span> Reminders <span className="settings-arrow">{reminders ? "−" : "+"}</span>
          </button>
          {reminders && (
            <p className="settings-note">
              When you plan a talk, keep “Remind me on Home” on. When your moment comes, Home shows “It's time” with your first
              line. Raise sends no notifications, and the reminder only names the moment (like “your walk”), never the topic.
            </p>
          )}

          <Link href="/privacy?from=profile" className="settings-link">
            <span aria-hidden="true">🔒</span> Privacy and teen safety <span className="settings-arrow">→</span>
          </Link>
          <Link href="/help" className="settings-link">
            <span aria-hidden="true">🆘</span> Help and support <span className="settings-arrow">→</span>
          </Link>

          <button className="settings-link" onClick={() => setAbout(!about)} aria-expanded={about}>
            <span aria-hidden="true">🌱</span> About Raise <span className="settings-arrow">{about ? "−" : "+"}</span>
          </button>
          {about && (
            <div className="settings-note" style={{ textAlign: "center" }}>
              <Logo size={40} />
              <p style={{ margin: "10px 0 6px", fontWeight: 700, color: "var(--ink)" }}>Better conversations. Brighter tomorrows.</p>
              <p style={{ margin: 0 }}>
                Raise gives you a first line, a good moment and calm words for hard talks with your teen. It's built from a survey of
                Indian parents and teens. Talk Cards are written with Google's Gemini AI and checked against safety rules. Raise
                isn't counselling or medical advice; for that, see Help.
              </p>
            </div>
          )}
        </div>

        {/* Clear my data (instead of log out: there's no account) */}
        <div style={{ marginTop: 28 }}>
          {!confirmClear ? (
            <button className="btn-link" style={{ color: "#b4472f" }} onClick={() => setConfirmClear(true)}>
              Clear my data from this phone
            </button>
          ) : (
            <section className="notice" style={{ border: "2px solid #f3c7bc" }}>
              <div style={{ fontWeight: 700, color: "var(--ink)" }}>Clear everything?</div>
              <p style={{ fontSize: 15, margin: "6px 0 12px" }}>
                This deletes your setup, plans, notes and progress from this phone. It can't be undone.
              </p>
              <button className="btn-secondary btn-block" onClick={() => setConfirmClear(false)} style={{ marginBottom: 8 }}>
                Keep my data
              </button>
              <button className="btn-link" style={{ color: "#b4472f" }} onClick={clearEverything}>
                Yes, clear everything
              </button>
            </section>
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
