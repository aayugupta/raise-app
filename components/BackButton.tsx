"use client";

import { useRouter } from "next/navigation";

// Goes back to wherever the parent came from (Help can be opened from any screen).
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      className="icon-btn"
      aria-label="Back"
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/home"))}
    >
      ←
    </button>
  );
}
