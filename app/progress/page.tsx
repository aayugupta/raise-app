import { redirect } from "next/navigation";

// Progress now lives on the Journey tab (simplified flow, 28 Oct 2026).
export default function Progress() {
  redirect("/journey");
}
