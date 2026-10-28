// Where the parent is on the journey map (the full map in app/how-it-works and the small one on Home).
// Stops: 0 Pick a topic · 1 Learn · 2 Practise · 3 Plan a moment · 4 Talk, then tell us how it went.
// The topic furthest along decides; with none open, a topic picked in setup is at Learn, otherwise Pick a topic.
import type { Journey } from "./journey";
import { TOPICS, type TopicId } from "./topics";

export const MAP_STOPS = [
  { icon: "📚", short: "Pick", title: "Pick a topic", text: "Choose what you'd like to talk about with your child." },
  { icon: "🃏", short: "Learn", title: "Learn", text: "Flashcards give you a first line, gentle questions, and what to say." },
  { icon: "💬", short: "Practise", title: "Practise (optional)", text: "Ask the AI Coach your doubts, or role-play with it playing your child." },
  { icon: "🗓️", short: "Plan", title: "Plan a moment", text: "A walk or a quiet evening. Raise reminds you inside the app." },
  { icon: "💛", short: "Talk", title: "Talk, then tell us how it went", text: "Two taps. Your Super Parent bar fills, and a new topic opens up." },
] as const;

const HERE_LABEL = ["Pick a topic", "Learn about", "Practise", "Plan a moment for", "Have your talk about"];

export function mapPosition(journeys: Journey[], pick?: TopicId): { index: number; label: string } {
  const j = journeys[0]; // activeJourneys sorts the furthest along first
  const name = (id: TopicId) => TOPICS.find((t) => t.id === id)!.short;
  if (j) return { index: j.step, label: j.step === 2 ? `Practise ${name(j.topic)}` : `${HERE_LABEL[j.step]} ${name(j.topic)}` };
  if (pick) return { index: 1, label: `Learn about ${name(pick)}` };
  return { index: 0, label: HERE_LABEL[0] };
}
