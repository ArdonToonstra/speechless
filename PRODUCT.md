# Product

## Register

product

## Users

The primary user is a **nervous, first-time speech-writer** — a best man, maid of honor, parent, sibling, or close friend who has been asked (or volunteered) to give a speech at a wedding or milestone occasion. They are usually not writers, the stakes feel high and personal, and they may be quietly anxious about getting it right in front of people who matter.

Their context: this is a once-in-a-while, emotionally loaded task, not a daily-driver tool. They often don't work alone — they pull in friends and family to share stories, fact-check memories, give feedback, and shape the speech together. A secondary user is the **collaborator** invited into a project to contribute input or feedback, frequently on their own time and sometimes without an account.

The job to be done: turn scattered memories, nerves, and a blank page into a finished speech they're proud to deliver — with help from the people who know the moment best.

## Product Purpose

Toast is a collaborative speech-writing platform. It helps people write a better speech **together** — gathering a team, collecting stories and input, co-writing and refining the draft with readability guidance, and coordinating the surrounding logistics (venue, scheduling, guests) so nothing distracts from the words.

Toast exists because the best speeches aren't written alone, and most people writing one have never done it before. Success is a speech that is measurably better because the right people contributed — stories surfaced, feedback applied, the narrative shaped collaboratively — and a writer who arrives on the day with something heartfelt and theirs.

It helps people write *their* words, not replace them. The product assists; it does not author.

## Brand Personality

**Warm, reassuring, celebratory.** Toast should feel like a supportive friend standing next to you at a celebration — it calms nerves, encourages, and makes the milestone feel special without taking over the moment.

- **Voice:** warm and personal, plainspoken, lightly celebratory. Encouraging without being saccharine. ("Draft, refine, and deliver your speech with confidence." / "Turn anxiety into applause.")
- **Tone:** reassuring for an anxious first-timer; never clinical, never corporate, never pressuring.
- **Emotional goals:** confidence over anxiety, belonging over isolation, pride in a finished, personal speech.

The existing visual language carries this: teal on a warm off-white, a serif (Newsreader) for headings paired with a sans (Inter) for UI, soft rounded surfaces, and a celebratory accent reserved for moments that earn it.

## Anti-references

- **Cold corporate SaaS.** No navy-and-gray enterprise dashboard chrome, no generic tool feel. The task is emotional and personal; the interface must carry warmth.
- **Clinical AI writing tool.** Toast is not a "generate my speech for me" robot. Avoid positioning, copy, or UI that implies the machine writes the speech. The user's words, helped — not replaced.
- **Cluttered / overwhelming.** No dense, feature-stuffed screens that intimidate a non-writer who is already anxious. Guard against cognitive overload; reveal complexity progressively.
- (Adjacent watch-out, not a chosen anti-ref:) childish wedding kitsch or gimmicky confetti that would undercut a genuinely meaningful moment.

## Design Principles

1. **Calm the nerves first.** Every screen should lower anxiety, not add to it. Clear next steps, gentle defaults, reassuring copy, no blank-page dread. Guidance over judgment.
2. **Help people write, don't write for them.** Tools (readability hints, prompts, structure) assist the writer's own voice. Never present the product as the author.
3. **Better together.** Collaboration is the core value, not a feature. Inviting, contributing, and giving feedback should feel easy and welcoming — including for guests who arrive without an account.
4. **Warmth is structural, not decorative.** The emotional register lives in tone, type, color, and copy across the whole product — not in occasional flourishes bolted onto a cold base.
5. **Reveal complexity progressively.** A non-writer meets a simple surface; depth (logistics, scheduling, advanced editing) unfolds only when they reach for it.

## Accessibility & Inclusion

No formal conformance target is committed yet — treat accessibility as best-effort and aspirational for now, with intent to formalize later.

Practical priorities given the audience (broad, non-technical, all-ages, often anxious):
- Low-stress, low-cognitive-load flows; generous text sizing and clear hierarchy.
- Keyboard navigability and visible focus states on interactive elements.
- Respect `prefers-reduced-motion` for all animation (motion is reassurance, never a barrier).
- Verify color contrast on the warm off-white background — muted/brown text on tinted near-white is the most likely failure point.
- Bilingual support (English / Dutch) is already in place via next-intl; keep copy translatable and avoid baking text into images.
