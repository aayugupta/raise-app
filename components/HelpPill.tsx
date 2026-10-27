import Link from "next/link";

// Help is reachable from every screen (Step 3, section 6C).
export default function HelpPill({ style }: { style?: React.CSSProperties }) {
  return (
    <Link href="/help" className="help-pill" style={style}>
      Help
    </Link>
  );
}
