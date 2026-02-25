import React from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="glass-panel rounded-2xl px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="w-10 h-10 rounded-full bg-gradient-to-tr from-nano via-banana to-transparent flex items-center justify-center shadow-[0_0_20px_rgba(225,255,0,0.3)]"
                        >
                            <ImageIcon className="w-5 h-5 text-void" />
                        </motion.div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-nano to-banana">
                                IMAGEN
                            </h1>
                            <p className="text-[10px] text-white/50 tracking-[0.2em] font-medium uppercase">Global Image Generator</p>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 rounded-full px-4 py-2 text-sm font-medium">
                        <Sparkles className="w-4 h-4 text-nano" />
                        <span>Premium Output</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
