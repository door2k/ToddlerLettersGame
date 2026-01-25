import { useState, useEffect, useCallback, useRef } from 'react'
import confetti from 'canvas-confetti'
import './App.css'
import {
  initializeStats,
  createLearnerProfile,
  loadProgress,
  saveProgress,
  clearProgress,
  updateItemStats as updateStats,
  selectNextItems,
  getProgressSummary,
  getItemStatus,
  ItemStatus,
} from './adaptiveEngine'

// English number words mapping for speech recognition
const englishNumberWords = {
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

// Hebrew number words mapping for speech recognition
const hebrewNumberWords = {
  '0': ['אפס', 'efes', 'אֶפֶס'],
  '1': ['אחת', 'אחד', 'achat', 'echad', 'אַחַת', 'אֶחָד'],
  '2': ['שתיים', 'שניים', 'shtayim', 'shnayim', 'שְׁתַּיִם', 'שְׁנַיִם'],
  '3': ['שלוש', 'shalosh', 'שָׁלוֹשׁ'],
  '4': ['ארבע', 'arba', 'אַרְבַּע'],
  '5': ['חמש', 'hamesh', 'חָמֵשׁ'],
  '6': ['שש', 'shesh', 'שֵׁשׁ'],
  '7': ['שבע', 'sheva', 'שֶׁבַע'],
  '8': ['שמונה', 'shmone', 'שְׁמוֹנֶה'],
  '9': ['תשע', 'tesha', 'תֵּשַׁע'],
}

// Hebrew number display names (how to say them)
const hebrewNumberNames = {
  '0': 'אֶפֶס',
  '1': 'אַחַת',
  '2': 'שְׁתַּיִם',
  '3': 'שָׁלוֹשׁ',
  '4': 'אַרְבַּע',
  '5': 'חָמֵשׁ',
  '6': 'שֵׁשׁ',
  '7': 'שֶׁבַע',
  '8': 'שְׁמוֹנֶה',
  '9': 'תֵּשַׁע',
}

// Bilingual text strings
const strings = {
  en: {
    title: '🔢 Number Fun!',
    subtitle: 'Learn to say your numbers!',
    letsPlay: "Let's Play! 🎉",
    tapToSpeak: 'Tap to speak',
    listening: 'Listening...',
    imListening: "I'm listening...",
    allDone: '🎉 All Done! 🎉',
    outOf: 'out of',
    playAgain: 'Play Again! 🔄',
    speechNotSupported: 'Sorry, speech recognition is not supported in your browser. Please try Chrome on Android or Safari on iOS.',
    thisIs: "This is",
    canYouSay: "Can you say",
    letsPlayPrompt: "Let's play! What number is this?",
    letsPlayAgain: "Let's play again! What number is this?",
    wonderful: "Wonderful! Let's try another one!",
    amazing: "Amazing! You got",
    greatJob: "Great job!",
  },
  he: {
    title: '🔢 !משחק מספרים',
    subtitle: '!בואו נלמד לומר מספרים',
    letsPlay: '!בואו נשחק 🎉',
    tapToSpeak: 'לחץ לדבר',
    listening: '...מקשיב',
    imListening: '...אני מקשיב',
    allDone: '🎉 !סיימנו 🎉',
    outOf: 'מתוך',
    playAgain: '!שחק שוב 🔄',
    speechNotSupported: 'מצטערים, זיהוי קולי לא נתמך בדפדפן שלך. נסה Chrome באנדרואיד או Safari באייפון.',
    thisIs: 'זה המספר',
    canYouSay: '?אתה יכול להגיד',
    letsPlayPrompt: '?בואו נשחק! איזה מספר זה',
    letsPlayAgain: '?בואו נשחק שוב! איזה מספר זה',
    wonderful: '!מעולה! בואו ננסה עוד אחד',
    amazing: '!מדהים! קיבלת',
    greatJob: '!כל הכבוד',
  }
}

const encouragements = {
  en: [
    "Almost! Try again!",
    "You can do it!",
    "Give it another try!",
    "So close! Try once more!",
  ],
  he: [
    "!כמעט! נסה שוב",
    "!אתה יכול",
    "!נסה עוד פעם",
    "!קרוב! עוד פעם",
  ]
}

const celebrations = {
  en: [
    "Amazing!",
    "Wonderful!",
    "Great job!",
    "You did it!",
    "Fantastic!",
    "Super!",
  ],
  he: [
    "!מדהים",
    "!מעולה",
    "!כל הכבוד",
    "!עשית את זה",
    "!פנטסטי",
    "!סופר",
  ]
}

// Get random item from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Speak text using Web Speech API
function speak(text, lang = 'en-US', onEnd = null) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9
    utterance.pitch = 1.1
    utterance.volume = 1
    if (onEnd) {
      utterance.onend = onEnd
    }
    window.speechSynthesis.speak(utterance)
  }
}

