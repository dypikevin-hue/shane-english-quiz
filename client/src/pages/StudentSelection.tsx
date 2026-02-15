import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function StudentSelection() {
  const [, setLocation] = useLocation();

  const handleSelectBrother = () => {
    localStorage.setItem('shane_student_type', 'brother');
    setLocation('/quiz');
  };

  const handleSelectYounger = () => {
    localStorage.setItem('shane_student_type', 'younger');
    setLocation('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent"
          >
            Shane English
          </motion.h1>
          
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xl text-purple-200 mb-12"
          >
            線上測驗系統
          </motion.p>

          <p className="text-center text-gray-300 mb-12 text-lg">
            請選擇您的專屬入口：
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 哥哥專區 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSelectBrother}
              className="cursor-pointer"
            >
              <Button
                className="w-full h-32 text-2xl font-bold bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">👦</div>
                  <div>四年級哥哥專區</div>
                  <div className="text-sm font-normal mt-1">(TEP 09 題庫)</div>
                </div>
              </Button>
            </motion.div>

            {/* 弟弟專區 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSelectYounger}
              className="cursor-pointer"
            >
              <Button
                className="w-full h-32 text-2xl font-bold bg-gradient-to-br from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">👦</div>
                  <div>一年級弟弟專區</div>
                  <div className="text-sm font-normal mt-1">(Level A & B 題庫)</div>
                </div>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
