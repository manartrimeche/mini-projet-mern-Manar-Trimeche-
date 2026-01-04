import { useState, useEffect } from 'react';
import api from '../api/api';
import '../css/Quiz.css';

export default function Quiz({ productId }) {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);

  // Charger le quiz
  useEffect(() => {
    fetchQuiz();
  }, [productId]);

  // Chronomètre
  useEffect(() => {
    if (!quiz || showResults) return;

    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, showResults]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quiz/${productId}`);
      console.log('Quiz chargé:', response.data);
      setQuiz(response.data.data);
      setCurrentQuestion(0);
      setSelectedAnswers(new Array(response.data.data.questions.length).fill(null));
      setQuizStartTime(Date.now());
      setTimeSpent(0);
    } catch (error) {
      console.error('Erreur chargement quiz:', error.response?.data || error.message);
      alert('Erreur lors du chargement du quiz: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = { selectedIndex: optionIndex, timeSpent: timeSpent };
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await api.post(`/quiz/${quiz._id}/submit-public`, {
        answers: selectedAnswers,
        timeSpent
      });

      setResult(response.data.data);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur soumission quiz:', error);
      alert('Erreur lors de la soumission du quiz: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="quiz-container loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p>Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-container error">
        <p>❌ Impossible de charger le quiz</p>
        <button onClick={fetchQuiz} style={{
          padding: '10px 20px',
          marginTop: '15px',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          Réessayer
        </button>
      </div>
    );
  }

  if (showResults && result) {
    return <QuizResults result={result} onRetry={fetchQuiz} />;
  }

  const question = quiz.questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / quiz.questions.length) * 100);

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-title">Quiz: {quiz.category}</div>
        <div className="quiz-timer">⏱️ {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}</div>
      </div>

      <div className="quiz-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-text">
          Question {currentQuestion + 1} / {quiz.questions.length}
        </div>
      </div>

      <div className="quiz-content">
        <div className="quiz-difficulty">
          Difficulté: <span className={`difficulty-${question.difficulty}`}>
            {question.difficulty}
          </span>
        </div>

        <h3 className="quiz-question">{question.text}</h3>

        <div className="quiz-options">
          {question.options.map((option, index) => (
            <label key={index} className="quiz-option">
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={index}
                checked={selectedAnswers[currentQuestion]?.selectedIndex === index}
                onChange={() => handleAnswerSelect(index)}
              />
              <span className="option-text">{option.text}</span>
            </label>
          ))}
        </div>

        {question.explanation && (
          <div className="quiz-hint">
            💡 Conseil: {question.explanation}
          </div>
        )}
      </div>

      <div className="quiz-navigation">
        <button 
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
          className="btn btn-secondary"
        >
          ← Précédent
        </button>

        <div className="question-indicators">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              className={`question-indicator ${
                index === currentQuestion ? 'active' : ''
              } ${selectedAnswers[index] ? 'answered' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button 
            onClick={handleNextQuestion}
            className="btn btn-primary"
          >
            Suivant →
          </button>
        ) : (
          <button 
            onClick={handleSubmitQuiz}
            className="btn btn-success"
          >
            Terminer 🏁
          </button>
        )}
      </div>
    </div>
  );
}

// Composant pour afficher les résultats
function QuizResults({ result, onRetry }) {
  const { feedback, result: quizResult } = result;
  const percentage = quizResult.percentage;
  const emoji = percentage === 100 ? '🏆' : percentage >= 80 ? '⭐' : percentage >= 60 ? '👍' : '📚';

  return (
    <div className="quiz-results">
      <div className="results-header">
        <div className="score-circle">
          <div className="score-value">{feedback.percentage}</div>
          <div className="score-label">Score</div>
        </div>
        <div className="results-emoji">{emoji}</div>
      </div>

      <div className="results-content">
        <h2>Résultats</h2>
        
        <div className="results-stat">
          <span>Questions correctes:</span>
          <strong>{feedback.score}</strong>
        </div>

        <div className="results-stat">
          <span>Points gagnés:</span>
          <strong className="points">+{feedback.pointsEarned} pts</strong>
        </div>

        {feedback.badgesEarned.length > 0 && (
          <div className="results-badges">
            <h3>Badges</h3>
            <div className="badges">
              {feedback.badgesEarned.map((badge, idx) => (
                <div key={idx} className="badge">{badge}</div>
              ))}
            </div>
          </div>
        )}

        <div className="results-feedback">
          {percentage === 100 && <p>🎉 Parfait! Vous maîtrisez ce produit!</p>}
          {percentage >= 80 && percentage < 100 && <p>👏 Excellent résultat!</p>}
          {percentage >= 60 && percentage < 80 && <p>👍 Bon travail! Continuez comme ça.</p>}
          {percentage >= 40 && percentage < 60 && <p>📖 Lisez les explications pour en savoir plus.</p>}
          {percentage < 40 && <p>📚 Essayez à nouveau pour mieux comprendre.</p>}
        </div>

        <button onClick={onRetry} className="btn btn-primary">
          Réessayer 🔄
        </button>
      </div>
    </div>
  );
}
