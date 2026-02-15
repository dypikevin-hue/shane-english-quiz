import { useState, useEffect, useCallback } from 'react';
import { VocabularyItem } from '@/data/vocabulary';

export interface QuizAnswer {
  questionIndex: number;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizHistory {
  time: string;
  score: number;
  total: number;
}

const HISTORY_KEY = "shane_english_history";
const MISTAKES_KEY = "shane_english_mistakes";

// 安全讀取 localStorage 陣列
function safeGetArray<T>(key: string): T[] {
  try {
    const str = localStorage.getItem(key);
    if (str) {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) {
        return arr;
      }
    }
  } catch(e) {
    console.error('Error reading from localStorage:', e);
  }
  return [];
}

// 洗牌演算法
function shuffle<T>(arr: T[]): T[] {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function useQuiz() {
  const [questions, setQuestions] = useState<VocabularyItem[]>([]);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [results, setResults] = useState<QuizAnswer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mistakes, setMistakes] = useState<VocabularyItem[]>([]);
  const [history, setHistory] = useState<QuizHistory[]>([]);

  // 載入錯題本和歷史記錄
  useEffect(() => {
    setMistakes(safeGetArray<VocabularyItem>(MISTAKES_KEY));
    setHistory(safeGetArray<QuizHistory>(HISTORY_KEY));
  }, []);

  // 計時器
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // 開始測驗
  const startQuiz = useCallback((allQuestions: VocabularyItem[], count: number) => {
    const mistakesFromStorage = safeGetArray<VocabularyItem>(MISTAKES_KEY);
    
    // 優先從錯題本抽題
    const shuffledMistakes = shuffle(mistakesFromStorage);
    const mistakesToUse = shuffledMistakes.slice(0, count);
    
    let selected = [...mistakesToUse];
    const needed = count - selected.length;
    
    if (needed > 0) {
      const remaining = allQuestions.filter(q => 
        !selected.some(s => s.e === q.e)
      );
      const shuffledRemaining = shuffle(remaining);
      selected = [...selected, ...shuffledRemaining.slice(0, needed)];
    }
    
    const finalQuestions = shuffle(selected);
    setQuestions(finalQuestions);
    setAnswers(new Map());
    setResults([]);
    setIsSubmitted(false);
    
    // 設定時間
    const timeInSeconds = count === 10 ? 900 : count === 20 ? 1800 : count * 90;
    setTimeLeft(timeInSeconds);
    setIsRunning(true);
  }, []);

  // 更新答案
  const updateAnswer = useCallback((questionIndex: number, answer: string) => {
    setAnswers(prev => new Map(prev).set(questionIndex, answer));
  }, []);

  // 交卷
  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;
    
    setIsRunning(false);
    const quizResults: QuizAnswer[] = [];
    const currentMistakes = safeGetArray<VocabularyItem>(MISTAKES_KEY);
    const newMistakes = [...currentMistakes];
    
    questions.forEach((q, index) => {
      const userAnswer = (answers.get(index) || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const correctAnswer = q.e.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isCorrect = userAnswer === correctAnswer && userAnswer !== '';
      
      quizResults.push({
        questionIndex: index,
        userAnswer: answers.get(index) || '',
        isCorrect
      });
      
      const mistakeIndex = newMistakes.findIndex(m => m.e === q.e);
      
      if (isCorrect && mistakeIndex > -1) {
        // 答對了,從錯題本移除
        newMistakes.splice(mistakeIndex, 1);
      } else if (!isCorrect && mistakeIndex === -1) {
        // 答錯了,加入錯題本
        newMistakes.push(q);
      }
    });
    
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(newMistakes));
    setMistakes(newMistakes);
    setResults(quizResults);
    setIsSubmitted(true);
    
    // 儲存成績
    const correctCount = quizResults.filter(r => r.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);
    saveHistory(score, questions.length);
  }, [questions, answers, isSubmitted]);

  // 儲存歷史記錄
  const saveHistory = useCallback((score: number, total: number) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const record: QuizHistory = { time: timeStr, score, total };
    const currentHistory = safeGetArray<QuizHistory>(HISTORY_KEY);
    const newHistory = [record, ...currentHistory].slice(0, 20);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    setHistory(newHistory);
  }, []);

  // 清除歷史記錄
  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  // 清空錯題本
  const clearMistakes = useCallback(() => {
    localStorage.removeItem(MISTAKES_KEY);
    setMistakes([]);
  }, []);

  return {
    questions,
    answers,
    results,
    isSubmitted,
    timeLeft,
    isRunning,
    mistakes,
    history,
    startQuiz,
    updateAnswer,
    handleSubmit,
    clearHistory,
    clearMistakes
  };
}
