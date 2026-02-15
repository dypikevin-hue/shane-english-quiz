import { useState, useEffect } from 'react';
import { vocabularyBrother, vocabularyYounger, getThemeColors, StudentType } from '@/data/vocabularyBoth';
import { useQuiz } from '@/hooks/useQuiz';
import { useSpeech } from '@/hooks/useSpeech';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Volume2, Trophy, BookOpen, Clock, Award, Trash2, RotateCcw, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

export default function Home() {
  const [studentType, setStudentType] = useState<StudentType>('brother');
  const [questionCount, setQuestionCount] = useState<string>('20');
  const [vocabulary, setVocabulary] = useState(vocabularyBrother);
  const [themeColors, setThemeColors] = useState(getThemeColors('brother'));
  const { speak } = useSpeech();
  const {
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
  } = useQuiz();

  useEffect(() => {
    const saved = localStorage.getItem('shane_student_type') as StudentType | null;
    if (saved) {
      setStudentType(saved);
      const vocab = saved === 'brother' ? vocabularyBrother : vocabularyYounger;
      setVocabulary(vocab);
      setThemeColors(getThemeColors(saved));
    }
  }, []);

  const handleStart = () => {
    const count = questionCount === 'all' ? vocabulary.length : parseInt(questionCount);
    startQuiz(vocabulary, count);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const score = isSubmitted && results.length > 0
    ? Math.round((results.filter(r => r.isCorrect).length / results.length) * 100)
    : 0;

  const progress = questions.length > 0 ? (answers.size / questions.length) * 100 : 0;

  const handleReset = () => {
    startQuiz(vocabulary, parseInt(questionCount));
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      {/* 回首頁按鈕 */}
      <div className="mb-4">
        <Button
          onClick={handleGoHome}
          variant="outline"
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-500"
        >
          🏠 回首頁
        </Button>
      </div>

      {/* 主容器 */}
      <div className="max-w-4xl mx-auto">
        {/* 計時器 (測驗進行中顯示) */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-8 right-8 bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-full font-bold text-2xl shadow-lg z-50"
            >
              ⏱️ {formatTime(timeLeft)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 標題區 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 mt-8"
        >
          <div className="mb-4">
            <img
              src="https://cdn.jsdelivr.net/gh/manus-team/webdev-static-assets@main/vocabulary-icon.png"
              alt="Vocabulary Icon"
              className="w-20 h-20 drop-shadow-2xl mx-auto"
            />
          </div>
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
            Shane English
          </h1>
          <p className="text-xl text-purple-200">
            {studentType === 'brother' ? '👦 四年級哥哥專區 (TEP 09)' : '👦 一年級弟弟專區 (Level A & B)'}
          </p>
          <Link href="/statistics">
            <Button variant="outline" className="mt-4">
              <BarChart3 className="w-4 h-4 mr-2" />
              查看學習統計
            </Button>
          </Link>
        </motion.div>

        {/* 測驗未開始 */}
        {questions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* 選擇題數卡片 */}
            <Card className="border-2 border-purple-400/50 bg-white/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  選擇測驗題數
                </CardTitle>
                <CardDescription className="text-purple-200">
                  點擊 🔊 可聽英文發音。答錯的題目會自動加入「錯題本」，下次優先複習！
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger className="bg-white/20 border-purple-400/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 題 (15分鐘)</SelectItem>
                    <SelectItem value="20">20 題 (30分鐘)</SelectItem>
                    <SelectItem value="all">全部單字</SelectItem>
                  </SelectContent>
                </Select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg text-2xl shadow-lg transition-all"
                >
                  ▶ 開始測驗
                </motion.button>
              </CardContent>
            </Card>

            {/* 錯題本狀態 */}
            <Card className="border-2 border-orange-400/50 bg-white/10 backdrop-blur">
              <CardContent className="pt-6">
                <div className="text-center">
                  {mistakes.length > 0 ? (
                    <>
                      <p className="text-orange-300 font-bold text-lg mb-2">
                        💡 錯題本內有 <span className="text-2xl">{mistakes.length}</span> 題待複習！
                      </p>
                      <Button
                        onClick={clearMistakes}
                        variant="destructive"
                        className="mr-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        清空錯題本
                      </Button>
                    </>
                  ) : (
                    <p className="text-green-300 font-bold text-lg">
                      🎉 錯題本目前清空，太棒了！
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 歷史成績 */}
            {history.length > 0 && (
              <Card className="border-2 border-blue-400/50 bg-white/10 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-blue-300 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    歷史成績紀錄
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.map((record, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded border border-blue-400/30">
                        <span className="text-gray-300">第 {history.length - idx} 次</span>
                        <span className="font-bold text-blue-300">{Math.round((record.score / record.total) * 100)}%</span>
                        <span className="text-sm text-gray-400">{record.time}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={clearHistory}
                    variant="destructive"
                    className="w-full mt-4"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    清除成績
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* 測驗進行中 */}
        {questions.length > 0 && !isSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* 進度條 */}
            <Card className="border-2 border-purple-400/50 bg-white/10 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-purple-200 font-bold">進度: {answers.size} / {questions.length}</span>
                  <span className="text-purple-300 font-bold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </CardContent>
            </Card>

            {/* 題目卡片 */}
            {questions.map((q, index) => {
              const isCorrect = results[index]?.isCorrect;
              const showResult = results[index] !== undefined;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-2 ${showResult ? (isCorrect ? 'border-green-400/50' : 'border-red-400/50') : 'border-purple-400/50'} bg-white/10 backdrop-blur`}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300 font-bold text-lg">
                            {index + 1}. {q.c}
                          </span>
                          <Button
                            onClick={() => speak(q.e)}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div>
                          <Input
                            placeholder="輸入英文"
                            value={answers.get(index) || ''}
                            onChange={(e) => updateAnswer(index, e.target.value)}
                            disabled={isSubmitted}
                            className="font-bold"
                            style={{
                              fontSize: '28px',
                              padding: '12px 15px',
                              height: 'auto',
                              minHeight: '50px',
                              color: '#1565c0',
                              lineHeight: '1.5'
                            }}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                                if (nextInput) nextInput.focus();
                              }
                            }}
                            data-index={index}
                          />

                          {showResult && !isCorrect && (
                            <div className="mt-2 font-bold" style={{
                              fontSize: '26px',
                              color: '#d32f2f'
                            }}>
                              ✓ {q.e}
                            </div>
                          )}
                        </div>

                        {showResult && (
                          <div className={`p-3 rounded ${isCorrect ? 'bg-green-500/20 border border-green-400' : 'bg-red-500/20 border border-red-400'}`}>
                            <p className={isCorrect ? 'text-green-300' : 'text-red-300'}>
                              {isCorrect ? '✓ 正確！' : '✗ 答錯了'}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* 交卷按鈕 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-lg text-2xl shadow-lg transition-all"
            >
              交卷 (Check)
            </motion.button>
          </motion.div>
        )}

        {/* 成績顯示 */}
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* 成績卡片 */}
            <Card className="border-2 border-yellow-400/50 bg-white/10 backdrop-blur">
              <CardContent className="pt-12 pb-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                >
                  <p className="text-8xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mb-4">
                    {score}%
                  </p>
                </motion.div>
                <p className="text-2xl text-purple-200 font-bold mb-2">
                  {results.filter(r => r.isCorrect).length} / {results.length} 正確
                </p>
                <p className="text-lg text-gray-300">
                  {score >= 90 ? '🎉 太棒了！' : score >= 70 ? '👍 不錯！' : '💪 繼續加油！'}
                </p>
              </CardContent>
            </Card>

            {/* 按鈕組 */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleReset}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 text-lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                再測一次
              </Button>
              <Link href="/statistics">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 text-lg">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  查看統計
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
