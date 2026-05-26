# OneSpace — Demo Video Script

**Target length:** 5 minutes (acceptable range 4:30–5:30)
**Speaking pace:** ~150 words per minute. Don't rush.
**Style:** Calm authority, not hype. Like you're explaining to a friend, not selling to a stranger.
**Format:** Every line marked `VO:` is spoken word-for-word. Every line in `[ ]` is a screen action.

---

## Pre-recording checklist (do this once before you hit record)

- [ ] Hard refresh `/login` once — fresh session, clean state
- [ ] Confirm `GEMNINI_API_KEY` is set in `.env` and the dev server is restarted
- [ ] Test the AI assistant with one prompt — make sure it returns a real answer
- [ ] Test pre-registration QR generation once (so you know the latest code)
- [ ] Close all other browser tabs, hide bookmark bar (`Ctrl+Shift+B`)
- [ ] Zoom browser to 100%, full screen
- [ ] Resolution: 1920×1080 minimum (record at 60fps if you can)
- [ ] Mic: pop filter on, room quiet, do a 30s test record first to check audio
- [ ] Have a second device ready (phone) for the QR scan demo
- [ ] Open the **Recording Cue Sheet** at the bottom of this file on a separate screen

---

## ACT 1 — The Problem (0:00 – 0:25)

**Goal:** Establish the pain in 25 seconds. Make the judge nod.

### 0:00 — Cold open

[SCREEN: Quick montage — three tabs side by side: an Excel sheet of "Member Tracker", a WhatsApp web window with messages about renewals, a Notion page with a half-filled spreadsheet]

VO:
> "Every coworking operator in India runs their business across six tools. A spreadsheet for members. WhatsApp for visitors. One booking app per branch. An accounting tool nobody opens. A notes file for renewals. And memory for everything else."

[Pace: deliberate. Pause for half a second after "memory for everything else."]

### 0:15 — Reveal the cost

[SCREEN: Cut to a darker frame — quick numbers flashing on a black background, one at a time]

VO:
> "The cost of that mess: missed renewals. Empty desks. Revenue you can't see leaking until the month closes."

[SCREEN: Fade to white. The OneSpace logo appears centered.]

VO:
> "OneSpace fixes that."

