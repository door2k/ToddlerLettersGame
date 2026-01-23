# Toddler Letters Game

> Voice recognition game for toddlers to learn letters and numbers

## Purpose
Educational game where toddlers see a letter/digit, speak its name into the microphone, and receive encouraging feedback. Designed for Tamir's kids.

## URLs
- **Production**: https://toddler-letters-game.vercel.app
- **GitHub**: https://github.com/door2k/ToddlerLettersGame

## Current State (Jan 2026)
- **V1 LIVE**: Digits 0-9 working with English voice recognition
- **V2 SPEC**: Hebrew support designed but not implemented (see V2_SPEC.md)
- Deployed on Vercel with GitHub auto-deploy

## Tech Stack
- React 18 + Vite
- Web Speech API (recognition + synthesis)
- canvas-confetti for celebrations
- Vercel hosting

## Key Decisions

| Decision | Reasoning | Date |
|----------|-----------|------|
| Web Speech API | Works on mobile browsers, no native app needed | Jan 2026 |
| `includes()` matching | Toddlers repeat words ("six six") - need fuzzy matching | Jan 2026 |
| Interim results checking | Don't wait for final - accept as soon as match found | Jan 2026 |
| 3 attempts before reveal | Keeps it encouraging, not frustrating | Jan 2026 |
| Vercel deploy | Free, auto-deploys from GitHub | Jan 2026 |

## Voice Recognition Patterns (Important\!)

### Number word mappings - accept all of these:
```javascript
'0': ['zero', '0', 'oh', 'o']
'1': ['one', '1', 'won']
'2': ['two', '2', 'too', 'to']
'3': ['three', '3', 'tree', 'free']
// ... see LEARNINGS.md for full list
```

### Critical fixes applied:
- Strip punctuation (Speech API returns "Five.")
- Use refs for stale closure issues in callbacks
- Short timeout (4 seconds) to avoid hanging

## Tamir's Preferences
- Keep it simple and fast to iterate
- Kids should be able to use it immediately
- Hebrew support is wanted for V2 (עברית)

## Known Issues / TODOs
- [ ] V2: Add Hebrew letters (א-ת)
- [ ] V2: Add Hebrew number names (אחת, שתיים...)
- [ ] V2: Language toggle
- [ ] Consider lowercase letters
- [ ] Consider parent dashboard

## Context for Claude
- LEARNINGS.md has detailed technical patterns from V1
- V2_SPEC.md has the full design for Hebrew support
- This is a real app used by Tamir's kids
- Runs on cloud server for development, deployed to Vercel

---

*Last updated: January 24, 2026*
