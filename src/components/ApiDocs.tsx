import { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Copy, CheckCircle2 } from 'lucide-react';

export function ApiDocs() {
    const [copiedPost, setCopiedPost] = useState(false);
    const [copiedGet, setCopiedGet] = useState(false);

    const apiUrl = import.meta.env.VITE_BACKEND_API_URL || '[YOUR_BACKEND_API_URL]';

    const postCode = `curl -X POST "${apiUrl}/generate" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "A futuristic city in the clouds, cyberpunk style", "negative_prompt": "blurry, low quality"}'`;

    const getCode = `curl -G "${apiUrl}/generate" \\
  --data-urlencode "prompt=A futuristic city in the clouds, cyberpunk style" \\
  --data-urlencode "negative_prompt=blurry, low quality"`;

    const handleCopy = (code: string, type: 'post' | 'get') => {
        navigator.clipboard.writeText(code);
        if (type === 'post') {
            setCopiedPost(true);
            setTimeout(() => setCopiedPost(false), 2000);
        } else {
            setCopiedGet(true);
            setTimeout(() => setCopiedGet(false), 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-4xl mx-auto mt-12 mb-24 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-banana/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 rounded-xl bg-nano/10 text-nano">
                    <Terminal size={24} />
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-starlight to-starlight/60">
                    API Documentation
                </h2>
            </div>

            <p className="text-starlight/70 mb-8 relative z-10 text-lg">
                Integrate Imagen into your custom workflows (like n8n, Make.com, or custom scripts).
                The local AI server runs on <code className="bg-white/10 px-2 py-1 rounded text-nano font-mono text-sm">{apiUrl}</code> and can serve images via POST and GET requests.
            </p>

            <div className="grid md:grid-cols-2 gap-8 relative z-10">
                {/* POST Request */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-starlight flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-bold bg-banana/20 text-banana rounded">POST</span>
                        Method (Recommended)
                    </h3>
                    <p className="text-sm text-starlight/60">Best for complex apps passing JSON data.</p>
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-void">
                        <div className="absolute top-3 right-3 z-20">
                            <button
                                onClick={() => handleCopy(postCode, 'post')}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-starlight hover:text-nano"
                            >
                                {copiedPost ? <CheckCircle2 size={16} className="text-grass" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <pre className="p-4 text-sm font-mono text-starlight/80 overflow-x-auto whitespace-pre-wrap">
                            <code>{postCode}</code>
                        </pre>
                    </div>
                </div>

                {/* GET Request */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-starlight flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-bold bg-blue-500/20 text-blue-400 rounded">GET</span>
                        Method
                    </h3>
                    <p className="text-sm text-starlight/60">Best for simple setups passing data via URL query.</p>
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-void">
                        <div className="absolute top-3 right-3 z-20">
                            <button
                                onClick={() => handleCopy(getCode, 'get')}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-starlight hover:text-nano"
                            >
                                {copiedGet ? <CheckCircle2 size={16} className="text-grass" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <pre className="p-4 text-sm font-mono text-starlight/80 overflow-x-auto whitespace-pre-wrap">
                            <code>{getCode}</code>
                        </pre>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 relative z-10">
                <h4 className="text-starlight font-semibold mb-2">Response Format</h4>
                <p className="text-sm text-starlight/70 mb-3">Both methods respond perfectly formatted to be displayed directly in image tags or consumed by API clients.</p>
                <pre className="p-3 rounded-lg bg-void/50 text-xs font-mono text-starlight/60 border border-white/5">
                    {`{
  "image": "${apiUrl}/outputs/8f106f36-1e64-4e2a-b732-c651f472856f.png"
}`}
                </pre>
            </div>
        </motion.div>
    );
}
