import React, { useState, useRef } from 'react';
import { Button, Card, Textarea, Input } from './ui/Components';
import { generateImageFromImage, optimizePrompt } from '../services/geminiService';
import { GeneratedImage } from '../types';
import { Download, Upload, Image as ImageIcon, ArrowRight, Sparkles, Wand2 } from 'lucide-react';

export const ImageToImage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSourceImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptimize = async () => {
    if (!prompt.trim()) return;
    setIsOptimizing(true);
    const optimized = await optimizePrompt(prompt);
    setPrompt(optimized);
    setIsOptimizing(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !sourceImage) return;
    setIsLoading(true);
    setError(null);

    const res = await generateImageFromImage(prompt, sourceImage);
    
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

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result.data;
      link.download = `banana-remix-${result.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto w-full gap-6 animate-in slide-in-from-bottom-5 duration-500">
      
      {/* Controls */}
      <Card className="p-6 bg-surface/40 border-banana-500/10">
        <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <ImageIcon className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">图生图重绘</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">源图片</label>
            <div 
              className="border-2 border-dashed border-zinc-700 rounded-lg h-60 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/50 hover:border-banana-400/50 transition-all relative overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {sourceImage ? (
                <img src={sourceImage} alt="Source" className="h-full w-full object-contain p-2" />
              ) : (
                <div className="text-center text-zinc-500">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>点击上传参考图</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                更换图片
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange} 
            />
          </div>

          {/* Prompt Area */}
          <div className="flex flex-col gap-4">
             <div className="flex-grow space-y-2">
                <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-zinc-400">修改指令</label>
                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing || !prompt}
                        className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                    >
                        {isOptimizing ? <span className="animate-spin">✨</span> : <Wand2 size={12} />}
                        {isOptimizing ? '优化中...' : '智能优化'}
                    </button>
                </div>
                <Textarea 
                  placeholder="把它变成素描风格，背景改成山脉..." 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="h-full min-h-[140px] text-lg resize-none whitespace-pre-wrap"
                />
             </div>
             <Button 
                onClick={handleGenerate} 
                isLoading={isLoading} 
                disabled={!prompt || !sourceImage}
                className="h-12 w-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
              >
                {isLoading ? '重绘中...' : '开始重绘'} <Sparkles className="w-4 h-4 ml-2" />
              </Button>
          </div>
        </div>
      </Card>

      {/* Result Display */}
      {result && (
         <div className="flex flex-col md:flex-row items-center gap-4 justify-center animate-in fade-in duration-700">
            <div className="w-full md:w-1/3 opacity-50 grayscale scale-90">
                <p className="text-center mb-2 text-zinc-500 text-xs uppercase tracking-widest">原图</p>
                <img src={sourceImage!} className="rounded-lg border border-white/10 w-full" />
            </div>
            
            <ArrowRight className="text-zinc-600 hidden md:block w-8 h-8" />
            
            <div className="w-full md:w-1/2 relative group">
                <p className="text-center mb-2 text-banana-400 text-xs uppercase tracking-widest font-bold">生成结果</p>
                <img src={result.data} className="rounded-xl border-2 border-banana-400/20 shadow-[0_0_40px_-10px_rgba(250,204,21,0.3)] w-full" />
                <div className="absolute top-10 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button onClick={handleDownload} variant="secondary" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    保存
                    </Button>
                </div>
            </div>
         </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-200 text-center">
            {error}
        </div>
      )}
    </div>
  );
};