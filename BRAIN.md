# Toddler Letters Game

> Voice recognition game for toddlers to learn letters and numbers

## Purpose
Educational game where toddlers see a letter/digit, speak its name into the microphone, and receive encouraging feedback. Designed for Tamir's kids.

## URLs
- **Production**: https://toddler-letters-game.vercel.app (master branch)
- **GitHub**: https://github.com/door2k/ToddlerLettersGame

## Current State (Jan 2026)

### Branches
| Branch | Status | Description |
|--------|--------|-------------|
| `master` | PRODUCTION | V1 - English digits 0-9, random shuffle |
| `next` | IN DEVELOPMENT | V2 - Hebrew support + Adaptive Learning System |
| `v2-hebrew` | MERGED into next | Hebrew language support |

### What's Live (master)
- Digits 0-9 with English voice recognition
- Random shuffle of all 10 digits each session
- 3 attempts before reveal, confetti celebrations

### What's on `next` Branch (Ready for Production)
- **Hebrew Support**: Full bilingual English/Hebrew with language toggle
- **Adaptive Learning System**: Intelligent progression instead of random shuffle
  - Starts with only 2 digits (1 and 2)
  - Tracks mastery per digit via localStorage
  - Introduces new digits only when child is ready
  - Struggling items get extra practice
  - Progress persists across browser sessions

## Tech Stack
- React 18 + Vite
- Web Speech API (recognition + synthesis)
- canvas-confetti for celebrations
- localStorage for progress persistence
- Vercel hosting (auto-deploy from GitHub)

## Adaptive Learning System (NEW)

### How It Works
```
Item States: new → learning → mastered
                      ↓
                 struggling (after 3+ consecutive fails)
```

### Mastery Criteria
- Success rate ≥ 80%
- Consecutive correct ≥ 2
- Minimum 4 attempts (rules out lucky guessing)

### Session Structure (10 items)
- Positions 1-2: Warm-up with highest mastery items
- Positions 3-6: Learning/struggling items (priority practice)
- Position 4-5: Possible new item introduction
- Positions 7-9: Mix based on due scores
- Position 10: Easy win (mastered item for confidence)

### Key Files
- `src/adaptiveEngine.js` - Core adaptive learning logic
- `src/App.jsx` - Main game component with adaptive integration

## Key Decisions

| Decision | Reasoning | Date |
|----------|-----------|------|
| Web Speech API | Works on mobile browsers, no native app needed | Jan 2026 |
| `includes()` matching | Toddlers repeat words ("six six") - need fuzzy matching | Jan 2026 |
| Interim results checking | Don't wait for final - accept as soon as match found | Jan 2026 |
| 3 attempts before reveal | Keeps it encouraging, not frustrating | Jan 2026 |
| Vercel deploy | Free, auto-deploys from GitHub | Jan 2026 |
| localStorage for progress | Simple, no backend needed, works offline | Jan 2026 |
| Start with 2 digits only | Hand-holding for toddlers, build confidence first | Jan 2026 |

## Voice Recognition Patterns (Important!)

### Number word mappings - accept all of these:
```javascript
// English
'0': ['zero', '0', 'oh', 'o']
'1': ['one', '1', 'won']
'2': ['two', '2', 'too', 'to']
// ... see LEARNINGS.md for full list

// Hebrew
'0': ['אפס', 'efes']
'1': ['אחת', 'אחד', 'achat', 'echad']
'2': ['שתיים', 'שניים', 'shtayim', 'shnayim']
// ... full mappings in App.jsx
```

### Critical fixes applied:
- Strip punctuation (Speech API returns "Five.")
- Use refs for stale closure issues in callbacks
- Short timeout (4 seconds) to avoid hanging
- Lazy state initialization to avoid lint errors

## How We Operate

### Development Workflow
1. **Claude Code** handles implementation on the cloud dev server
2. Work happens on `next` branch for new features
3. Test locally with `npm run dev`
4. Push to `next` branch, verify on Vercel preview
5. Merge to `master` when ready for production

### Communication Style
- Tamir provides high-level requirements and feedback
- Claude proposes implementation plans before coding
- Use BRAIN.md to maintain context across sessions
- LEARNINGS.md captures technical patterns for reference

### File Conventions
- `BRAIN.md` - Project overview and current state (this file)
- `LEARNINGS.md` - Technical patterns and solutions from V1
- `V2_SPEC.md` - Original design spec for Hebrew support

## Tamir's Preferences
- Keep it simple and fast to iterate
- Kids should be able to use it immediately
- Real testing happens with actual toddlers
- Progress should feel rewarding, not frustrating

## Known Issues / TODOs
- [x] V2: Add Hebrew letters/numbers - DONE
- [x] V2: Language toggle - DONE
- [x] Adaptive learning system - DONE
- [ ] Deploy `next` to production (merge to master)
- [ ] Consider lowercase letters
- [ ] Consider parent dashboard
- [ ] Consider adding actual letters (A-Z, א-ת) beyond digits

## Quick Commands
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Check code quality
git push origin next  # Deploy to preview
```

## Context for Claude
- LEARNINGS.md has detailed technical patterns from V1
- V2_SPEC.md has the full design spec (partially implemented)
- This is a real app used by Tamir's kids
- Current work is on `next` branch
- Adaptive learning is the latest major feature

---

*Last updated: January 23, 2026*
