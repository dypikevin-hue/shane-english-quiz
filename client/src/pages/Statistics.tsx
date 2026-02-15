/* 遊戲化學習體驗設計 - 數據視覺化頁面,使用 recharts 展示學習趨勢 */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Target, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

interface QuizHistory {
  time: string;
  score: number;
  total: number;
}

const HISTORY_KEY = "shane_english_history";
const MISTAKES_KEY = "shane_english_mistakes";

const COLORS = ['#10b981', '#fbbf24', '#f43f5e', '#7c3aed'];

interface StatisticsProps {
  studentType: 'brother' | 'younger';
}

export default function Statistics({ studentType }: StatisticsProps) {
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [mistakeCount, setMistakeCount] = useState(0);

  useEffect(() => {
    try {
      const historyKey = studentType === 'brother' ? `${HISTORY_KEY}_brother` : `${HISTORY_KEY}_younger`;
      const mistakesKey = studentType === 'brother' ? `${MISTAKES_KEY}_brother` : `${MISTAKES_KEY}_younger`;
      
      const historyStr = localStorage.getItem(historyKey);
      if (historyStr) {
        const data = JSON.parse(historyStr);
        if (Array.isArray(data)) {
          setHistory(data);
        }
      }

      const mistakesStr = localStorage.getItem(MISTAKES_KEY);
      if (mistakesStr) {
        const mistakes = JSON.parse(mistakesStr);
        if (Array.isArray(mistakes)) {
          setMistakeCount(mistakes.length);
        }
      }
    } catch(e) {
      console.error('Error loading statistics:', e);
    }
  }, []);

  // 計算統計數據
  const totalTests = history.length;
  const averageScore = totalTests > 0 
    ? Math.round(history.reduce((sum, h) => sum + h.score, 0) / totalTests)
    : 0;
  const highestScore = totalTests > 0
    ? Math.max(...history.map(h => h.score))
    : 0;

  // 成績分布
  const scoreDistribution = [
    { name: '90-100分', value: history.filter(h => h.score >= 90).length, color: '#10b981' },
    { name: '70-89分', value: history.filter(h => h.score >= 70 && h.score < 90).length, color: '#fbbf24' },
    { name: '60-69分', value: history.filter(h => h.score >= 60 && h.score < 70).length, color: '#f97316' },
    { name: '60分以下', value: history.filter(h => h.score < 60).length, color: '#f43f5e' }
  ].filter(item => item.value > 0);

  // 最近10次測驗趨勢
  const recentTrend = history.slice(0, 10).reverse().map((h, index) => ({
    name: `第${index + 1}次`,
    score: h.score,
    date: h.time.split(' ')[0]
  }));

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
          className="mb-8"
        >
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回測驗
            </Button>
          </Link>
          
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
            學習統計分析
          </h1>
          <p className="text-xl text-purple-200">追蹤你的學習進度與成就</p>
        </motion.div>

        {totalTests === 0 ? (
          <Card className="neon-border bg-card/80 backdrop-blur-md">
            <CardContent className="p-12 text-center">
              <p className="text-xl text-muted-foreground">尚無測驗記錄,開始你的第一次測驗吧!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="neon-border bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-300 mb-1">總測驗次數</p>
                        <p className="text-4xl font-bold text-white">{totalTests}</p>
                      </div>
                      <Target className="w-12 h-12 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="neon-border bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-300 mb-1">平均分數</p>
                        <p className="text-4xl font-bold text-white">{averageScore}</p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="neon-border bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-300 mb-1">最高分數</p>
                        <p className="text-4xl font-bold text-white">{highestScore}</p>
                      </div>
                      <Award className="w-12 h-12 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="neon-border bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-300 mb-1">錯題數量</p>
                        <p className="text-4xl font-bold text-white">{mistakeCount}</p>
                      </div>
                      <img 
                        src="https://private-us-east-1.manuscdn.com/sessionFile/azmXBKRFrACxEy7wbUrV1S/sandbox/60Nav8LsPFRlfN7sG2dhNA-img-2_1771127330000_na1fn_YWNoaWV2ZW1lbnQtYmFkZ2U.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYXptWEJLUkZyQUN4RXk3d2JVclYxUy9zYW5kYm94LzYwTmF2OExzUEZSbGZON3NHMmRoTkEtaW1nLTJfMTc3MTEyNzMzMDAwMF9uYTFmbl9ZV05vYVdWMlpXMWxiblF0WW1Ga1oyVS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Ri9VdnQRgEPqCsKd0sfGAYW7n5rdhyKs9SjXi8gIUYlyvttqQZnD7kFjND68lk-kBPukrmLf4H-savOFy1JlYQugJIaHOKQuneMx-CgRJ-8zU-8qkgG5gFDkVxndg59eSIxesrDMqdweBIIQzUgHdA9OoBgb031bSf4qSi2aVWlk0n1KhpvVwCTVEYgrYLGZIRzRwp4IuAD7WVxA5eczfq8Fu1RyUyDpoN3P3Rc4DTbn26JKutl81ijYD~R2b-mf-3nHc6pyfNw58Zowie0fZwthuYleNoQczDFSKTcXznUehmZVr0eFmLVtUM1IIbtN-NN~dglwap0ts7y8SQAcyg__"
                        alt="Badge"
                        className="w-12 h-12"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 圖表區 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 成績趨勢圖 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="neon-border bg-card/80 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      最近10次測驗成績趨勢
                    </CardTitle>
                    <CardDescription>追蹤你的進步軌跡</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={recentTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#999" />
                        <YAxis domain={[0, 100]} stroke="#999" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e1b4b', 
                            border: '1px solid #7c3aed',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', r: 6 }}
                          activeDot={{ r: 8 }}
                          name="分數"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 成績分布圓餅圖 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="neon-border bg-card/80 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      成績分布統計
                    </CardTitle>
                    <CardDescription>各分數區間的測驗次數</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={scoreDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}次`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {scoreDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e1b4b', 
                            border: '1px solid #7c3aed',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 題數統計長條圖 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="lg:col-span-2"
              >
                <Card className="neon-border bg-card/80 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      歷史測驗成績總覽
                    </CardTitle>
                    <CardDescription>所有測驗的詳細分數記錄</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={history.slice(0, 15).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#999"
                          tickFormatter={(value) => value.split(' ')[0]}
                        />
                        <YAxis domain={[0, 100]} stroke="#999" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e1b4b', 
                            border: '1px solid #7c3aed',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="score" 
                          fill="#7c3aed"
                          radius={[8, 8, 0, 0]}
                          name="分數"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
