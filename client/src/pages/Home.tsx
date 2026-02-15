import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Volume2, Home as HomeIcon, BarChart3, LogOut, FileUp } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuiz } from "@/hooks/useQuiz";
import { useSpeech } from "@/hooks/useSpeech";
import { vocabularyBrother, vocabularyYounger, StudentType } from "@/data/vocabularyBoth";
import Statistics from "./Statistics";
import FileManager from "./FileManager";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Home() {
  const [studentType, setStudentType] = useState<StudentType | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [showQuestionCount, setShowQuestionCount] = useState(false);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const { user, logout } = useAuth();

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
  } = useQuiz(questions, studentType);

  const { speak } = useSpeech();

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
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleStartQuiz = (count: number) => {
    setSelectedCount(count);
    setShowQuestionCount(false);
    startNewQuiz(count);
  };

  // 未登錄狀態
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-2xl w-full text-center"
        >
          <h1 className="text-4xl font-bold text-pink-300 mb-4">Shane English</h1>
          <p className="text-white mb-6">線上測驗系統</p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg"
          >
            登入開始測驗
          </Button>
        </motion.div>
      </div>
    );
  }

  // 未選擇學生身份
  if (!studentType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-2xl w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-pink-300">Shane English</h1>
            <Button
              onClick={logout}
              variant="ghost"
              className="text-white hover:bg-white/20"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              登出
            </Button>
          </div>
          <p className="text-center text-white mb-2">線上測驗系統</p>
          <p className="text-center text-purple-200 mb-8">歡迎 {user.name}! 請選擇您的身份入口：</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStudentType('brother')}
              className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-8 text-white font-bold text-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="text-5xl mb-2">👦</div>
              <div>四年級哥哥專區</div>
              <div className="text-sm font-normal text-green-100 mt-2">(TEP 09 題庫)</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStudentType('younger')}
              className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-8 text-white font-bold text-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="text-5xl mb-2">👦</div>
              <div>一年級弟弟專區</div>
              <div className="text-sm font-normal text-cyan-100 mt-2">(Level A & B 題庫)</div>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFileManager(true)}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all"
          >
            <FileUp className="w-4 h-4" />
            檔案管理
          </motion.button>
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
          <FileManager />
        </div>
      </div>
    );
  }

  // 統計頁面
  if (showStats) {
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
            回測驗
          </motion.button>
          <Statistics studentType={studentType} />
        </div>
      </div>
    );
  }

  // 題數選擇頁面
  if (showQuestionCount) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center p-4`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-md w-full text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">選擇測驗題數</h2>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStartQuiz(10)}
              className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-4 rounded-lg font-bold text-xl transition-all"
            >
              10 題 (約 15 分鐘)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStartQuiz(20)}
              className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-4 rounded-lg font-bold text-xl transition-all"
            >
              20 題 (約 30 分鐘)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuestionCount(false)}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              取消
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 測驗頁面
  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* 頂部導航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStudentType(null)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
            >
              <HomeIcon className="w-4 h-4" />
              選擇身份
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStats(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              統計
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFileManager(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
            >
              <FileUp className="w-4 h-4" />
              檔案
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            登出
          </motion.button>
        </div>

        {/* 題目卡片容器 */}
        <div className="space-y-4">
          {/* 進度條和計時 */}
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">
                  第 {currentQuestionIndex + 1} / {selectedCount || questions.length} 題
                </span>
                <div className="flex items-center gap-4">
                  {timeLeft > 0 && (
                    <span className={`font-bold ${timeLeft < 60 ? 'text-red-300' : 'text-white'}`}>
                      時間: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </span>
                  )}
                  <span className="text-white/80 text-sm">
                    {mistakeQuestions.length > 0 && `錯題本: ${mistakeQuestions.length} 題`}
                  </span>
                </div>
              </div>
              <Progress value={progress} className="h-3" />
            </CardContent>
          </Card>

          {/* 題目卡片 */}
          {questions.slice(0, selectedCount || questions.length).map((q, index) => {
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
                        <span 
                          className="text-black font-bold text-lg"
                          dangerouslySetInnerHTML={{
                            __html: `${index + 1}. ${q.c}`
                          }}
                        />
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
            disabled={isSubmitted}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              isSubmitted
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : `${theme.btnPrimary} text-white`
            }`}
          >
            {isSubmitted ? '已交卷' : '交卷'}
          </motion.button>

          {/* 重新測驗按鈕 */}
          {isSubmitted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuestionCount(true)}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${theme.btnSecondary} text-white`}
            >
              重新測驗
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
