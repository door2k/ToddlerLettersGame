# Letter & Number Voice Recognition Game - Design Plan
## A Toddler's Game - V2 (English + Hebrew)

## Overview
A mobile educational game for toddlers where they see a letter or digit, speak its name into the microphone, and receive encouraging feedback. **Now with full Hebrew support!**

## Core Game Loop

```
┌─────────────────┐
│  Show Letter/   │
│    Digit        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Child taps     │
│  Mic button     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Voice          │
│  Recognition    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Correct│ │ Wrong │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────┐ ┌────────────┐
│Amazing│ │Encourage   │
│Celebr.│ │Try Again   │
└───┬───┘ └──────┬─────┘
    │            │
    │      (after 2-3 tries)
    │            ▼
    │     ┌────────────┐
    │     │App says it │
    │     │+ celebrate │
    │     └──────┬─────┘
    │            │
    └─────┬──────┘
          ▼
    ┌───────────┐
    │ Next Item │
    └───────────┘
```

## Screens & UI

### 1. Main Game Screen
- Large, friendly display of letter/digit (centered, colorful)
- Big microphone button at bottom (pulsing gently to invite tap)
- Fun background (customizable themes?)
- Progress indicator (optional - stars/stickers collected)

### 2. Listening State
- Mic button animates (sound waves)
- Visual feedback showing "I'm listening!"
- Timeout after ~3 seconds of silence

### 3. Correct Answer Celebration
- Confetti/stars animation
- Happy sound effect
- Cheerful voice:
  - English: "Yes! That's the letter A! Great job!"
  - Hebrew: "יופי! זאת האות א׳! כל הכבוד!"
- Character animation (jumping, dancing)
- Short celebration (2-3 seconds) then auto-advance

### 4. Wrong Answer - Encouragement
- Gentle, supportive tone
- Voice:
  - English: "Almost! Try again!" / "You can do it!"
  - Hebrew: "כמעט! נסה שוב!" / "אתה יכול!"
- No negative sounds or visuals
- Mic button ready for another try

### 5. After Multiple Wrong Attempts (2-3)
- Supportive transition
- Voice:
  - English: "This is the letter A! A! Can you say A?"
  - Hebrew: "זאת האות א׳! א׳! אתה יכול להגיד א׳?"
- Brief pause for child to repeat (optional recognition)
- Celebrate regardless: "Wonderful!" / "מעולה!"
- Move to next item

## Technical Components

### 1. Speech Recognition
- Use platform native:
  - iOS: Speech framework
  - Android: SpeechRecognizer API
- Optimize for children's voices (higher pitch)
- **Language Support**:
  - English (en-US, en-GB)
  - Hebrew (he-IL) - native support on both platforms
  - Switch recognition language based on current content
- **Hebrew-specific considerations**:
  - Letter names vs sounds (e.g., "Alef" vs the sound)
  - Handle similar-sounding letters (ח/כ, ע/א)
- Offline mode consideration

### 2. Text-to-Speech
- Natural, warm, child-friendly voice
- Platform native TTS or pre-recorded audio
- Consistent character voice throughout

### 3. Content System
- **English Letters**: A-Z (uppercase first, then lowercase)
- **Hebrew Letters**: א-ת (22 letters)
  - Alef (א), Bet (ב), Gimel (ג), Dalet (ד), He (ה), Vav (ו), Zayin (ז), Chet (ח), Tet (ט), Yod (י), Kaf (כ), Lamed (ל), Mem (מ), Nun (נ), Samech (ס), Ayin (ע), Pe (פ), Tsadi (צ), Qof (ק), Resh (ר), Shin (ש), Tav (ת)
  - Final forms (sofit): ך, ם, ן, ף, ץ (advanced level)
- **Digits**: 0-9 (with Hebrew names: אפס, אחת, שתיים...)
- Progression system (start simple, increase)
- Shuffle within difficulty level

### 4. Audio/Visual Assets
- Celebration sounds (variety to avoid repetition)
- Encouragement sounds
- Background music (optional, toggleable)
- Animations for correct/try-again states

## Progression & Difficulty

### English Track:
- **Level 1**: Single Digits (0-9)
- **Level 2**: Uppercase Letters (A-Z)
- **Level 3**: Lowercase Letters (a-z)
- **Level 4**: Mixed (digits + letters)
- **Level 5**: Similar-sounding items (B/D/P, M/N, etc.)

### Hebrew Track:
- **Level 1**: מספרים (0-9 with Hebrew names)
- **Level 2**: אותיות בסיסיות (א-ת, 22 letters)
- **Level 3**: אותיות דומות (ב/כ, ח/ה, ו/ז, etc.)
- **Level 4**: אותיות סופיות (ך, ם, ן, ף, ץ)
- **Level 5**: מעורב (letters + numbers)

### Bilingual Track:
- **Level 1**: Digits in both languages
- **Level 2**: Mixed English + Hebrew letters
- **Level 3**: Switch language mid-session challenge

## Settings (Parent Area)
- Sound on/off
- Music on/off
- Number of retries before reveal (2-3)
- Content selection (letters only, numbers only, both)
- **Language selection**:
  - English only
  - Hebrew only (עברית)
  - Bilingual (both)
- **UI Language**: English or Hebrew interface
- **Voice Language**: Match content or always Hebrew/English
- Session length (5/10/15 items)

## Engagement Features
- Sticker/star collection
- Simple achievements
- Daily streak (optional)
- No ads (premium or one-time purchase)
- No in-app purchases accessible to child

## Technical Stack Options

### Option A: Cross-Platform (Recommended for MVP)
- **Flutter** + speech_to_text package + flutter_tts
- Single codebase for iOS & Android
- Good performance for simple animations

### Option B: Native
- **iOS**: Swift + Speech framework
- **Android**: Kotlin + SpeechRecognizer
- Better voice recognition accuracy
- More development effort

### Option C: React Native
- react-native-voice
- Familiar if you know React
- May have more edge cases with audio

## MVP Scope (Phase 1) - V2
1. Single digits 0-9 (English or Hebrew names)
2. Basic mic button + voice recognition
3. Correct/wrong feedback with voice (bilingual)
4. 3 attempts then reveal
5. Simple celebration animation
6. 10 items per session
7. **Language toggle: English/Hebrew**

## Phase 2: Full Alphabet
- English letters (A-Z uppercase)
- Hebrew letters (א-ת)
- Mixed mode toggle

## Future Enhancements (Phase 3+)
- Lowercase English letters
- Hebrew final forms (sofit)
- Parent dashboard with progress
- Multiple child profiles
- Themed visual packs
- Words (after mastering letters) - English & Hebrew
- Additional languages (Arabic, Russian, etc.)

## Privacy & Safety
- No data collection from children
- COPPA compliant
- Offline-capable
- No external links accessible to child
- Parent gate for settings

---

*Ready to discuss implementation details when you're back at the console!*
