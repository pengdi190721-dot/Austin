import React, { useState } from 'react';
import { Button, Card, Textarea } from './ui/Components';
import { generateImageFromText, optimizePrompt } from '../services/geminiService';
import { GeneratedImage } from '../types';
import { Download, Sparkles, Wand2 } from 'lucide-react';

export const TextToImage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);

    const res = await generateImageFromText(prompt);
    
    if (res.error) {
      setError(res.error);
    } else if (res.image) {
      setResult({
        id: Date.now().toString(),
        data: res.image,
        prompt: prompt,
        timestamp: Date.now()
      });
    }
    setIsLoading(false);
  };

  const handleOptimize = async () => {
    if (!prompt.trim()) return;
    setIsOptimizing(true);
    const optimized = await optimizePrompt(prompt);
    setPrompt(optimized);
    setIsOptimizing(false);
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result.data;
      link.download = `banana-gen-${result.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full max-w-6xl mx-auto w-full animate-in fade-in zoom-in duration-500">
      {/* Input Section */}
      <div className="flex-1 space-y-4">
        <Card className="p-6 h-full flex flex-col gap-4 bg-surface/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-banana-400/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-banana-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">文生图</h2>
          </div>
          
          <div className="flex-grow space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm text-zinc-400">描述你的想象</label>
              <button 
                onClick={handleOptimize}
                disabled={isOptimizing || !prompt}
                className="text-xs flex items-center gap-1 text-banana-400 hover:text-banana-300 transition-colors disabled:opacity-50"
              >
                {isOptimizing ? <span className="animate-spin">✨</span> : <Wand2 size={12} />}
                {isOptimizing ? '优化中...' : '智能优化提示词'}
              </button>
            </div>
            <Textarea 
              placeholder="例如：一座霓虹闪烁的未来香蕉城市，赛博朋克风格..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-40 text-lg resize-none whitespace-pre-wrap"
            />
            
            <div className="flex gap-2 flex-wrap">
              {['赛博朋克', '水彩画', '3D 渲染', '像素艺术', '中国山水画', '吉卜力风格'].map(style => (
                <button 
                  key={style}
                  onClick={() => setPrompt(p => p + (p ? '，' : '') + style)}
                  className="px-3 py-1 text-xs rounded-full border border-zinc-700 bg-zinc-800/50 hover:bg-banana-400/20 hover:border-banana-400/50 hover:text-banana-200 transition-all"
                >
                  + {style}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            isLoading={isLoading} 
            disabled={!prompt}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-banana-400 to-banana-500 hover:to-banana-300 text-black shadow-lg shadow-banana-500/20"
          >
            {isLoading ? '正在绘制...' : '开始生成'}
          </Button>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-200 text-sm">
              {error}
            </div>
          )}
        </Card>
      </div>

      {/* Output Section */}
      <div className="flex-1">
        <Card className="h-full min-h-[400px] flex items-center justify-center p-4 bg-surface/20 border-dashed relative overflow-hidden group">
          {result ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img 
                src={result.data} 
                alt={result.prompt} 
                className="max-h-[500px] w-auto object-contain rounded-lg shadow-2xl border border-white/5" 
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button onClick={handleDownload} variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  下载原图
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-zinc-500 space-y-3">
              {isLoading ? (
                <div className="flex flex-col items-center animate-pulse">
                  <div className="w-16 h-16 bg-banana-400/20 rounded-full mb-4 blur-xl"></div>
                  <p className="font-mono text-banana-200">正在调用 Gemini 想象力...</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-zinc-800 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 opacity-20" />
                  </div>
                  <p>在此处展示你的创意杰作</p>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};