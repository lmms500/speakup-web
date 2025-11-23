import React from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { Button } from './Button';
import { AudioVisualizer } from './AudioVisualizer';
import { ContextType } from '../types';

interface AudioRecorderProps {
  context: ContextType;
  onStop: (blob: Blob) => void;
  onRecordingStart?: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  context, 
  onStop,
  onRecordingStart 
}) => {
  const { 
    isRecording, 
    recordingTime, 
    mediaStream,
    startRecording, 
    stopRecording 
  } = useAudioRecorder();

  const handleToggle = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (blob) onStop(blob);
    } else {
      await startRecording();
      if (onRecordingStart) onRecordingStart();
    }
  };

  if (isRecording) {
    return (
      <div className="w-full flex flex-col items-center gap-8 animate-fade-in z-10">
        <div className="text-center space-y-3 mt-4">
          <h2 className="text-2xl font-heading font-bold text-brand-charcoal dark:text-dark-text transition-colors">Gravando...</h2>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-brand-coral animate-pulse"></div>
            <p className="text-brand-charcoal dark:text-dark-text font-medium text-sm transition-colors">
              {context}
            </p>
          </div>
        </div>

        {/* Visualizer Area */}
        <div className="w-full px-4 h-32 flex items-center justify-center relative">
           <div className="absolute inset-0 bg-gradient-to-t from-brand-offwhite via-transparent to-brand-offwhite dark:from-dark-bg dark:to-dark-bg z-10 pointer-events-none opacity-20"></div>
           <AudioVisualizer stream={mediaStream} isRecording={isRecording} />
        </div>

        {/* Timer */}
        <div className="text-5xl font-mono font-bold text-brand-charcoal dark:text-dark-text tabular-nums tracking-widest transition-colors">
           {formatTime(recordingTime)}
        </div>

        <div className="w-full px-4">
            <Button onClick={handleToggle} variant="danger" fullWidth className="h-16 text-lg rounded-2xl shadow-glow-coral">
              <span className="mr-3 text-2xl">■</span> Parar e Analisar
            </Button>
        </div>
      </div>
    );
  }

  // IDLE STATE
  return (
    <div className="w-full flex flex-col items-center gap-8 animate-fade-in z-10 py-8">
      <button 
        onClick={handleToggle}
        className="relative w-32 h-32 rounded-[2.5rem] bg-brand-purple dark:bg-dark-primary text-white shadow-glow-purple hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center group"
        aria-label="Gravar"
      >
        <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/20 animate-pulse"></div>
        <svg className="w-12 h-12 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </button>
      <p className="text-sm font-bold text-brand-charcoal/50 dark:text-dark-text/50 uppercase tracking-widest transition-colors">Toque para gravar</p>
    </div>
  );
};