## Problem statement 2

Develop a solution that improve relationships between caregiver and the care recipient so that caregivers can provide the care that the care recipients want/need in a mutually respectful, meaningful, and joyful way?

<img width="698" height="698" alt="logo new" src="https://github.com/user-attachments/assets/47609040-c6bb-4f5b-b747-f88162cd1ba4" />


---

## Inspiration

The global aging population faces a growing challenge: **loneliness and disconnection from caregivers**. We saw family members struggling to stay connected with elderly loved ones while balancing busy lives, and seniors feeling isolated between caregiver visits. We asked ourselves: *What if we could create a companion that's always there, one that brings joy, encourages healthy habits, and keeps families connected?*

Inspired by the emotional bond between pets and their owners (think Nintendogs!), we envisioned **BuddyCare** - a virtual companion puppy named Buddy who provides daily emotional support to elderly users while keeping caregivers informed about their wellbeing in real-time.

---

## What it does

**BuddyCare** is a dual-interface care platform that connects elderly users with their caregivers through an AI-powered virtual companion.

**For Elderly Users:**
- **Meet Buddy** - a beautiful 3D interactive golden retriever puppy that responds to their daily activities with 5 different moods (sleeping, awake, smiling, excited, love)
- **Voice-enabled AI Chat** - talk to Buddy using speech recognition; Buddy responds with text-to-speech, making conversations natural and accessible
- **Daily Missions** - gentle reminders for medicine, meals, exercise, and mood check-ins with satisfying completion celebrations
- **Heart Button** - send love to caregivers with a single tap, creating emotional connection across distance

**For Caregivers:**
- **Real-time Dashboard** - monitor mission completions, step counts, and puppy status live
- **AI-Generated Daily Summaries** - intelligent analysis of conversations with automatic concern detection (pain, loneliness, anxiety)
- **Emotion Tracking** - 7-day emotional trend visualization to spot patterns
- **Heart Notifications** - receive love hearts from elderly users with instant toast notifications
- **Reward System** - earn coffee coupons after collecting 20 hearts (gamified appreciation!)

---

## How we built it

**Frontend:**
- **React 18 + TypeScript** for type-safe, component-based architecture
- **Three.js + React Three Fiber** for the 3D Nintendogs-style puppy with real-time animations (breathing, tail wagging, mood effects like floating hearts and sparkles)
- **Framer Motion** for buttery-smooth animations throughout the app
- **Tailwind CSS + shadcn/ui** for a modern, accessible UI with large touch targets optimized for elderly users

**Backend (Lovable Cloud):**
- **Supabase Realtime** for instant synchronization between elderly and caregiver dashboards
- **Edge Functions** for AI-powered features:
  - `ai-chat`: Handles conversation with Buddy, analyzes user emotions (happy, sad, anxious, pain_suspected, neutral)
  - `summarize-daily-chat`: Generates intelligent daily summaries with concern detection
- **Lovable AI Gateway** (Google Gemini) for natural language processing
- **PostgreSQL** with Row Level Security for secure multi-user data isolation

**Key Database Tables:**
- `profiles` (user management with elderly-caregiver linking)
- `conversations` (chat history with emotion tags)
- `mission_completions` (daily activity tracking)
- `hearts` (love sent between users)
- `daily_summaries` (AI-generated summaries cached)
- `caregiver_coupons` (reward system)

---

## Challenges we ran into

1. **3D Puppy Positioning** - Getting the mood effects (floating hearts, sparkles, Z's for sleeping) to display correctly without being cut off required careful camera positioning and disabling rotation controls

2. **Real-time Sync Complexity** - Ensuring mission completions, hearts, and conversations sync instantly between elderly and caregiver views required careful Supabase Realtime channel management

3. **Emotion Detection Accuracy** - Training the AI to understand context (e.g., "I'm not alone" shouldn't trigger loneliness alerts) required extensive prompt engineering with explicit negation handling

4. **Elderly-Friendly UX** - Designing for seniors meant larger fonts (`text-elderly-lg`), simplified navigation, voice-first input, and high-contrast visual feedback

5. **Mobile Dialog Centering** - Ensuring popups appear centered on phone screens required custom CSS with `calc(100% - 2rem)` width calculations and proper transform translations

---

## Accomplishments that we're proud of

- **The 3D Puppy** - Buddy is absolutely adorable! Built entirely with Three.js primitives (no external models), with 5 distinct moods and smooth animations that genuinely make you smile
- **Voice Interaction** - Full speech-to-text and text-to-speech support makes the app accessible to users who struggle with typing
- **Intelligent Concern Detection** - The AI accurately identifies when elderly users mention pain, loneliness, or anxiety, alerting caregivers without false positives
- **Gamified Caregiving** - The heart-to-coupon reward system turns caregiving into a positive feedback loop
- **Pixel-Perfect Mobile Experience** - Every component is optimized for elderly users on mobile devices

---

## What we learned

- **Accessibility is Design** - Building for elderly users forced us to make better design decisions that improve the experience for everyone
- **AI Prompt Engineering** - Creating reliable emotion detection and summary generation required iterative prompt refinement
- **Real-time Architecture** - Supabase Realtime channels need careful subscription management to avoid memory leaks
- **3D on the Web** - React Three Fiber makes 3D surprisingly approachable, but performance optimization is crucial for mobile

---

## What's next for BuddyCare

1. **Step Counter Integration** - Connect with wearables (Apple Watch, Fitbit) for automatic step tracking
2. **Emergency SOS** - One-tap emergency call feature with automatic location sharing
3. **Multiple Elderly Support** - Allow caregivers to monitor several elderly users
4. **Customizable Missions** - Let caregivers set personalized daily goals
5. **Video Calling** - Built-in video chat between elderly users and caregivers
6. **Health Metrics Dashboard** - Integrate blood pressure, heart rate, and medication reminders
7. **Buddy's Growth** - Let the puppy "grow" and unlock new animations based on mission streaks

**Your caring companion, every step of the way.** 🐕💕

---
