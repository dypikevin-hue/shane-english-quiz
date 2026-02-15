/* 遊戲化學習體驗設計 - 深色漸層背景,活力紫主色,霓虹綠/黃強調色,3D按鈕,豐富動畫 */
import { useState } from 'react';
import { vocabularyData } from '@/data/vocabulary';
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
  const [questionCount, setQuestionCount] = useState<string>('20');
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

  const handleStart = () => {
    const count = questionCount === 'all' ? vocabularyData.length : parseInt(questionCount);
    startQuiz(vocabularyData, count);
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景裝飾 */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/azmXBKRFrACxEy7wbUrV1S/sandbox/60Nav8LsPFRlfN7sG2dhNA-img-1_1771127336000_na1fn_aGVyby1iYWNrZ3JvdW5k.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYXptWEJLUkZyQUN4RXk3d2JVclYxUy9zYW5kYm94LzYwTmF2OExzUEZSbGZON3NHMmRoTkEtaW1nLTFfMTc3MTEyNzMzNjAwMF9uYTFmbl9hR1Z5YnkxaVlXTnJaM0p2ZFc1ay5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=D5lOPY07xHhpnbPDISf1UHxHUckDHU5b~7Zt1mta9~Qn9owpAXD65Vb42i5rdmyiI0S8bMdVC0atl6Py1ja8kr~qYdFZDszG7XdeMs43XVMKRK5bzPKUhaU6JfhTbU4Ue2UcXZW94FIoDzduc2BiR4OGstouMHkThRaJ6w4i2bSeLboysEx-PQDrm00SrjmnsgVSDfEzuUswUvN37HuPQ2bQYPeIEM8zjyUwg5mGZ9ZkwDpxcQjD7fD92YM0igg5qw~MArhHBYCrISfkbq809gU6RiNK4VDVzXHJqHaDnwNrCTL7W7KUxqozaip2bhQINA8I~6z61G3LfH--pBv2MA__')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className="container relative z-10 py-8">
        {/* 標題區 */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="https://private-us-east-1.manuscdn.com/sessionFile/azmXBKRFrACxEy7wbUrV1S/sandbox/60Nav8LsPFRlfN7sG2dhNA-img-5_1771127330000_na1fn_dm9jYWJ1bGFyeS1pY29u.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYXptWEJLUkZyQUN4RXk3d2JVclYxUy9zYW5kYm94LzYwTmF2OExzUEZSbGZON3NHMmRoTkEtaW1nLTVfMTc3MTEyNzMzMDAwMF9uYTFmbl9kbTlqWVdKMWJHRnllUzFwWTI5dS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=SdAyCrhWj8QDzVPWOCPZYeO0gicDnxwOLMfVpqtDWG~dBv5FTL9UgT0mYqjOtbJTnc80tp56HNbjKPUh6GZ8hoAJBDcWgd2jwsrO~pHZACJOXcWC18t20P9OVfMVkyAUVl6lccqB84nBtaVRGhtiPqit3H1ZaSj15USFXJCfAZNi~k31Xha4aSO2VKIPtA1PAPHyF6wVEX-zjGI6rSvJFKp08zVo3lQWgIfgjsdaAg1~q46ZVW01bl2Xmx0bhxHdAZoyuB8Gtzf8HaQpobX5f8I0fKdjFXw8BAppo1C02KvQAmlNLXnEacZRuhgqkANbbOKodTAIX-DCAIiBZnP5kg__"
              alt="Vocabulary Icon"
              className="w-20 h-20 drop-shadow-2xl"
            />
          </div>
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
            Shane English
          </h1>
          <p className="text-xl text-purple-200">線上測驗系統 (哥哥版)</p>
          <Link href="/statistics">
            <Button variant="outline" className="mt-4">
              <BarChart3 className="w-4 h-4 mr-2" />
              查看學習統計
            </Button>
          </Link>
        </motion.div>

        {/* 計時器 (測驗進行中顯示) */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed top-4 right-4 z-50"
            >
              <Card className="neon-border bg-card/90 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-400" />
                  <span className="text-3xl font-mono font-bold text-yellow-400">
                    {formatTime(timeLeft)}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 開始測驗區 */}
        {questions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="neon-border bg-card/80 backdrop-blur-md mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BookOpen className="w-7 h-7 text-purple-400" />
                  選擇測驗題數
                </CardTitle>
                <CardDescription className="text-base">
                  點擊 🔊 可聽發音。答錯的題目會自動加入「錯題本」,下次優先考!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger className="text-lg h-14 neon-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 題 (15分鐘)</SelectItem>
                    <SelectItem value="20">20 題 (30分鐘)</SelectItem>
                    <SelectItem value="all">全部單字 ({vocabularyData.length} 題)</SelectItem>
                  </SelectContent>
                </Select>

                {mistakes.length > 0 && (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-2 border-orange-400 rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Award className="w-6 h-6 text-orange-400" />
                      <span className="text-lg font-bold text-orange-300">錯題本狀態</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-300">
                      目前有 {mistakes.length} 題待複習!
                    </p>
                  </motion.div>
                )}

                <Button 
                  onClick={handleStart}
                  size="lg"
                  className="w-full h-16 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  ▶ 開始測驗
                </Button>
              </CardContent>
            </Card>

            {/* 歷史記錄 */}
            <Card className="neon-border bg-card/80 backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    歷史成績紀錄
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('確定要清空「錯題本」嗎?')) {
                          clearMistakes();
                        }
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      清空錯題本
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('確定要清除所有「成績紀錄」嗎?')) {
                          clearHistory();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      清除成績
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">尚無測驗紀錄</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.map((record, index) => {
                      const color = record.score >= 90 ? 'text-green-400' : record.score >= 60 ? 'text-orange-400' : 'text-red-400';
                      return (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="text-sm">{record.time} ({record.total}題)</span>
                          <span className={`text-lg font-bold ${color}`}>{record.score}分</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 測驗進行中 */}
        {questions.length > 0 && (
          <div className="max-w-4xl mx-auto">
            {/* 進度條 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm text-purple-300">答題進度</span>
                <span className="text-sm text-purple-300">{answers.size} / {questions.length}</span>
              </div>
              <Progress value={progress} className="h-3" />
            </motion.div>

            {/* 題目列表 */}
            <div className="space-y-4 mb-6">
              {questions.map((q, index) => {
                const result = results.find(r => r.questionIndex === index);
                const isCorrect = result?.isCorrect;
                const showResult = isSubmitted;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`
                      transition-all duration-500
                      ${showResult ? (isCorrect ? 'success-glow border-green-500 bg-green-500/10' : 'error-shake border-red-500 bg-red-500/10') : 'neon-border bg-card/80 backdrop-blur-md'}
                    `}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95"
                            onClick={() => speak(q.e)}
                          >
                            <Volume2 className="w-6 h-6 text-white" />
                          </Button>
                          
                          <div className="flex-1 space-y-3">
                            <div className="text-xl font-semibold text-foreground">
                              {index + 1}. {q.c}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Input
                                placeholder="輸入英文"
                                value={answers.get(index) || ''}
                                onChange={(e) => updateAnswer(index, e.target.value)}
                                disabled={isSubmitted}
                                className={`text-lg h-12 ${showResult ? (isCorrect ? 'border-green-500 bg-green-500/5' : 'border-red-500 bg-red-500/5 line-through') : 'neon-border'}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                                    if (nextInput) nextInput.focus();
                                  }
                                }}
                                data-index={index}
                              />
                              
                              {showResult && !isCorrect && (
                                <span className="text-red-400 font-bold whitespace-nowrap">
                                  ✓ {q.e}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* 交卷按鈕 */}
            {!isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="h-16 px-12 text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  交卷 (Check)
                </Button>
              </motion.div>
            )}

            {/* 成績顯示 */}
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Card className="neon-border bg-card/90 backdrop-blur-md inline-block">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center gap-4">
                      {score >= 90 ? (
                        <img 
                          src="https://private-us-east-1.manuscdn.com/sessionFile/azmXBKRFrACxEy7wbUrV1S/sandbox/60Nav8LsPFRlfN7sG2dhNA-img-4_1771127331000_na1fn_c3VjY2Vzcy1jZWxlYnJhdGlvbg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYXptWEJLUkZyQUN4RXk3d2JVclYxUy9zYW5kYm94LzYwTmF2OExzUEZSbGZON3NHMmRoTkEtaW1nLTRfMTc3MTEyNzMzMTAwMF9uYTFmbl9jM1ZqWTJWemN5MWpaV3hsWW5KaGRHbHZiZy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=SRQpuxtRhCtuzHNlPJBuYb8ToWr~juwsHHwtvVSqtoQ1cxkAAw6YXnpHSre5fOkiSF2lHgJJ9EHLXsl0bh~c9I8E~RwG5O7Q15ui6Jt~F-BXxEmaqEbB-XyNGv8VkOtVQ6n6OqwQKF60oCX5hnZkw-y84ZWmnOXzKtSpAz2c8hxtHj0LjmY694PS5Fv2ir4h0ALH-aQUN~yF3mJBzSciBQvSmaXvNJ-WM4zVkl-CLAHgwU2tAHey64iYTeHzbkGmr67-p36YDo0kQOlCgg4kIhCsKnjDdlCQLiqucbaVI8Y5ejkX1-GLCJWb6HQTsMq21kUK~WI9gQg0IJ67PcBGyg__"
                          alt="Success"
                          className="w-32 h-32"
                        />
                      ) : (
                        <img 
                          src="https://private-us-east-1.manuscdn.com/sessionFile/azmXBKRFrACxEy7wbUrV1S/sandbox/60Nav8LsPFRlfN7sG2dhNA-img-3_1771127327000_na1fn_ZXJyb3ItaWxsdXN0cmF0aW9u.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYXptWEJLUkZyQUN4RXk3d2JVclYxUy9zYW5kYm94LzYwTmF2OExzUEZSbGZON3NHMmRoTkEtaW1nLTNfMTc3MTEyNzMyNzAwMF9uYTFmbl9aWEp5YjNJdGFXeHNkWE4wY21GMGFXOXUucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=aenjR9iU1y76t7mTToCmkJmfkUBUmAsWP4K2UOAdPFUf0YAclH0D~a7XWky-8lBkSQMXS4tYWoB2F0xTzCi65yV167yhRxNSfJ2xdg7f6BZGXVyU7TKMb~FumjHa7H83M3~uEKvHalxPfwxiUIDSEgwYFuIX4Qya9fPtx7M7NkqXfQvk7uBD4KYb-NKjX~hcHdCKrOATC5d8KHxDFS0O6-Iw4YWdZEl5dHod2h8l1lIse5Gm3R8D~oV5ZXAX6OlYaYNgpzrQKpGhrhMvSV651SOrZCsX-JDaEivnXScCCW3depiQVRXnKb8UEtz1LtIkBZ7Db9aqXPCwjWlQqCq70w__"
                          alt="Try Again"
                          className="w-32 h-32"
                        />
                      )}
                      <div>
                        <p className="text-lg text-muted-foreground mb-2">測驗成績</p>
                        <p className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                          {score} 分
                        </p>
                      </div>
                      <Button
                        onClick={() => window.location.reload()}
                        size="lg"
                        className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        再測一次
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
