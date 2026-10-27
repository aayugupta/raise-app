// The tap-to-answer choices about the parent and child, shared by Setup and Profile.
import type { Profile } from "./profile";

export type ChoiceKey = "role" | "ageBand" | "teenGender" | "language" | "comfort";

export const PROFILE_CHOICES: {
  key: ChoiceKey;
  label: string; // short name, for Profile
  question: string; // full question, for Setup
  why: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "role",
    label: "You are their",
    question: "You are your teen's…",
    why: "Mothers and fathers often find different first lines easier.",
    options: [
      { value: "mother", label: "Mother" },
      { value: "father", label: "Father" },
      { value: "guardian", label: "Other guardian" },
    ],
  },
  {
    key: "ageBand",
    label: "Child's age",
    question: "How old is your child?",
    why: "Openers are matched to their age. Younger children get gentler ones that start with their friends.",
    options: [
      { value: "10-13", label: "10 to 13" },
      { value: "14-16", label: "14 to 16" },
      { value: "17-19", label: "17 to 19" },
    ],
  },
  {
    key: "teenGender",
    label: "Your child is",
    question: "Your teen is…",
    why: "So the examples on your card fit your teen.",
    options: [
      { value: "girl", label: "A girl" },
      { value: "boy", label: "A boy" },
      { value: "unsaid", label: "Prefer not to say" },
    ],
  },
  {
    key: "language",
    label: "Language",
    question: "Which language do you speak at home?",
    why: "Your first line will be written in this language.",
    options: [
      { value: "hinglish", label: "Hinglish (Hindi + English)" },
      { value: "hindi", label: "हिन्दी" },
      { value: "english", label: "English" },
    ],
  },
  {
    key: "comfort",
    label: "How openly you talk",
    question: "How openly does your family talk about personal things?",
    why: "We'll match the wording to your family's comfort.",
    options: [
      { value: "gentle", label: "Gently, we're just starting" },
      { value: "open", label: "Quite openly" },
    ],
  },
];

export function choiceLabel(key: ChoiceKey, profile: Profile): string {
  const c = PROFILE_CHOICES.find((x) => x.key === key)!;
  return c.options.find((o) => o.value === profile[key])?.label ?? "Not set";
}
