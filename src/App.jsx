import { useState, useEffect, useCallback, useRef } from 'react'
import confetti from 'canvas-confetti'
import './App.css'

// Number words mapping for speech recognition
const numberWords = {
  '0': ['zero', '0', 'oh', 'o'],
  '1': ['one', '1', 'won'],
  '2': ['two', '2', 'too', 'to'],
  '3': ['three', '3', 'tree', 'free'],
  '4': ['four', '4', 'for', 'fore'],
  '5': ['five', '5', 'fife'],
  '6': ['six', '6', 'sicks', 'sex'],
  '7': ['seven', '7'],
  '8': ['eight', '8', 'ate', 'ait'],
  '9': ['nine', '9', 'nein', 'nyne'],
}

const encouragements = [
  "Almost! Try again!",
  "You can do it!",
  "Give it another try!",
  "So close! Try once more!",
]

const celebrations = [
  "Amazing!",
  "Wonderful!",
  "Great job!",
  "You did it!",
  "Fantastic!",
  "Super!",
]

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
function speak(text, onEnd = null) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
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
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 1000,
  }

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
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

  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)

  const currentDigit = digits[currentIndex]
  const maxAttempts = 3
  const totalItems = 10

  // Initialize game
  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechSupported(false)
      return
    }

    // Initialize digits
    const allDigits = shuffle(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    setDigits(allDigits)

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Check if transcript matches current digit
  const checkAnswer = useCallback((spokenText) => {
    const text = spokenText.toLowerCase().trim()
    const validAnswers = numberWords[currentDigit] || []

    // Check if any word in the transcript matches
    const words = text.split(/\s+/)
    for (const word of words) {
      if (validAnswers.includes(word)) {
        return true
      }
    }
    // Also check full transcript
    return validAnswers.includes(text)
  }, [currentDigit])

  // Start listening for speech
  const startListening = useCallback(() => {
    if (!speechSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    // Clean up previous instance
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 5

    recognition.onstart = () => {
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

      if (finalTranscript && checkAnswer(finalTranscript)) {
        recognition.abort()
        handleCorrect()
      }
    }

    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error)
      if (event.error !== 'aborted') {
        setGameState(STATES.READY)
      }
    }

    recognition.onend = () => {
      if (gameState === STATES.LISTENING) {
        // Recognition ended without a correct answer
        const newAttempts = attempts + 1
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

    // Stop listening after 4 seconds
    timeoutRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }, 4000)
  }, [speechSupported, gameState, attempts, checkAnswer])

  // Handle correct answer
  const handleCorrect = useCallback(() => {
    setGameState(STATES.CORRECT)
    setScore(s => s + 1)
    celebrate()

    const celebrationText = randomItem(celebrations)
    speak(`${celebrationText} That's ${currentDigit}!`, () => {
      // Move to next after celebration
      timeoutRef.current = setTimeout(() => {
        moveToNext()
      }, 1500)
    })
  }, [currentDigit])

  // Handle wrong answer
  const handleWrong = useCallback(() => {
    setGameState(STATES.WRONG)
    const encouragement = randomItem(encouragements)
    speak(encouragement, () => {
      timeoutRef.current = setTimeout(() => {
        setGameState(STATES.READY)
      }, 500)
    })
  }, [])

  // Handle reveal after max attempts
  const handleReveal = useCallback(() => {
    setGameState(STATES.REVEAL)
    speak(`This is ${currentDigit}! ${currentDigit}! Can you say ${currentDigit}?`, () => {
      timeoutRef.current = setTimeout(() => {
        speak("Wonderful! Let's try another one!", () => {
          timeoutRef.current = setTimeout(() => {
            moveToNext()
          }, 1000)
        })
      }, 2000)
    })
  }, [currentDigit])

  // Move to next digit
  const moveToNext = useCallback(() => {
    setTranscript('')
    setAttempts(0)

    if (currentIndex >= totalItems - 1) {
      setGameState(STATES.COMPLETE)
      celebrate()
      speak(`Amazing! You got ${score} out of ${totalItems}! Great job!`)
    } else {
      setCurrentIndex(i => i + 1)
      setGameState(STATES.READY)
    }
  }, [currentIndex, score])

  // Start game
  const startGame = () => {
    setHasStarted(true)
    setGameState(STATES.READY)
    speak(`Let's play! What number is this?`)
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
    speak(`Let's play again! What number is this?`)
  }

  // Handle mic button tap
  const handleMicTap = () => {
    if (gameState === STATES.READY) {
      startListening()
    }
  }

  // Render start screen
  if (!hasStarted) {
    return (
      <div className="app">
        <div className="start-screen">
          <h1>🔢 Number Fun!</h1>
          <p>Learn to say your numbers!</p>
          {speechSupported ? (
            <button className="start-button" onClick={startGame}>
              Let's Play! 🎉
            </button>
          ) : (
            <p className="error">
              Sorry, speech recognition is not supported in your browser.
              Please try Chrome on Android or Safari on iOS.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Render completion screen
  if (gameState === STATES.COMPLETE) {
    return (
      <div className="app">
        <div className="complete-screen">
          <h1>🎉 All Done! 🎉</h1>
          <div className="final-score">
            <span className="score-number">{score}</span>
            <span className="score-label">out of {totalItems}</span>
          </div>
          <div className="stars">
            {'⭐'.repeat(Math.min(score, 10))}
          </div>
          <button className="restart-button" onClick={restartGame}>
            Play Again! 🔄
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Progress indicator */}
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

      {/* Score */}
      <div className="score">
        {'⭐'.repeat(score)}
      </div>

      {/* Main digit display */}
      <div className={`digit-display ${gameState === STATES.CORRECT ? 'celebrating' : ''} ${gameState === STATES.REVEAL ? 'revealing' : ''}`}>
        <span className="digit">{currentDigit}</span>
      </div>

      {/* Feedback area */}
      <div className="feedback">
        {gameState === STATES.LISTENING && (
          <div className="listening-indicator">
            <span className="pulse">🎤</span>
            <span>I'm listening...</span>
          </div>
        )}
        {gameState === STATES.CORRECT && (
          <div className="correct-feedback">
            ✨ {randomItem(celebrations)} ✨
          </div>
        )}
        {gameState === STATES.WRONG && (
          <div className="wrong-feedback">
            {randomItem(encouragements)}
          </div>
        )}
        {gameState === STATES.REVEAL && (
          <div className="reveal-feedback">
            This is {currentDigit}!
          </div>
        )}
        {transcript && gameState === STATES.LISTENING && (
          <div className="transcript">
            Heard: "{transcript}"
          </div>
        )}
      </div>

      {/* Attempt indicators */}
      <div className="attempts">
        {[...Array(maxAttempts)].map((_, i) => (
          <span
            key={i}
            className={`attempt-dot ${i < attempts ? 'used' : ''}`}
          />
        ))}
      </div>

      {/* Mic button */}
      <button
        className={`mic-button ${gameState === STATES.LISTENING ? 'listening' : ''} ${gameState !== STATES.READY ? 'disabled' : ''}`}
        onClick={handleMicTap}
        disabled={gameState !== STATES.READY}
      >
        <span className="mic-icon">🎤</span>
        <span className="mic-label">
          {gameState === STATES.LISTENING ? 'Listening...' : 'Tap to speak'}
        </span>
      </button>
    </div>
  )
}

export default App
