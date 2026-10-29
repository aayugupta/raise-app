import { TOPICS, type TopicId } from "@/lib/topics";

// Raise's own small flat drawings for each topic (29 Oct 2026), in place of emoji on topic cards.
// Each sits on a soft circle tinted with the topic's colour. Decorative: the topic name is always next to it.
export default function TopicArt({ id, size = 44 }: { id: TopicId; size?: number }) {
  const c = TOPICS.find((t) => t.id === id)!.color;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className="topic-art">
      <circle cx="24" cy="24" r="24" fill={c} opacity="0.16" />
      {id === "relationships" && (
        <>
          <path d="M18 35c-6.5-4.6-10-8.4-10-12.6 0-3 2.3-5.4 5.1-5.4 2 0 3.7 1.1 4.9 2.8 1.2-1.7 2.9-2.8 4.9-2.8 2.8 0 5.1 2.4 5.1 5.4 0 4.2-3.5 8-10 12.6Z" fill={c} />
          <path d="M30.5 30c-4.4-3.1-6.8-5.7-6.8-8.6 0-2 1.6-3.7 3.5-3.7 1.4 0 2.5.8 3.3 1.9.8-1.1 2-1.9 3.3-1.9 1.9 0 3.5 1.7 3.5 3.7 0 2.9-2.4 5.5-6.8 8.6Z" fill="#e5b99d" stroke="#fff" strokeWidth="1.4" />
        </>
      )}
      {id === "stress" && (
        <>
          <circle cx="30" cy="17" r="6" fill="#e8c07a" />
          <path d="M14 32h20a6 6 0 0 0 .6-12 8 8 0 0 0-15.4 2.2A5 5 0 0 0 14 32Z" fill={c} />
          <path d="M18 27.5c1.4 1 3.2 1 4.6 0M25.4 27.5c1.4 1 3.2 1 4.6 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </>
      )}
      {id === "friends" && (
        <>
          <circle cx="18" cy="18" r="5" fill={c} />
          <path d="M9 35c0-6 4-10 9-10s9 4 9 10Z" fill={c} />
          <circle cx="31" cy="19.5" r="4.5" fill="#e5b99d" />
          <path d="M23.5 35c0-5.3 3.4-8.8 7.5-8.8s7.5 3.5 7.5 8.8Z" fill="#e5b99d" />
          <path d="M25 29.5c1.6-1 3-1.3 4.4-1" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </>
      )}
      {id === "online-safety" && (
        <>
          <rect x="15" y="10" width="18" height="29" rx="3.5" fill={c} />
          <rect x="17.5" y="13.5" width="13" height="20" rx="1.5" fill="#fff" opacity="0.9" />
          <path d="M24 16.5l5 2v4c0 3.4-2.1 5.8-5 7-2.9-1.2-5-3.6-5-7v-4Z" fill="#e5b99d" />
          <path d="M21.6 22.8l1.7 1.7 3.2-3.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="24" cy="36.4" r="1.1" fill="#fff" />
        </>
      )}
      {id === "consent" && (
        <>
          <path
            d="M17 25V15.8a1.9 1.9 0 0 1 3.8 0V23m0-8.6V12.6a1.9 1.9 0 0 1 3.8 0V23m0-9a1.9 1.9 0 0 1 3.8 0V23m0-5.6a1.9 1.9 0 0 1 3.8 0v9.4c0 5.4-3.6 8.8-8.4 8.8-3.3 0-5.4-1.5-7.1-4.1L13.5 27a1.9 1.9 0 0 1 3.1-2.3l.4.3"
            fill={c}
            stroke={c}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M20.8 23v-3M24.6 23v-3M28.4 23v-2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
      {id === "body" && (
        <>
          <path d="M24 38V22" stroke={c} strokeWidth="3" strokeLinecap="round" />
          <path d="M24 24c-1-5.5-5.5-9-11-8.6.6 5.6 5 9 11 8.6Z" fill={c} />
          <path d="M24 21c1-5.8 5.6-9.5 11.4-9-.6 5.9-5.3 9.5-11.4 9Z" fill="#e5b99d" />
          <ellipse cx="24" cy="38.5" rx="8" ry="2.2" fill={c} opacity="0.35" />
        </>
      )}
      {id === "gender" && (
        <>
          {/* A soft rainbow arc over a small heart */}
          <path d="M9 31a15 15 0 0 1 30 0" stroke={c} strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M13.5 31a10.5 10.5 0 0 1 21 0" stroke="#e5b99d" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M18 31a6 6 0 0 1 12 0" stroke="#7fa08a" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M24 39.5c-3.2-2.3-5-4.2-5-6.3 0-1.5 1.1-2.7 2.5-2.7 1 0 1.9.6 2.5 1.4.6-.8 1.5-1.4 2.5-1.4 1.4 0 2.5 1.2 2.5 2.7 0 2.1-1.8 4-5 6.3Z" fill={c} />
        </>
      )}
    </svg>
  );
}
