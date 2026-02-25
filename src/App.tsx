
import { Header } from './components/Header';
import { PromptEngine } from './components/PromptEngine';
import { ApiDocs } from './components/ApiDocs';
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen bg-void text-starlight relative overflow-hidden font-sans selection:bg-nano selection:text-void">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-nano/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 0.8, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-banana/10 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <Header />

      <main className="relative z-10 w-full min-h-screen pt-32 pb-16 px-4 flex flex-col items-center">
        <div className="w-full flex-grow flex items-center justify-center mb-16">
          <PromptEngine />
        </div>
        <ApiDocs />
      </main>

      {/* Floating Nano Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "110vh", x: Math.random() * window.innerWidth }}
            animate={{
              y: "-10vh",
              x: `calc(${Math.random() * 100}vw)`,
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute rounded-full border border-white/5 glass-panel"
            style={{
              width: 10 + Math.random() * 30,
              height: 10 + Math.random() * 30,
              opacity: 0.1 + Math.random() * 0.3
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
