// Topics the parent has opened but not yet planned ("My open topics", FR3).
// Saved only on this phone.
import type { TopicId } from "./topics";

const KEY = "raise.openTopics";

export function loadOpenTopics(): TopicId[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as TopicId[];
  } catch {
    return [];
  }
}

export function addOpenTopic(id: TopicId): void {
  try {
    const topics = loadOpenTopics();
    if (!topics.includes(id)) localStorage.setItem(KEY, JSON.stringify([...topics, id]));
  } catch {
    // Storage blocked: the topic just won't be remembered.
  }
}
