import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Volume2, Home as HomeIcon, BarChart3, FileUp, BookOpen, History } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuiz } from "@/hooks/useQuiz";
import { useSpeech } from "@/hooks/useSpeech";
import { vocabularyBrother, vocabularyYounger, StudentType, VocabularyItem } from "@/data/vocabularyBoth";
import Statistics from "./Statistics";
import FileManager from "./FileManager";

interface QuizResult {
  timestamp: number;
  studentType: StudentType;
  questionCount: number;
  score: number;
  answers: Map<number, string>;
  results: Array<{ questionIndex: number; userAnswer: string; isCorrect: boolean }>;
  questions: VocabularyItem[];
}

export default function Home() {
  const [studentType, setStudentType] = useState<StudentType | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [showQuestionCount, setShowQuestionCount] = useState(false);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [quizMode, setQuizMode] = useState<'normal' | 'mistakes' | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);

  const questions = studentType === 'brother' ? vocabularyBrother : vocabularyYounger;
  const {
    currentQuestionIndex,
    answers,
    results,
    isSubmitted,
    mistakeQuestions,
    updateAnswer,
    handleSubmit,
    resetQuiz,
    startNewQuiz,
    timeLeft,
    history,
  } = useQuiz(questions, studentType);

  const { speak } = useSpeech();

  // 載入試卷歷史
  useEffect(() => {
    const saved = localStorage.getItem('shane_quiz_results');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setQuizHistory(parsed.map((item: any) => ({
          ...item,
          answers: new Map(item.answers),
          results: item.results || []
        })));
      } catch (e) {
        console.error('Failed to load quiz history:', e);
      }
    }
  }, []);

  // 保存試卷結果
  const saveQuizResult = () => {
    if (!isSubmitted || !studentType) return;

    const correctCount = results.filter(r => r.isCorrect).length;
    const newResult: QuizResult = {
      timestamp: Date.now(),
      studentType,
      questionCount: selectedCount || 10,
      score: correctCount,
      answers,
      results,
      questions,
    };

    const updated = [newResult, ...quizHistory];
    localStorage.setItem('shane_quiz_results', JSON.stringify(
      updated.map(r => ({
        ...r,
        answers: Array.from(r.answers.entries())
      }))
    ));
    setQuizHistory(updated);
  };

  useEffect(() => {
    if (isSubmitted) {
      saveQuizResult();
    }
  }, [isSubmitted]);

  const getThemeColor = () => {
    if (studentType === 'brother') {
      return {
        bg: 'from-green-400 to-emerald-600',
        text: 'text-green-700',
        btnPrimary: 'bg-green-500 hover:bg-green-600',
        btnSecondary: 'bg-blue-500 hover:bg-blue-600',
        border: 'border-green-400',
      };
    } else {
      return {
        bg: 'from-cyan-400 to-blue-600',
        text: 'text-cyan-700',
        btnPrimary: 'bg-cyan-500 hover:bg-cyan-600',
        btnSecondary: 'bg-blue-500 hover:bg-blue-600',
        border: 'border-cyan-400',
      };
    }
  };

  const theme = getThemeColor();

  // 首頁 - 選擇學生身份
  if (!studentType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-2xl w-full"
        >
          <h1 className="text-4xl font-bold text-center text-pink-300 mb-2">Shane English</h1>
          <p className="text-center text-white mb-2">線上測驗系統</p>
          <p className="text-center text-purple-200 mb-8">請選擇您的身份入口：</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStudentType('brother');
                setShowQuestionCount(true);
              }}
              className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-8 text-white hover:shadow-2xl transition-all"
            >
              <div className="text-5xl mb-3">👨</div>
              <h3 className="text-xl font-bold mb-1">四年級哥哥專區</h3>
              <p className="text-sm opacity-90">(TEP 09 題庫)</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStudentType('younger');
                setShowQuestionCount(true);
              }}
              className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl p-8 text-white hover:shadow-2xl transition-all"
            >
              <div className="text-5xl mb-3">👦</div>
              <h3 className="text-xl font-bold mb-1">一年級弟弟專區</h3>
              <p className="text-sm opacity-90">(Level A & B 題庫)</p>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStats(true)}
              className="bg-purple-500/50 hover:bg-purple-500/70 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              統計分析
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(true)}
              className="bg-purple-500/50 hover:bg-purple-500/70 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <History className="w-4 h-4" />
              試卷歷史
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFileManager(true)}
              className="bg-purple-500/50 hover:bg-purple-500/70 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <FileUp className="w-4 h-4" />
              檔案管理
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 檔案管理頁面
  if (showFileManager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFileManager(false)}
            className="mb-6 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all"
          >
            <HomeIcon className="w-4 h-4" />
            回首頁
          </motion.button>

          <FileManager studentType={studentType} />
        </div>
      </div>
    );
  }

  // 選擇題數
  if (showQuestionCount && !quizMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-2xl w-full"
        >
          <h2 className="text-2xl font-bold text-center text-white mb-8">選擇測驗模式</h2>

          <div className="space-y-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setQuizMode('normal');
                setShowQuestionCount(false);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-lg transition-all font-bold text-lg"
            >
              📝 一般測驗
            </motion.button>

            {mistakeQuestions.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setQuizMode('mistakes');
                  setShowQuestionCount(false);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-lg transition-all font-bold text-lg"
              >
                🔄 復習錯題 ({mistakeQuestions.length} 題)
              </motion.button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStudentType(null)}
            className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all"
          >
            返回
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // 選擇題數
  if (showQuestionCount && quizMode && selectedCount === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-2xl w-full"
        >
          <h2 className="text-2xl font-bold text-center text-white mb-8">選擇題數</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCount(10);
                startNewQuiz(10);
                setShowQuestionCount(false);
              }}
              className="bg-gradient-to-br from-green-400 to-emerald-600 text-white px-6 py-6 rounded-lg transition-all font-bold text-2xl hover:shadow-2xl"
            >
              10 題
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCount(20);
                startNewQuiz(20);
                setShowQuestionCount(false);
              }}
              className="bg-gradient-to-br from-blue-400 to-blue-600 text-white px-6 py-6 rounded-lg transition-all font-bold text-2xl hover:shadow-2xl"
            >
              20 題
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowQuestionCount(false);
              setQuizMode(null);
            }}
            className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all"
          >
            返回
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // 測驗進行中
  if (questions.length > 0 && !isSubmitted && selectedCount) {
    const setCurrentQuestionIndex = (idx: number) => {
      // This is handled through the quiz state
    };
    const q = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const timeDisplay = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;
    const timeColor = timeLeft < 60 ? 'text-red-500' : timeLeft < 300 ? 'text-yellow-500' : 'text-green-500';

    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-4`}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div className="text-white font-bold">
              第 {currentQuestionIndex + 1} / {questions.length} 題
            </div>
            <div className={`text-2xl font-bold ${timeColor}`}>
              ⏱ {timeDisplay}
            </div>
          </div>

          <Progress value={progress} className="mb-6 h-3" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentQuestionIndex}
          >
            <Card className="bg-white/10 backdrop-blur border-white/20 mb-6">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <p className="text-white" style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: 'black'
                  }}>
                    {q.c.includes('<ruby>') ? (
                      <span dangerouslySetInnerHTML={{ __html: q.c }} />
                    ) : (
                      q.c
                    )}
                  </p>
                </div>

                <div className="flex gap-2 mb-6 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => speak(q.e)}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 transition-all"
                  >
                    <Volume2 className="w-6 h-6" />
                  </motion.button>
                </div>

                <Input
                  type="text"
                  placeholder="輸入英文單字..."
                  value={answers.get(currentQuestionIndex) || ''}
                  onChange={(e) => updateAnswer(currentQuestionIndex, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (currentQuestionIndex < questions.length - 1) {
                        updateAnswer(currentQuestionIndex + 1, '');
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                      } else {
                        handleSubmit();
                      }
                    }
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  style={{
                    fontSize: '28px',
                    padding: '12px 15px',
                    color: '#1565c0',
                    fontWeight: 'bold',
                    minHeight: '50px'
                  }}
                  className="text-center"
                />

                <div className="mt-6 flex gap-3">
                  {currentQuestionIndex > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                      // Navigate to previous question
                    }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      上一題
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (currentQuestionIndex < questions.length - 1) {
                        updateAnswer(currentQuestionIndex + 1, '');
                      } else {
                        handleSubmit();
                      }
                    }}
                    className={`flex-1 ${theme.btnPrimary} text-white px-4 py-2 rounded-lg transition-all`}
                  >
                    {currentQuestionIndex === questions.length - 1 ? '交卷' : '下一題'}
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // 成績頁面
  if (isSubmitted && results.length > 0) {
    const correctCount = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-4`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 mb-6 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">測驗完成！</h2>
            <div className="text-6xl font-bold text-yellow-300 mb-4">{percentage}%</div>
            <p className="text-2xl text-white mb-2">
              正確: {correctCount} / {questions.length}
            </p>

            <div className="mt-8 flex gap-3 flex-wrap justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetQuiz();
                  setSelectedCount(null);
                  setQuizMode(null);
                  setShowQuestionCount(true);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-all"
              >
                再測一次
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetQuiz();
                  setStudentType(null);
                  setSelectedCount(null);
                  setQuizMode(null);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all flex items-center gap-2"
              >
                <HomeIcon className="w-4 h-4" />
                回首頁
              </motion.button>
            </div>
          </motion.div>

          <div className="space-y-3">
            {results.map((result, idx) => {
              const isCorrect = result.isCorrect;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`${isCorrect ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'}`}>
                    <CardContent className="pt-6">
                      <div className="mb-3">
                        <p className="text-white font-bold mb-2">
                          {idx + 1}. {questions[idx].c.includes('<ruby>') ? (
                            <span dangerouslySetInnerHTML={{ __html: questions[idx].c }} />
                          ) : (
                            questions[idx].c
                          )}
                        </p>
                        <div style={{
                          fontSize: '18px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#1565c0',
                          lineHeight: '1.5',
                          padding: '8px'
                        }}>
                          {result.userAnswer || '未作答'}
                        </div>

                        {!isCorrect && (
                          <div className="mt-2 font-bold" style={{
                            fontSize: '20px',
                            color: '#d32f2f'
                          }}>
                            正確答案: {questions[idx].e}
                          </div>
                        )}
                      </div>

                      <div className={`p-2 rounded text-center ${isCorrect ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                        {isCorrect ? '✓ 答對' : '✗ 答錯'}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 歷史試卷列表
  if (showHistory) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 p-4`}>
        <div className="max-w-4xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(false)}
            className="mb-6 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all"
          >
            <HomeIcon className="w-4 h-4" />
            回首頁
          </motion.button>

          <h2 className="text-2xl font-bold text-white mb-6">試卷歷史</h2>

          <div className="space-y-3">
            {quizHistory.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6 text-center text-white">
                  <p>還沒有測驗記錄</p>
                </CardContent>
              </Card>
            ) : (
              quizHistory.map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedHistoryIndex(index)}
                  className="w-full text-left"
                >
                  <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold">{new Date(item.timestamp).toLocaleString()}</p>
                          <p className="text-white/70 text-sm">{item.studentType === 'brother' ? '哥哥' : '弟弟'} - {item.questionCount} 題</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">{item.score}/{item.questionCount}</p>
                          <p className="text-white/70 text-sm">{Math.round(item.score / item.questionCount * 100)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // 統計頁面
  if (showStats) {
    const allResults = quizHistory;
    const totalQuizzes = allResults.length;
    const totalCorrect = allResults.reduce((sum, r) => sum + r.score, 0);
    const totalQuestions = allResults.reduce((sum, r) => sum + r.questionCount, 0);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const averageScore = totalQuizzes > 0 ? Math.round(allResults.reduce((sum, r) => sum + (r.score / r.questionCount * 100), 0) / totalQuizzes) : 0;
    const bestScore = totalQuizzes > 0 ? Math.max(...allResults.map(r => Math.round(r.score / r.questionCount * 100))) : 0;
    const worstScore = totalQuizzes > 0 ? Math.min(...allResults.map(r => Math.round(r.score / r.questionCount * 100))) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 p-4">
        <div className="max-w-6xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStats(false)}
            className="mb-6 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all"
          >
            <HomeIcon className="w-4 h-4" />
            回首頁
          </motion.button>

          <h2 className="text-3xl font-bold text-white mb-8">統計分析</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="pt-6 text-center">
                <p className="text-white/70 text-sm mb-2">總測驗次數</p>
                <p className="text-white font-bold text-3xl">{totalQuizzes}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="pt-6 text-center">
                <p className="text-white/70 text-sm mb-2">平均成績</p>
                <p className="text-white font-bold text-3xl">{averageScore}%</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="pt-6 text-center">
                <p className="text-white/70 text-sm mb-2">最高成績</p>
                <p className="text-green-400 font-bold text-3xl">{bestScore}%</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="pt-6 text-center">
                <p className="text-white/70 text-sm mb-2">整體正確率</p>
                <p className="text-white font-bold text-3xl">{overallAccuracy}%</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-6">
              <h3 className="text-white font-bold text-lg mb-4">最近測驗成績</h3>
              <div className="space-y-2">
                {allResults.slice(0, 10).map((r, idx) => (
                  <div key={idx} className="flex justify-between items-center text-white">
                    <span>{new Date(r.timestamp).toLocaleString()}</span>
                    <span className="font-bold">{r.score}/{r.questionCount} ({Math.round(r.score / r.questionCount * 100)}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
