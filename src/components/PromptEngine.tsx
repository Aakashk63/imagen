import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Download, Variable, Image as ImageIcon } from 'lucide-react';

interface PromptEngineProps { }

export const PromptEngine: React.FC<PromptEngineProps> = () => {
  const [subject, setSubject] = useState('');
  const [mood, setMood] = useState('photorealistic, 8k, highly detailed');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const getApiBaseUrl = () => {
    const host = window.location.hostname;
    // If deployed on Vercel, the local backend is still at localhost
    if (host.includes('vercel.app')) {
      return 'http://localhost:8000';
    }
    return `http://${host}:8000`;
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateImage = async () => {
    if (!subject) return;

    setIsGenerating(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${subject}, ${mood}`,
          negative_prompt: 'low quality, blurry, distorted, bad formatting'
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setGeneratedImage(data.image);
      // Refresh history after a successful generation
      fetchHistory();
    } catch (error) {
      console.error(error);
      alert(`Failed to connect to the local Python AI. Please ensure the Python backend is running at ${getApiBaseUrl()}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-32 pb-20 px-4 relative z-10 flex flex-col md:flex-row gap-8">
      {/* Left Column: Input */}
      <div className="w-full md:w-5/12 space-y-6 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
            Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-nano to-banana">Everything.</span>
          </h2>
          <p className="text-white/60 text-lg">
            Generate any object, person, or scene in the world with the local Imagen AI model.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-3xl space-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/50 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-nano" />
              Subject Description
            </label>
            <textarea
              className="w-full bg-void/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-nano/50 focus:ring-1 focus:ring-nano/50 transition-all resize-none"
              rows={4}
              placeholder="e.g. A futuristic sports car breaking into glass shards, or a glowing neon jellyfish floating above a cyberpunk city..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/50 flex items-center gap-2">
              <Variable className="w-4 h-4 text-banana" />
              Atmosphere / Mood
            </label>
            <input
              type="text"
              className="w-full bg-void/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-banana/50 focus:ring-1 focus:ring-banana/50 transition-all"
              placeholder="e.g. ethereal and melancholic"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>

          <button
            onClick={generateImage}
            disabled={!subject || isGenerating}
            className="w-full bg-gradient-to-r from-nano to-banana text-void font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Generate Visual
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Right Column: Output */}
      <div className="w-full md:w-7/12 min-h-[500px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!generatedImage && !isGenerating ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full aspect-square border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-8 glass-panel relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-nano/5 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500" />
              <ImageIcon className="w-16 h-16 text-white/20 mb-4 group-hover:text-nano/40 transition-colors" />
              <p className="text-white/40 text-lg font-medium">Awaiting prompt parameters...</p>
              <p className="text-white/20 text-sm mt-2">Outputs will feature strict anti-gravity physics.</p>
            </motion.div>
          ) : isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full aspect-square rounded-3xl glass-panel relative overflow-hidden flex flex-col items-center justify-center"
            >
              {/* Animated glowing orb while generating */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 rounded-full bg-gradient-to-tr from-nano via-banana to-transparent blur-2xl opacity-50"
                />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-nano animate-spin mb-6" />
                <p className="text-xl font-medium tracking-widest text-white/80 uppercase">Rendering Physics</p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 200 }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-1 bg-gradient-to-r from-nano to-banana mt-4 rounded-full shadow-[0_0_10px_rgba(225,255,0,0.5)]"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-nano to-banana rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative aspect-square rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
                <img
                  src={generatedImage || undefined}
                  alt="Generated Anti-Gravity Scene"
                  className="w-full h-full object-cover shadow-[0_0_50px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Download Button Overlay */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a
                    href={generatedImage || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-void/80 backdrop-blur-md rounded-full border border-white/20 text-white hover:text-nano transition-colors block"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History Section Below */}
      {history.length > 0 && (
        <div className="w-full mt-16 pt-8 border-t border-white/10 flex flex-col items-center">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold tracking-tighter mb-8 self-start"
          >
            Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-nano to-banana">History</span>
          </motion.h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
            {history.map((imgUrl, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full aspect-square relative rounded-xl overflow-hidden glass-panel group cursor-pointer border border-white/5 hover:border-nano/50 transition-colors"
                onClick={() => setGeneratedImage(imgUrl)}
              >
                <img
                  src={imgUrl}
                  alt={`Generated past scene ${index}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-void/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
