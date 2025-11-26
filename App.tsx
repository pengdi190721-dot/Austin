import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TextToImage } from './components/TextToImage';
import { ImageToImage } from './components/ImageToImage';
import { WorkflowEditor } from './components/WorkflowEditor';
import { MeteorEffect } from './components/ui/Components';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TEXT_TO_IMAGE);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-zinc-100 relative selection:bg-banana-400/30 selection:text-banana-200">
       <MeteorEffect />
       
      <Navbar currentMode={mode} onModeChange={setMode} />
      
      <main className="flex-grow p-4 md:p-8 relative z-10 overflow-hidden flex flex-col">
        {mode === AppMode.TEXT_TO_IMAGE && <TextToImage />}
        {mode === AppMode.IMAGE_TO_IMAGE && <ImageToImage />}
        {mode === AppMode.WORKFLOW && (
            <div className="h-[calc(100vh-8rem)] w-full rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                <WorkflowEditor />
            </div>
        )}
      </main>

      {/* Decorative footer line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-banana-500/50 to-transparent opacity-20" />
    </div>
  );
};

export default App;
