import { useState, useEffect, useCallback, useRef } from 'react'
import confetti from 'canvas-confetti'
import './App.css'

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

// Shuffle array
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
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
}

function App() {
  const [digits, setDigits] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [gameState, setGameState] = useState(STATES.READY)
  const [score, setScore] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)
  const [language, setLanguage] = useState('en') // 'en' or 'he'

  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)
  const handledRef = useRef(false)

  // Use refs to store current values for use in callbacks
  const currentIndexRef = useRef(currentIndex)
  const attemptsRef = useRef(attempts)
  const scoreRef = useRef(score)
  const digitsRef = useRef(digits)
  const languageRef = useRef(language)

  // Keep refs in sync
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])
  useEffect(() => { attemptsRef.current = attempts }, [attempts])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { digitsRef.current = digits }, [digits])
  useEffect(() => { languageRef.current = language }, [language])

  const currentDigit = digits[currentIndex]
  const maxAttempts = 3
  const totalItems = 10
  const t = strings[language]
  const isRTL = language === 'he'
  const speechLang = language === 'he' ? 'he-IL' : 'en-US'
  const numberWords = language === 'he' ? hebrewNumberWords : englishNumberWords

  // Initialize game
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechSupported(false)
      return
    }
    const allDigits = shuffle(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    setDigits(allDigits)

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Get display name for digit
  const getDigitName = useCallback((digit, lang) => {
    if (lang === 'he') {
      return hebrewNumberNames[digit] || digit
    }
    return digit
  }, [])

  // Move to next digit
  const moveToNext = useCallback(() => {
    setTranscript('')
    setAttempts(0)

    if (currentIndexRef.current >= totalItems - 1) {
      setGameState(STATES.COMPLETE)
      celebrate()
      const lang = languageRef.current
      const txt = strings[lang]
      speak(`${txt.amazing} ${scoreRef.current} ${txt.outOf} ${totalItems}! ${txt.greatJob}`, lang === 'he' ? 'he-IL' : 'en-US')
    } else {
      setCurrentIndex(i => i + 1)
      setGameState(STATES.READY)
    }
  }, [])

  // Handle correct answer
  const handleCorrect = useCallback(() => {
    setGameState(STATES.CORRECT)
    setScore(s => s + 1)
    celebrate()

    const digit = digitsRef.current[currentIndexRef.current]
    const lang = languageRef.current
    const celebrationText = randomItem(celebrations[lang])
    const digitName = lang === 'he' ? hebrewNumberNames[digit] : digit

    speak(`${celebrationText} ${digitName}!`, lang === 'he' ? 'he-IL' : 'en-US', () => {
      timeoutRef.current = setTimeout(() => {
        moveToNext()
      }, 1500)
    })
  }, [moveToNext])

  // Handle wrong answer
  const handleWrong = useCallback(() => {
    setGameState(STATES.WRONG)
    const lang = languageRef.current
    const encouragement = randomItem(encouragements[lang])
    speak(encouragement, lang === 'he' ? 'he-IL' : 'en-US', () => {
      timeoutRef.current = setTimeout(() => {
        setGameState(STATES.READY)
      }, 500)
    })
  }, [])

  // Handle reveal after max attempts
  const handleReveal = useCallback(() => {
    setGameState(STATES.REVEAL)
    const digit = digitsRef.current[currentIndexRef.current]
    const lang = languageRef.current
    const txt = strings[lang]
    const digitName = lang === 'he' ? hebrewNumberNames[digit] : digit
    const speechLanguage = lang === 'he' ? 'he-IL' : 'en-US'

    speak(`${txt.thisIs} ${digitName}! ${digitName}! ${txt.canYouSay} ${digitName}?`, speechLanguage, () => {
      timeoutRef.current = setTimeout(() => {
        speak(txt.wonderful, speechLanguage, () => {
          timeoutRef.current = setTimeout(() => {
            moveToNext()
          }, 1000)
        })
      }, 2000)
    })
  }, [moveToNext])

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
    const allDigits = shuffle(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    setDigits(allDigits)
    setCurrentIndex(0)
    setAttempts(0)
    setScore(0)
    setTranscript('')
    setGameState(STATES.READY)
    speak(t.letsPlayAgain, speechLang)
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
          {speechSupported ? (
            <button className="start-button" onClick={startGame}>
              {t.letsPlay}
            </button>
          ) : (
            <p className="error">
              {t.speechNotSupported}
            </p>
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
