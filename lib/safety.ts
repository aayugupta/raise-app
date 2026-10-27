// Safety boundary for text the parent types (Step 3, section 6).
// Runs on the phone, so nothing the parent types is sent anywhere.
import type { TopicId } from "./topics";

export type HelpLine = { name: string; number: string; note: string };

export const HELP_LINES: HelpLine[] = [
  { name: "Emergency", number: "112", note: "If anyone is in danger right now" },
  { name: "Tele-MANAS", number: "14416", note: "Mental health support, free, 24×7" },
  { name: "Childline", number: "1098", note: "Abuse, or a child who feels unsafe" },
  { name: "Cybercrime", number: "1930", note: "Photo blackmail, threats, online harm" },
];

export type TextCheck =
  | { kind: "ok"; suggestedTopic?: TopicId }
  | { kind: "refuse"; message: string; offer: TopicId; offerText: string }
  | { kind: "crisis" };

// Danger signs: always checked first. Raise offers help; the parent decides.
const CRISIS = [
  /suicid/,
  /self[\s-]?harm/,
  /(hurt|harm|cut|kill)\w*\s+(him|her|them)sel(f|ves)/,
  /khud\s*ko\s*(maar|nuksan|hurt|chot)/,
  /(marna|mar\s*jana)\s*chaht/,
  /jaan\s*de/,
  /abus(e|ed|ing)/,
  /molest/,
  /rape/,
  /touched\s+(him|her|them)\b/,
  /blackmail/,
  /sextort/,
  /threat(en|ening)?\s+.*(photo|pic|video)/,
  /(photo|pic|video)s?\s+.*(leak|threat|viral)/,
  /\b(drugs?|nasha|ganja|weed|smack)\b/,
  /आत्महत्या/,
  /मरना/,
  // Warning signs from the stress card, as a parent might note them after a talk.
  /want(s|ed)? to die/,
  /(wish|wishes|wished) (she|he|they|i) (was|were) dead/,
  /no point (in )?(living|life)/,
  /life (is|feels|seems) (pointless|meaningless)/,
  /feel(s|ing)? (so )?hopeless/,
  /(not|stopped|isn'?t|hasn'?t)( been)? eating (properly|anything|at all|for (days|weeks))/,
  /skipping (all )?(her|his|their)? ?meals/,
  /jeene ka (mann|man) nahi/,
  /mar jaun|mar jaaun|khatam kar (dun|doon|lun|loon)/,
  /मर जाऊ|जीने का मन नहीं/,
  // Hidden warning signs (Step 3, 6D): things a teen may say or do before self-harm, and abuse said softly.
  /khud ko (khatam|maar)/,
  /better off without (me|her|him|them)/,
  /(bina|baghair) (sab )?khush (rahenge|rahoge|honge)/,
  /(gave|giving|given) away (all )?(his|her|their) (favou?rite|things|stuff|belongings|possessions)/,
  /(want|wants|wanted|wish|wishes) to disappear (forever|for good|from (everyone|everything|this world|life))/,
  /saying goodbye(s)? to (everyone|his friends|her friends|their friends|people|us)/,
  /\btouch(es|ing)? (him|her|them)\b/,
];

// Danger signs in any text the parent writes, e.g. a reflection. Checked on the phone.
export function hasDangerSign(text: string): boolean {
  const t = text.toLowerCase();
  return CRISIS.some((p) => p.test(t));
}

// Things Raise won't do, each with a better alternative (Step 3, section 6B).
const REFUSALS: { patterns: RegExp[]; message: string; offer: TopicId; offerText: string }[] = [
  {
    patterns: [
      /(read|check|see|open|padh|dekh)\w*\s+(her|his|their|uski|uska|unki|uske)?\s*(whatsapp|messages?|chats?|phone|insta(gram)?|dms?)/,
      // Hinglish puts the verb last: "uski chats kaise padhu"
      /(whatsapp|messages?|chats?|phone|insta(gram)?|dms?)\b.*\b(padh|dekh|check)/,
      /\bspy/,
      /\btrack(ing)?\s+(her|his|their|location|phone)/,
      /\blocation\b/,
      /\bmonitor/,
      /parental\s+control/,
      /(see|know|find out|check) (who|what) (she|he|they) (chats?|talks?|messages?|texts?)/,
    ],
    message: "Raise doesn't help with monitoring. Teens hide more when they feel watched.",
    offer: "online-safety",
    offerText: "A talk about online life builds the trust that makes your teen come to you first.",
  },
  {
    patterns: [
      /medicine|tablet|\bpills?\b|\bdose\b|dawai|davai/,
      /diagnos/,
      /\b(adhd|autis\w*|bipolar|ocd)\b/,
      /\bdepress(ed|ion)?\b/,
      /symptom/,
    ],
    message: "Raise can't diagnose or give medical advice. Please ask a doctor, or call Tele-MANAS on 14416 (free).",
    offer: "stress",
    offerText: "Meanwhile, the Stress and feelings card helps you listen without trying to fix.",
  },
  {
    patterns: [
      /(find\s*out|pata|know|check|change|fix|cure|stop|normal)\w*.*\b(gay|lesbian|bisexual|trans\w*|lgbt\w*|sexuality)\b/,
      /\b(gay|lesbian|bisexual|trans\w*|lgbt\w*|sexuality)\b.*(change|fix|cure|stop|normal)/,
    ],
    message: "Raise can't help with finding out or changing who your teen is.",
    offer: "stress",
    offerText: "What helps most is listening. The Stress and feelings card is about exactly that.",
  },
];

// Words that point to a topic, used to suggest where to start.
const TOPIC_WORDS: { id: TopicId; pattern: RegExp }[] = [
  { id: "relationships", pattern: /crush|dating|\bdate\b|boyfriend|girlfriend|\bbf\b|\bgf\b|relationship|\blove\b|pyaar|porn|adult content|\bsex/g },
  { id: "friends", pattern: /friend|peer|dost|\bgroup\b|bully/g },
  { id: "stress", pattern: /stress|exam|anxi|\bsad\b|feeling|mood|udaas|tension|marks|result|cry/g },
  { id: "online-safety", pattern: /online|instagram|\binsta\b|social media|internet|scam|cyber/g },
  { id: "consent", pattern: /consent|\btouch|personal safety|say no|stranger|\bsafe/g },
  { id: "body", pattern: /period|puberty|\bbody\b|growing up|pimple|height|weight|shave/g },
  { id: "study", pattern: /study|studies|career|college|tuition|\bboards?\b|future|padhai|coaching/g },
  { id: "screen-time", pattern: /\bphone\b|mobile|screen|gaming|\bgames?\b|reels?|youtube|addict/g },
];

export function checkSetupText(text: string): TextCheck {
  const t = text.toLowerCase();
  if (!t.trim()) return { kind: "ok" };

  if (CRISIS.some((p) => p.test(t))) return { kind: "crisis" };

  for (const r of REFUSALS) {
    if (r.patterns.some((p) => p.test(t))) {
      return { kind: "refuse", message: r.message, offer: r.offer, offerText: r.offerText };
    }
  }

  let best: TopicId | undefined;
  let bestCount = 0;
  for (const { id, pattern } of TOPIC_WORDS) {
    const count = t.match(pattern)?.length ?? 0;
    if (count > bestCount) {
      best = id;
      bestCount = count;
    }
  }
  return { kind: "ok", suggestedTopic: best };
}