// Fire confetti celebration
function celebrate() {
  const count = 200
  const defaults = { origin: { y: 0.7 }, zIndex: 1000 }

  function fire(particleRatio, opts) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
  }

  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}

// Game states
const STATES = {
  READY: 'ready',
  LISTENING: 'listening',
  CORRECT: 'correct',
  WRONG: 'wrong',
  REVEAL: 'reveal',
  COMPLETE: 'complete',
  COMPARING: 'comparing', // New state for showing what child said
}

// Extract digit from spoken transcript
const extractDigitFromTranscript = (transcript, language) => {
  if (!transcript) return null
  const words = language === 'he' ? hebrewNumberWords : englishNumberWords
  const text = transcript.toLowerCase().trim()
  const textWords = text.split(/\s+/)

  // Check each word in the transcript against valid words for each digit
  for (const spokenWord of textWords) {
    for (const [digit, validWords] of Object.entries(words)) {
      if (validWords.some(word => word.toLowerCase() === spokenWord)) {
        return digit
      }
    }
  }
  return null // Couldn't map to a digit
}

function App() {
  // Initialize digits lazily based on adaptive learning state
  const [initialDigits] = useState(() => {
    const savedProgress = loadProgress()
    const stats = savedProgress ? savedProgress.itemStats : initializeStats()
    const profile = savedProgress
      ? { ...savedProgress.learnerProfile, newItemsIntroducedThisSession: 0 }
      : createLearnerProfile()
    return selectNextItems(stats, profile, 10)
  })
  const [digits, setDigits] = useState(initialDigits)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [gameState, setGameState] = useState(STATES.READY)
  const [score, setScore] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  const [speechSupported] = useState(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    return !!SpeechRecognition
  })
  const [language, setLanguage] = useState('en') // 'en' or 'he'

  // Adaptive learning state - initialized lazily
  const [adaptiveState] = useState(() => {
    const savedProgress = loadProgress()
    if (savedProgress) {
      console.log('Loaded saved progress:', getProgressSummary(savedProgress.itemStats))
      return {
        itemStats: savedProgress.itemStats,
        learnerProfile: { ...savedProgress.learnerProfile, newItemsIntroducedThisSession: 0 },
      }
    }
    console.log('Initialized fresh progress')
    return {
      itemStats: initializeStats(),
      learnerProfile: createLearnerProfile(),
    }
  })
  const [itemStats, setItemStats] = useState(adaptiveState.itemStats)
  const [learnerProfile, setLearnerProfile] = useState(adaptiveState.learnerProfile)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isFirstTry, setIsFirstTry] = useState(true)
  const [saidDigit, setSaidDigit] = useState(null)
  const [comparisonPhase, setComparisonPhase] = useState(null) // 'showing-said' | 'showing-comparison'

  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)
  const handledRef = useRef(false)
  const transcriptRef = useRef('')

  // Use refs to store current values for use in callbacks
  const currentIndexRef = useRef(currentIndex)
  const attemptsRef = useRef(attempts)
  const scoreRef = useRef(score)
  const digitsRef = useRef(digits)
  const languageRef = useRef(language)
  const itemStatsRef = useRef(itemStats)
  const learnerProfileRef = useRef(learnerProfile)
  const isFirstTryRef = useRef(isFirstTry)

  // Keep refs in sync
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])
  useEffect(() => { attemptsRef.current = attempts }, [attempts])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { digitsRef.current = digits }, [digits])
  useEffect(() => { languageRef.current = language }, [language])
  useEffect(() => { itemStatsRef.current = itemStats }, [itemStats])
  useEffect(() => { learnerProfileRef.current = learnerProfile }, [learnerProfile])
  useEffect(() => { isFirstTryRef.current = isFirstTry }, [isFirstTry])
  useEffect(() => { transcriptRef.current = transcript }, [transcript])

  const currentDigit = digits[currentIndex]
  const maxAttempts = 3
  const totalItems = 10
  const t = strings[language]
  const isRTL = language === 'he'
  const speechLang = language === 'he' ? 'he-IL' : 'en-US'

  // Cleanup on unmount
  useEffect(() => {
    console.log('Session digits:', digits)
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Update item stats and save progress
  const updateItemStatsCallback = useCallback((digit, wasCorrect, wasFirstTry) => {
    setItemStats(prevStats => {
      if (!prevStats || !prevStats[digit]) return prevStats
      const updated = updateStats(prevStats[digit], wasCorrect, wasFirstTry)
      const newStats = { ...prevStats, [digit]: updated }
      console.log('Updated stats for', digit, ':', updated.status, 'success rate:', Math.round((updated.timesCorrect / updated.timesShown) * 100) + '%')
      return newStats
    })
  }, [])

  // Save progress to localStorage
  const saveProgressCallback = useCallback(() => {
    if (itemStatsRef.current && learnerProfileRef.current) {
      const profile = {
        ...learnerProfileRef.current,
        totalSessions: learnerProfileRef.current.totalSessions + 1,
        lastSessionDate: new Date().toISOString().split('T')[0],
      }
      setLearnerProfile(profile)
      saveProgress(itemStatsRef.current, profile)
      console.log('Progress saved')
    }
  }, [])

  // Move to next digit
  const moveToNext = useCallback(() => {
    setTranscript('')
    setAttempts(0)
    setIsFirstTry(true) // Reset for next digit

    if (currentIndexRef.current >= totalItems - 1) {
      setGameState(STATES.COMPLETE)
      celebrate()
      const lang = languageRef.current
      const txt = strings[lang]
      speak(`${txt.amazing} ${scoreRef.current} ${txt.outOf} ${totalItems}! ${txt.greatJob}`, lang === 'he' ? 'he-IL' : 'en-US')
      // Save progress on session complete
      saveProgressCallback()
    } else {
      setCurrentIndex(i => i + 1)
      setGameState(STATES.READY)
    }
  }, [saveProgressCallback])

  // Handle correct answer
  const handleCorrect = useCallback(() => {
    setGameState(STATES.CORRECT)
    setScore(s => s + 1)
    celebrate()

    const digit = digitsRef.current[currentIndexRef.current]
    const lang = languageRef.current
    const celebrationText = randomItem(celebrations[lang])
    const digitName = lang === 'he' ? hebrewNumberNames[digit] : digit

    // Update adaptive learning stats - correct answer
    updateItemStatsCallback(digit, true, isFirstTryRef.current)

    speak(`${celebrationText} ${digitName}!`, lang === 'he' ? 'he-IL' : 'en-US', () => {
      timeoutRef.current = setTimeout(() => {
        moveToNext()
      }, 1500)
    })
  }, [moveToNext, updateItemStatsCallback])

  // Handle wrong answer
  const handleWrong = useCallback(() => {
    setIsFirstTry(false) // No longer first try after a wrong answer
    const lang = languageRef.current
    const currentDigitValue = digitsRef.current[currentIndexRef.current]

    // Try to extract what digit they said
    const spokenDigit = extractDigitFromTranscript(transcriptRef.current, lang)

    if (spokenDigit && spokenDigit !== currentDigitValue) {
      // Show what they said, then redirect to correct answer positively
      setSaidDigit(spokenDigit)
      setComparisonPhase('showing-said')
      setGameState(STATES.COMPARING)

      // Phase 1: Brief flash of what they said (1s) - validates we heard them
      timeoutRef.current = setTimeout(() => {
        setComparisonPhase('showing-correct')

        // Phase 2: Show correct answer with positive message
        const correctName = lang === 'he' ? hebrewNumberNames[currentDigitValue] : currentDigitValue
        const positiveRedirect = lang === 'he'
          ? `זה ${correctName}!`
          : `This is ${correctName}!`

        speak(positiveRedirect, lang === 'he' ? 'he-IL' : 'en-US', () => {
          timeoutRef.current = setTimeout(() => {
            setGameState(STATES.READY)
            setSaidDigit(null)
            setComparisonPhase(null)
          }, 500)
        })
      }, 1000)
    } else {
      // Original flow - couldn't recognize a specific digit
      setGameState(STATES.WRONG)
      const encouragement = randomItem(encouragements[lang])
      speak(encouragement, lang === 'he' ? 'he-IL' : 'en-US', () => {
        timeoutRef.current = setTimeout(() => {
          setGameState(STATES.READY)
        }, 500)
      })
    }
  }, [])

  // Handle reveal after max attempts
  const handleReveal = useCallback(() => {
    setGameState(STATES.REVEAL)
    const digit = digitsRef.current[currentIndexRef.current]
    const lang = languageRef.current
    const txt = strings[lang]
    const digitName = lang === 'he' ? hebrewNumberNames[digit] : digit
    const speechLanguage = lang === 'he' ? 'he-IL' : 'en-US'

    // Update adaptive learning stats - failed after max attempts
    updateItemStatsCallback(digit, false, false)

    speak(`${txt.thisIs} ${digitName}! ${digitName}! ${txt.canYouSay} ${digitName}?`, speechLanguage, () => {
      timeoutRef.current = setTimeout(() => {
        speak(txt.wonderful, speechLanguage, () => {
          timeoutRef.current = setTimeout(() => {
            moveToNext()
          }, 1000)
        })
      }, 2000)
    })
  }, [moveToNext, updateItemStatsCallback])

  // Check if transcript matches current digit
  const checkAnswer = useCallback((spokenText) => {
    // Clean the text: lowercase, remove punctuation, trim
    const text = spokenText.toLowerCase().replace(/[^a-z0-9\u0590-\u05FF\s]/g, '').trim()
    const digit = digitsRef.current[currentIndexRef.current]
    const lang = languageRef.current
    const words = lang === 'he' ? hebrewNumberWords : englishNumberWords
    const validAnswers = words[digit] || []

    console.log('Speech check:', { raw: spokenText, cleaned: text, digit, validAnswers, lang })

    // Check if any valid answer appears anywhere (handles repetition)
    for (const answer of validAnswers) {
      if (text.includes(answer.toLowerCase())) {
        console.log('MATCH found (contains):', answer)
        return true
      }
    }

    // Also check each word individually
    const textWords = text.split(/\s+/)
    for (const word of textWords) {
      if (validAnswers.map(a => a.toLowerCase()).includes(word)) {
        console.log('MATCH found (word):', word)
        return true
      }
    }

    console.log('No match found')
    return false
  }, [])

  // Start listening for speech
  const startListening = useCallback(() => {
    if (!speechSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    if (recognitionRef.current) recognitionRef.current.abort()

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    const recognitionLang = languageRef.current === 'he' ? 'he-IL' : 'en-US'
    recognition.lang = recognitionLang
    recognition.maxAlternatives = 5

    console.log('Starting recognition with lang:', recognitionLang, 'languageRef:', languageRef.current)

    recognition.onstart = () => {
      handledRef.current = false
      setGameState(STATES.LISTENING)
      setTranscript('')
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(currentTranscript)

      console.log('Recognition result:', { final: finalTranscript, interim: interimTranscript, isFinal: !!finalTranscript })

      // Check both final and interim transcripts for a match
      const transcriptToCheck = finalTranscript || interimTranscript
      if (transcriptToCheck && checkAnswer(transcriptToCheck)) {
        handledRef.current = true
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        recognition.abort()
        handleCorrect()
      }
    }

    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error)
      if (event.error !== 'aborted' && !handledRef.current) {
        setGameState(STATES.READY)
      }
    }

    recognition.onend = () => {
      if (!handledRef.current) {
        const newAttempts = attemptsRef.current + 1
        setAttempts(newAttempts)

        if (newAttempts >= maxAttempts) {
          handleReveal()
        } else {
          handleWrong()
        }
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (e) {
      console.log('Recognition start error:', e)
    }

    timeoutRef.current = setTimeout(() => {
      if (recognitionRef.current) recognitionRef.current.stop()
    }, 4000)
  }, [speechSupported, checkAnswer, handleCorrect, handleWrong, handleReveal])

  // Start game
  const startGame = () => {
    setHasStarted(true)
    setGameState(STATES.READY)
    speak(t.letsPlayPrompt, speechLang)
  }

  // Restart game
  const restartGame = () => {
    // Reset session-specific counter in profile
    const updatedProfile = {
      ...learnerProfileRef.current,
      newItemsIntroducedThisSession: 0,
    }
    setLearnerProfile(updatedProfile)

    // Select new items using adaptive algorithm
    const sessionDigits = selectNextItems(itemStatsRef.current, updatedProfile, totalItems)
    setDigits(sessionDigits)
    console.log('New session digits:', sessionDigits)

    setCurrentIndex(0)
    setAttempts(0)
    setScore(0)
    setTranscript('')
    setIsFirstTry(true)
    setGameState(STATES.READY)
    speak(t.letsPlayAgain, speechLang)
  }

  // Reset all progress
  const resetProgress = () => {
    clearProgress()
    const stats = initializeStats()
    const profile = createLearnerProfile()
    setItemStats(stats)
    setLearnerProfile(profile)

    const sessionDigits = selectNextItems(stats, profile, totalItems)
    setDigits(sessionDigits)
    setCurrentIndex(0)
    setAttempts(0)
    setScore(0)
    setTranscript('')
    setIsFirstTry(true)
    setHasStarted(false)
    setShowResetConfirm(false)
    console.log('Progress reset, starting fresh')
  }

  // Handle mic button tap
  const handleMicTap = () => {
    if (gameState === STATES.READY) {
      startListening()
    }
  }

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(l => l === 'en' ? 'he' : 'en')
  }

  // Get progress summary for display
  const progressSummary = itemStats ? getProgressSummary(itemStats) : null

  // Render start screen
  if (!hasStarted) {
    return (
      <div className={`app ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="start-screen">
          <button className="lang-toggle" onClick={toggleLanguage}>
            {language === 'en' ? 'עברית' : 'English'}
          </button>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>

          {progressSummary && progressSummary.mastered > 0 && (
            <div className="mastery-indicator">
              <span className="mastery-stars">
                {'⭐'.repeat(progressSummary.mastered)}
              </span>
              <span className="mastery-text">
                {progressSummary.mastered}/{progressSummary.total} {language === 'he' ? 'נלמדו' : 'mastered'}
              </span>
            </div>
          )}

          {speechSupported ? (
            <button className="start-button" onClick={startGame}>
              {t.letsPlay}
            </button>
          ) : (
            <p className="error">
              {t.speechNotSupported}
            </p>
          )}

          {progressSummary && progressSummary.mastered > 0 && (
            <div className="reset-section">
              {showResetConfirm ? (
                <div className="reset-confirm">
                  <span>{language === 'he' ? '?לאפס התקדמות' : 'Reset progress?'}</span>
                  <button className="reset-yes" onClick={resetProgress}>
                    {language === 'he' ? 'כן' : 'Yes'}
                  </button>
                  <button className="reset-no" onClick={() => setShowResetConfirm(false)}>
                    {language === 'he' ? 'לא' : 'No'}
                  </button>
                </div>
              ) : (
                <button className="reset-button" onClick={() => setShowResetConfirm(true)}>
                  {language === 'he' ? 'התחל מחדש' : 'Reset Progress'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render completion screen
  if (gameState === STATES.COMPLETE) {
    return (
      <div className={`app ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="complete-screen">
          <h1>{t.allDone}</h1>
          <div className="final-score">
            <span className="score-number">{score}</span>
            <span className="score-label">{t.outOf} {totalItems}</span>
          </div>
          <div className="stars">
            {'⭐'.repeat(Math.min(score, 10))}
          </div>
          {progressSummary && (
            <div className="session-summary">
              <div className="summary-item">
                <span className="summary-label">{language === 'he' ? 'נלמדו' : 'Mastered'}:</span>
                <span className="summary-value">{progressSummary.mastered}/{progressSummary.total}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{language === 'he' ? 'בלימוד' : 'Learning'}:</span>
                <span className="summary-value">{progressSummary.learning}</span>
              </div>
              {progressSummary.newItems < progressSummary.total && (
                <div className="summary-item">
                  <span className="summary-label">{language === 'he' ? 'להכיר' : 'To discover'}:</span>
                  <span className="summary-value">{progressSummary.newItems}</span>
                </div>
              )}
            </div>
          )}
          <button className="restart-button" onClick={restartGame}>
            {t.playAgain}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`app ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <button className="lang-toggle-small" onClick={toggleLanguage}>
        {language === 'en' ? 'עב' : 'EN'}
      </button>

      <div className="progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentIndex) / totalItems) * 100}%` }}
          />
        </div>
        <div className="progress-text">
          {currentIndex + 1} / {totalItems}
        </div>
      </div>

      <div className="score">
        {'⭐'.repeat(score)}
      </div>

      <div className={`digit-display ${gameState === STATES.CORRECT ? 'celebrating' : ''} ${gameState === STATES.REVEAL ? 'revealing' : ''}`}>
        <span className="digit">{currentDigit}</span>
        {language === 'he' && currentDigit && (
          <span className="digit-name-hebrew">{hebrewNumberNames[currentDigit]}</span>
        )}
        {itemStats && currentDigit && (
          <span className={`item-status status-${getItemStatus(itemStats, currentDigit)}`}>
            {getItemStatus(itemStats, currentDigit) === ItemStatus.NEW && '🆕'}
            {getItemStatus(itemStats, currentDigit) === ItemStatus.MASTERED && '⭐'}
          </span>
        )}
      </div>

      <div className="feedback">
        {gameState === STATES.LISTENING && (
          <div className="listening-indicator">
            <span className="pulse">🎤</span>
            <span>{t.imListening}</span>
          </div>
        )}
        {gameState === STATES.CORRECT && (
          <div className="correct-feedback">
            ✨ {randomItem(celebrations[language])} ✨
          </div>
        )}
        {gameState === STATES.WRONG && (
          <div className="wrong-feedback">
            {randomItem(encouragements[language])}
          </div>
        )}
        {gameState === STATES.REVEAL && (
          <div className="reveal-feedback">
            {t.thisIs} {language === 'he' ? hebrewNumberNames[currentDigit] : currentDigit}!
          </div>
        )}
        {gameState === STATES.COMPARING && (
          <div className="comparison-container">
            {comparisonPhase === 'showing-said' && (
              <div className="said-digit">
                <span className="digit-shown said-digit-display">{saidDigit}</span>
              </div>
            )}
            {comparisonPhase === 'showing-correct' && (
              <div className="correct-reveal">
                <span className="digit-shown correct-digit highlighted">{currentDigit}</span>
              </div>
            )}
          </div>
        )}
        {transcript && gameState === STATES.LISTENING && (
          <div className="transcript">
            {language === 'he' ? `"${transcript}" :שמעתי` : `Heard: "${transcript}"`}
          </div>
        )}
      </div>

      <div className="attempts">
        {[...Array(maxAttempts)].map((_, i) => (
          <span
            key={i}
            className={`attempt-dot ${i < attempts ? 'used' : ''}`}
          />
        ))}
      </div>

      <button
        className={`mic-button ${gameState === STATES.LISTENING ? 'listening' : ''} ${gameState !== STATES.READY ? 'disabled' : ''}`}
        onClick={handleMicTap}
        disabled={gameState !== STATES.READY}
      >
        <span className="mic-icon">🎤</span>
        <span className="mic-label">
          {gameState === STATES.LISTENING ? t.listening : t.tapToSpeak}
        </span>
      </button>
    </div>
  )
}

export default App
