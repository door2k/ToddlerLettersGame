# V1 Learnings - Toddler Letters Game

## What Was Implemented

### Core Stack
- **React 18** with Vite for fast development and builds
- **Web Speech API** for voice recognition (SpeechRecognition) and text-to-speech (SpeechSynthesis)
- **canvas-confetti** for celebration animations
- **Vercel** for deployment with GitHub auto-deploy

### Features
- Digits 0-9 recognition game
- Voice recognition with mic button
- Text-to-speech feedback and encouragement
- Confetti celebration on correct answers
- 3 attempts before revealing the answer
- Progress tracking with stars
- 10 items per session

## CSS Techniques

### Mobile-First Design
```css
/* Base styles for mobile */
.app {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
}

/* Touch-friendly buttons */
.mic-button {
  width: 150px;
  height: 150px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

### Responsive Layout
- Used `clamp()` for fluid typography: `font-size: clamp(8rem, 40vw, 15rem)`
- Flexbox for centering and layout
- Media queries for landscape mode and small screens
- `aspect-ratio: 1` for consistent card sizing

### Animations
- Keyframe animations for pulsing mic button, bouncing celebrations
- CSS transitions for smooth state changes
- `will-change` hints for better performance

## Voice Recognition Patterns

### What Works Well
1. **Interim results checking** - Accept answer as soon as it appears, don't wait for finalization
2. **Fuzzy matching with includes()** - Handles repetition like "six six" or "66"
3. **Punctuation stripping** - Speech API often returns "Five." with punctuation
4. **Multiple valid answers** - Accept "two", "2", "too", "to" for the digit 2
5. **Lowercase normalization** - Always compare in lowercase

### Code Pattern
```javascript
const checkAnswer = (spokenText) => {
  // Clean: lowercase, remove punctuation
  const text = spokenText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()

  // Check if any valid answer appears anywhere (handles repetition)
  for (const answer of validAnswers) {
    if (text.includes(answer)) return true
  }
  return false
}
```

### Number Word Mappings
```javascript
const numberWords = {
  '0': ['zero', '0', 'oh', 'o'],
  '1': ['one', '1', 'won'],
  '2': ['two', '2', 'too', 'to'],
  '3': ['three', '3', 'tree', 'free'],
  '4': ['four', '4', 'for', 'fore'],
  '5': ['five', '5', 'fife'],
  '6': ['six', '6', 'sicks'],
  '7': ['seven', '7'],
  '8': ['eight', '8', 'ate', 'ait'],
  '9': ['nine', '9', 'nein', 'nyne'],
}
```

## Issues Encountered & Solutions

### 1. White Screen on Load
**Problem**: Circular dependency in useCallback hooks caused "Cannot access before initialization" error.

**Solution**: Reorder function definitions and use refs to store current values:
```javascript
const currentIndexRef = useRef(currentIndex)
useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])
```

### 2. Speech Recognition Never Stopping
**Problem**: Stale closure - `onend` callback captured old `gameState` value.

**Solution**: Use a ref to track if answer was handled:
```javascript
const handledRef = useRef(false)
// In onresult: handledRef.current = true
// In onend: if (!handledRef.current) { ... }
```

### 3. Correct Answer Not Recognized
**Problem**: Speech API returns "Five." with punctuation, doesn't match "five".

**Solution**: Strip punctuation before matching:
```javascript
const text = spokenText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
```

### 4. Toddler Repetition ("six six")
**Problem**: Toddlers repeat words when not heard, "six six" didn't match "six".

**Solution**: Use `includes()` instead of exact match:
```javascript
if (text.includes(answer)) return true
```

### 5. Slow Recognition Feedback
**Problem**: Waiting for `finalTranscript` caused delay, word shown but not accepted.

**Solution**: Check interim results too:
```javascript
const transcriptToCheck = finalTranscript || interimTranscript
if (transcriptToCheck && checkAnswer(transcriptToCheck)) { ... }
```

## Browser Compatibility

### Web Speech API Support
- **Chrome (Android)**: Full support, best recognition
- **Safari (iOS)**: Full support with `webkitSpeechRecognition`
- **Firefox**: Limited support
- **Desktop Chrome**: Works but needs HTTPS

### Required Permissions
- Microphone access (prompted on first use)
- Works best over HTTPS (required for mic on most browsers)

## Performance Notes

- Keep recognition timeout short (4 seconds) to avoid hanging
- Cancel ongoing speech synthesis before starting new one
- Clean up recognition instance on unmount
- Use refs for values needed in callbacks to avoid stale closures

## Deployment

### Vercel Setup
- Connected GitHub repo for auto-deploy
- Framework preset: Vite (auto-detected)
- Build command: `npm run build`
- Output directory: `dist`
- Deploys on every push to master

### URLs
- Production: https://toddler-letters-game.vercel.app
- GitHub: https://github.com/door2k/ToddlerLettersGame