[Pause 1 second on the logo. This is your first emotional beat. Don't rush it.]

---

## ACT 2 — Sign In (0:25 – 0:45)

**Goal:** Get the judge inside the product. Show that auth exists conceptually without dwelling.

### 0:25 — Login screen

[SCREEN: `/login` page loads. The branded dark-red gradient panel on the left, the white sign-in card on the right.]

VO:
> "One workspace. Six branches. Every part of the business in one place."

[ACTION: Mouse hovers over the "Login as CS Coworking Space" button. Don't click yet.]

VO:
> "We're going to step in as the Owner of CS Coworking Spaces — a six-branch operator in Hyderabad."

[ACTION: Click the button.]

VO:
> "One click."

[SCREEN: Brief loading flicker, then `/dashboard` loads. The toast at the top reads "Signed in as CS Coworking Owner".]

---

## ACT 3 — The Dashboard (0:45 – 1:30)

**Goal:** Prove "command center" in 45 seconds. Don't narrate every widget. Anchor to numbers.

### 0:45 — First impression

[SCREEN: Dashboard fully loaded. Camera (cursor) is still.]

VO:
> "This is what an owner sees the moment they open OneSpace."

[Pause for 1 second. Let the judge's eye land.]

### 0:50 — Walk down the page

[ACTION: Mouse moves to the PulseBar at the top, hovers over each chip in turn — Renewals · Overdue · High-risk · Visitors today]

VO:
> "Top of the screen — four signals that need action today. Five renewals due this week. Six overdue invoices. Twenty-two members at high churn risk. Twelve visitors on-site."

### 1:00 — The AI Insight banner

[ACTION: Mouse moves down to the AI Insight banner just above the KPI cards. Hover, don't click yet.]

VO:
> "Below that — OneSpace's AI is already telling the owner what to do today. We'll come back to that in a moment."

### 1:08 — KPI grid

[ACTION: Pan slowly across the 4 KPI cards. Don't click — just let the count-up animations finish.]

VO:
> "Four headline numbers. Occupancy, monthly revenue, at-risk revenue, active members. Each with a thirty-day trend baked in. Click any of these to drill down."

### 1:18 — Today's Focus

[ACTION: Scroll down to the Today's Focus card. Mouse hovers over the three columns.]

VO:
> "And then — the part that replaces three tools at once — Today's Focus. Renewals due. Overdue invoices. Visitors on-site. Every item clickable. Every action one tap away."

[Pause for half a second. Cursor still.]

### 1:25 — Branch matrix

[ACTION: Scroll to the Branch Performance Matrix. The Shaikpet row pulses red briefly (or just rest the cursor on it).]

VO:
> "Six branches, side by side. Shaikpet is the one bleeding right now — fifty-eight percent occupancy, two overdue invoices, action required."

---

## ACT 4 — The AI Moment (1:30 – 2:30)

**Goal:** The differentiator. Spend a full minute here. This is the segment a judge will remember.

### 1:30 — Open the assistant

[ACTION: Cursor moves back up to the AI Insight banner. Click it.]

VO:
> "But who has time to read every chart? Let's ask."

[SCREEN: AI Assistant panel slides in from the right. The starter prompt "Which renewals should I prioritize today?" is pre-loaded as a chip.]

VO:
> "Press Command-J anywhere in the app — the assistant opens. It already knows your data, your role, and your branch."

### 1:42 — Ask the first question

[ACTION: Click the suggestion chip that says "Which branches need attention?" (or type it in clean if your starters differ)]

VO:
> "Let's ask — which branches need attention right now?"

[SCREEN: Bot shows thinking dots, then responds with a real Gemini answer naming Shaikpet and Kondapur with reasons.]

VO:
> "Gemini reads the live data — not a script. Shaikpet for occupancy. Kondapur for overdue invoices. With reasoning."

[Pause 2 seconds while the response finishes typing. Don't talk over it.]

### 1:58 — The actionable suggestion

[ACTION: Type into the input: "Who should I renew first?" Press Enter.]

VO:
> "Now — who should I renew first?"

[SCREEN: Bot responds with a member name, MRR, days-to-expiry. Below the text, a clickable chip appears: **"✨ Renew {Member} for 12 months"**]

VO:
> "It doesn't just answer. It hands back an action."

[ACTION: Click the renewal suggestion chip.]

[SCREEN: Toast confirms "Renewed for 12 months". The activity feed in the background updates.]

VO:
> "One click. Renewed. Twelve months added. Risk score reset. Activity logged. The whole app just updated."

### 2:18 — Set up the RBAC reveal

[ACTION: Don't close the assistant. Cursor moves to the top-left of the TopBar — the role switcher button.]

VO:
> "Now watch what happens when somebody else logs in."

---

## ACT 5 — Role-Based Access Control Live (2:30 – 3:00)

**Goal:** Prove RBAC is real, not cosmetic. This is the second "wow" moment.

### 2:30 — Switch role

[ACTION: Click the role switcher. Dropdown opens showing all 14 personas grouped by tier.]

VO:
> "Fourteen role-and-branch combinations. Owner. Operations Lead. Branch Manager for each of the six branches. Community Manager for each branch."

### 2:38 — Pick Branch Manager · Gachibowli

[ACTION: Click "Branch Manager · Gachibowli" in the dropdown.]

[SCREEN: Toast says "Now acting as Branch Manager · Gachibowli". The dashboard begins re-rendering.]

VO:
> "Watch the screen."

[Pause 2 seconds. Let the changes wash through visibly.]

### 2:45 — The transformation

[SCREEN: Branch selector becomes a 🔒 Gachibowli locked chip. AI Insight banner stays. KPI grid keeps the same 4 cards (Branch Manager can see finance).]

[ACTION: Mouse moves to the locked branch chip. Hover.]

VO:
> "The branch selector is locked. This manager cannot see other branches. Not because the UI hides them. Because the data layer refuses to serve them."

### 2:55 — Now Community Manager

[ACTION: Click role switcher again. Pick "Community Manager · Raidurg".]

[SCREEN: Dashboard transforms more dramatically: PulseBar drops finance chips, KPI grid shrinks from 4 to 2 cards (no MRR, no At-Risk), AI Insight banner disappears, Sidebar loses Renewals + Leads, "2 sections hidden by your role's permissions" appears.]

VO:
> "Community Manager — narrower role. No finance. No renewals. The whole dashboard adapts."

---

## ACT 6 — The QR Visitor Loop (3:00 – 4:00)

**Goal:** Show the smart-visitor flow end-to-end. This is your demo's signature moment.

### 3:00 — Switch back to Owner

[ACTION: Role switcher → Owner. Then click "Visitors" in the sidebar.]

VO:
> "Let me show you the part of OneSpace that solves the most visible mess at a coworking space — the front desk."

### 3:08 — The visitors page

[SCREEN: `/visitors` page loads. The live arrivals ticker is animating at the top.]

VO:
> "Live arrivals ticker. Five smart KPIs. Pre-registration queue. A visitor log that updates in real time. And the part that matters —"

[ACTION: Click the "Pre-register" tab on the right side.]

VO:
> "— pre-registration."

### 3:20 — Generate the invite

[ACTION: Fill the form: Name "Megha Saxena", phone "9988712345", purpose "Demo", host "Arun Sharma" (use autocomplete to feel real).]

VO:
> "A host fills out the visitor details — once."

[ACTION: Click "Generate invite QR".]

[SCREEN: Modal shows the QR code + invite code OS-XXXX + WhatsApp button + Copy link button.]

VO:
> "OneSpace generates a unique QR code, an invite code, and a WhatsApp share link in a single tap."

### 3:32 — Switch to Kiosk Mode

[ACTION: Close the success state (or click "Pre-register another"). Click the "Kiosk" tab. Click "Open in kiosk mode (fullscreen)".]

[SCREEN: Goes fullscreen black with a giant QR code centered, white text "Welcome — scan to check in".]

VO:
> "On the front-desk tablet, OneSpace shows a kiosk QR. Any visitor with a phone camera can scan it. Walk-in or pre-registered."

### 3:42 — The phone scan

[ACTION: If you have a second device — pick it up, point the camera at the QR (or use phone screen recording layered into the video). It opens `/checkin` on the phone.]

[ALTERNATIVE: If you don't have a second device, exit kiosk mode, open `/checkin` in a new browser tab styled as mobile (use Chrome DevTools "device mode" iPhone 14)]

VO:
> "The visitor scans, enters the code their host sent them on WhatsApp —"

[ACTION: Enter the invite code from earlier. Tap Continue.]

[SCREEN: Confirmation page shows visitor name, host, purpose, branch — all pre-filled.]

VO:
> "Their name, host, purpose, branch — all pre-filled. They tap one button —"

[ACTION: Tap "Confirm check-in".]

[SCREEN: Success state with their personal badge QR.]

VO:
> "— and they're in. Their phone is now their badge."

### 3:55 — Cut back to the desk

[ACTION: Switch back to the OneSpace `/visitors` tab on the laptop.]

[SCREEN: The live arrivals ticker now shows "Megha Saxena — self-checked in via QR". Visitor log has a new row with a QR badge next to her name.]

VO:
> "Back at the desk — the front-desk manager sees the visitor appear. Real time. No typing. Three QR codes, one visit, zero data entry."

---

## ACT 7 — Bulk AI Retention (4:00 – 4:40)

**Goal:** Show automation that saves real revenue. Fast, punchy.

### 4:00 — Navigate to Renewals

[ACTION: Click the at-risk revenue KPI card on the dashboard, or click "Renewals" in the sidebar.]

VO:
> "Last segment. The thing that pays for itself in the first month."

### 4:07 — The renewals page

[SCREEN: `/renewals` page loads. Hero showing ₹11.X lakh at risk, stacked bar with risk bands, timeline, filter chips, table.]

VO:
> "Eleven lakh rupees of revenue is at risk this month. OneSpace knows exactly who, why, and what to say to each of them."

### 4:15 — Select members

[ACTION: Click the "Critical (70+)" filter chip. Then select 4 checkboxes in the table.]

VO:
> "Filter to critical risk. Select the five highest-priority members."

[SCREEN: SelectionToolbar appears at the bottom showing "5 selected · ₹62k MRR".]

### 4:25 — Bulk AI email

[ACTION: Click "✨ AI Email all" on the floating toolbar.]

[SCREEN: BulkEmailModal opens. AI-personalized mode is selected by default. Click "Generate drafts".]

VO:
> "AI email all. Five personalized retention emails. Generated in parallel by Gemini."

[Pause 3 seconds while the parallel generation completes. The progress UI shows each name turning from loading → green check.]

[ACTION: Click one row to expand and reveal the full email text.]

VO:
> "Each email references this exact member — how long they've been with us, when they last visited, their plan, their company. Personalized. Real. In four seconds."

### 4:38 — Send

[ACTION: Click "Send 5".]

[SCREEN: Toast confirms "Sent 5 emails".]

VO:
> "Five outreach emails. Sent."

---

## ACT 8 — The Closing (4:40 – 5:00)

**Goal:** Land the thesis. Memorable last line.

### 4:40 — Pull back

[ACTION: Navigate back to `/dashboard`. Stay still on the page for the closing.]

VO:
> "Six branches. Six hundred members. One workspace. Visitors, bookings, renewals, leads, finance — every operational signal in one place. AI-aware. Role-scoped. Mobile-ready."

### 4:52 — The line

[ACTION: Cursor still. Optionally fade in a card or title text at the center of the screen: "OneSpace · The fragmentation tax, gone."]

VO:
> "Coworking operators don't need another tool. They need fewer."

[Pause 1 second.]

> "OneSpace."

[Pause 1 second. Fade to black or to your team / contact info screen.]

> "The fragmentation tax — gone."

[Hold for 2 seconds on the title card. End video.]

---

## Total runtime check

| Act | Duration | Cumulative |
|---|---|---|
| 1 — Problem | 0:25 | 0:25 |
| 2 — Sign in | 0:20 | 0:45 |
| 3 — Dashboard | 0:45 | 1:30 |
| 4 — AI Moment | 1:00 | 2:30 |
| 5 — RBAC reveal | 0:30 | 3:00 |
| 6 — QR Visitor Loop | 1:00 | 4:00 |
| 7 — Bulk AI emails | 0:40 | 4:40 |
| 8 — Closing | 0:20 | 5:00 |
| **Total** | **5:00** | |

---

## If you need to cut to 4 minutes

In priority order, drop these (most expendable first):

1. **Cut the kiosk-mode fullscreen** — go straight from "Pre-register" success modal to phone scan (saves 8s)
2. **Cut the second AI question** — only show "Which branches need attention?", skip "Who should I renew first?" (saves 12s)
3. **Trim the dashboard walk-down** — replace with one wide shot + voiceover, no individual hovers (saves 20s)
4. **Cut the dark "cost of mess" beat in Act 1** — go straight from problem statement to login (saves 10s)

That gives you a clean 4:10 video without losing the spine.

---

## Voiceover delivery tips

### Voice & pacing

- **Speak ~15% slower than you think you should.** Voiceover that feels too slow in your headphones sounds confident on playback.
- **Drop your tone at the end of declarative sentences.** Don't go "up" like a question.
- **Smile while reading the upbeat lines.** It changes the timbre of your voice audibly. Try recording the same line with a flat face and then with a slight smile — listen back.
- **Pause for half a second before every number.** Numbers are the moments judges latch onto. Give them air. "Five — renewals due this week."
- **Stop using filler words.** No "uh", "um", "so", "basically". If you mess up, just pause and re-take that line — splice it in editing.
- **Read each Act out loud once before recording.** You'll catch tongue-twisters.

### Recording technique

- **Record in chunks, not one take.** Do each Act as a separate audio file. Easier to edit, easier to retake the bad ones.
- **Stand up while recording.** Sitting compresses your diaphragm and flattens your voice.
- **Put a blanket over your head and the mic if you don't have a treated room.** Sounds ridiculous, works perfectly. Reduces room echo by ~80%.
- **Mic 10–15cm from your mouth, slightly off-axis** (point it at your cheek, not your lips) to avoid plosives on "p" and "b".
- **Record 30s of pure room tone at the start.** You'll use this to fill gaps and as a noise profile for cleanup.

### Editing

- **Match cuts to your voice, not the other way around.** Edit the screen recording to the voiceover rhythm, not vice versa. Your voice sets pace.
- **Cut tight.** Trim every silence longer than 0.4s unless it's a deliberate beat (after a punchline).
- **Add subtle background music** at 8–12% volume. Lo-fi or ambient. No vocals. The Cinematic Studio or Soundstripe libraries are good; YouTube Audio Library is free.
- **Mix down to -14 LUFS** (YouTube/LinkedIn target). Your voice should peak at -3dB.
- **Add captions.** Hackathon judges often watch muted in coffee shops. Captions can be the difference between "watched" and "skipped".

### Screen recording tips

- **Slow your cursor down.** Default cursor speed is too fast for video. Drop sensitivity to about 60%.
- **Pause for 1 second after every click** before doing the next action. Gives the viewer time to register what happened.
- **Use a cursor highlighter** if your recorder supports it (yellow glow around the cursor). OBS has this built in.
- **Hide notification badges.** Disable Slack, email, system notifications. One Slack popup ruins a take.
- **Record at 1080p 60fps** if possible. UI interactions look choppy at 30fps.

### Production order

This is what I'd actually do, in this order:

1. **Day 1:** Record voiceover for all 8 acts. Don't worry about screen yet. Just nail the audio.
2. **Day 1:** Listen back to all 8 tracks. Re-record anything that sounds nervous, rushed, or fluffy.
3. **Day 2:** Record the screen capture. Run through the script twice without recording first — your hands need muscle memory.
4. **Day 2:** Edit. Screen on top, voiceover synced underneath. Cut tight.
5. **Day 2:** Color grade (slightly increase saturation by 5–10% — makes the red pop). Add captions. Mix audio.
6. **Day 3 morning:** Watch it once at 1.5x speed. If it still makes sense, it's good. Export.

---

## Recording cue sheet (print this and tape it next to your screen)

```
ACT 1  →  Excel/WhatsApp tabs visible, fade to OneSpace logo
ACT 2  →  /login    → click "Login as CS Coworking Space"
ACT 3  →  /dashboard → hover PulseBar → AI banner → KPIs → Today's Focus → Branch matrix
ACT 4  →  Click AI banner → ask "Which branches need attention?" → ask "Who should I renew first?" → click suggestion chip
ACT 5  →  Role switcher → Branch Manager Gachibowli → role switcher → Community Manager Raidurg → role switcher → Owner
ACT 6  →  /visitors → Pre-register tab → fill (Megha Saxena / Demo / Arun) → Generate QR → Kiosk tab → fullscreen → SCAN on phone → enter code → confirm → CUT back to laptop
ACT 7  →  /renewals → Critical filter → select 5 → "AI Email all" → Generate → expand one → Send 5
ACT 8  →  /dashboard → closing line
```

---

## What to do RIGHT before recording

1. **Test the Gemini key one last time.** Fire one assistant question to confirm.
2. **Open these tabs in this order:** `/login`, `/dashboard`, `/visitors`, `/renewals` — so navigation feels instant.
3. **Pre-generate ONE pre-registration code** so you have a fallback if the form fails mid-recording.
4. **Have an undo plan.** If you fluff a take, say "Take 2" out loud and just continue. You'll splice in editing.
5. **Breathe.** Take three deep breaths before you hit record. Your first sentence is the one judges anchor on.

You've got this. Make it 5 minutes a judge actually remembers.
