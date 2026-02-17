import { useState, useCallback, useEffect } from 'react';
import { VocabularyItem } from '@/data/vocabularyBoth';

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

// 判斷是否為句子
function isSentence(text: string): boolean {
  return text.includes(' ') || text.includes('?') || text.includes('。');
}

export function useQuiz(allQuestions: VocabularyItem[], studentType: 'brother' | 'younger' | null) {
  const [questions, setQuestions] = useState<VocabularyItem[]>([]);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [results, setResults] = useState<QuizAnswer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mistakes, setMistakes] = useState<VocabularyItem[]>([]);
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 根據學生類型生成 key
  const getStorageKey = (baseKey: string) => {
    if (!studentType) return baseKey;
    return `${baseKey}_${studentType}`;
  };

  const mistakesKey = getStorageKey(MISTAKES_KEY);
  const historyKey = getStorageKey(HISTORY_KEY);

  // 載入錯題本和歷史記錄
  useEffect(() => {
    setMistakes(safeGetArray<VocabularyItem>(mistakesKey));
    setHistory(safeGetArray<QuizHistory>(historyKey));
  }, [studentType, mistakesKey, historyKey]);

  // 計時器
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // 開始測驗 - 隨機出題,哥哥題目包含句子比例
  const startNewQuiz = useCallback((count: number = 10) => {
    let selected: VocabularyItem[] = [];

    if (studentType === 'brother') {
      // 哥哥: 10題含2題句子,20題含3-4題句子
      const sentenceCount = count === 10 ? 2 : count === 20 ? 3 + Math.floor(Math.random() * 2) : 0;
      
      // 分離句子和單字
      const sentences = allQuestions.filter(q => isSentence(q.e));
      const words = allQuestions.filter(q => !isSentence(q.e));
      
      // 隨機選擇句子
      const shuffledSentences = shuffle(sentences);
      const selectedSentences = shuffledSentences.slice(0, Math.min(sentenceCount, sentences.length));
      
      // 隨機選擇單字填補剩餘
      const needed = count - selectedSentences.length;
      const shuffledWords = shuffle(words);
      const selectedWords = shuffledWords.slice(0, needed);
      
      selected = [...selectedSentences, ...selectedWords];
    } else {
      // 弟弟: 純隨機出題
      const shuffled = shuffle(allQuestions);
      selected = shuffled.slice(0, count);
    }

    // 最後再洗牌一次
    selected = shuffle(selected);
    
    setQuestions(selected);
    setCurrentQuestionIndex(0);
    setAnswers(new Map());
    setResults([]);
    setIsSubmitted(false);

    // 設置計時
    const timeInSeconds = count === 10 ? 900 : count === 20 ? 1800 : count * 90;
    setTimeLeft(timeInSeconds);
    setIsRunning(true);
  }, [allQuestions, studentType]);

  // 更新答案
  const updateAnswer = useCallback((questionIndex: number, answer: string) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionIndex, answer);
      return newAnswers;
    });
  }, []);

  // 驗證答案
  const validateAnswer = (userInput: string, correctWord: string): boolean => {
    const normalize = (word: string) => 
      word.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    
    return normalize(userInput) === normalize(correctWord) && userInput.trim() !== '';
  };

  // 提交測驗
  const handleSubmit = useCallback(() => {
    if (questions.length === 0) return;

    const newResults: QuizAnswer[] = questions.map((q, idx) => {
      const userAnswer = answers.get(idx) || '';
      const isCorrect = validateAnswer(userAnswer, q.e);

      // 更新錯題本
      if (!isCorrect) {
        const mistakesFromStorage = safeGetArray<VocabularyItem>(mistakesKey);
        if (!mistakesFromStorage.find(m => m.e === q.e)) {
          mistakesFromStorage.push(q);
          localStorage.setItem(mistakesKey, JSON.stringify(mistakesFromStorage));
        }
      } else {
        // 如果答對,從錯題本移除
        const mistakesFromStorage = safeGetArray<VocabularyItem>(mistakesKey);
        const filtered = mistakesFromStorage.filter(m => m.e !== q.e);
        localStorage.setItem(mistakesKey, JSON.stringify(filtered));
      }

      return {
        questionIndex: idx,
        userAnswer,
        isCorrect,
      };
    });

    setResults(newResults);
    setIsSubmitted(true);
    setIsRunning(false);

    // 保存歷史記錄
    const correctCount = newResults.filter(r => r.isCorrect).length;
    const historyFromStorage = safeGetArray<QuizHistory>(historyKey);
    const newHistory: QuizHistory = {
      time: new Date().toLocaleString('zh-TW'),
      score: correctCount,
      total: questions.length,
    };
    historyFromStorage.unshift(newHistory);
    // 只保留最近50筆
    if (historyFromStorage.length > 50) {
      historyFromStorage.pop();
    }
    localStorage.setItem(historyKey, JSON.stringify(historyFromStorage));
    setHistory(historyFromStorage);
  }, [questions, answers, mistakesKey, historyKey]);

  // 重置測驗
  const resetQuiz = useCallback(() => {
    setQuestions([]);
    setAnswers(new Map());
    setResults([]);
    setIsSubmitted(false);
    setTimeLeft(0);
    setIsRunning(false);
    setCurrentQuestionIndex(0);
  }, []);

  // 下一題
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  return {
    questions,
    currentQuestionIndex,
    answers,
    results,
    isSubmitted,
    mistakeQuestions: mistakes,
    updateAnswer,
    handleSubmit,
    resetQuiz,
    startNewQuiz,
    timeLeft,
    history,
    nextQuestion,
  };
}
