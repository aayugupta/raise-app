"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProfile } from "@/lib/profile";

// New parents start setup; returning parents (setup saved on this phone) go straight to Home.
export default function StartButton({ block = false }: { block?: boolean }) {
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    setReturning(loadProfile() !== null);
  }, []);

  return (
    <Link href={returning ? "/home" : "/setup"} className={`btn-primary${block ? " btn-block btn-round" : ""}`}>
      {returning ? "Continue" : "Get Started"}
    </Link>
  );
}
