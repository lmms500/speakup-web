import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const requestRef = useRef<number | null>(null); // Referência para o loop de animação
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Loop de animação suave (60fps)
  const animate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    // Cleanup ao desmontar
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  // Ao arrastar o slider, pausamos a animação momentaneamente para evitar conflito
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  return (
    <div className="w-full bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-3 flex items-center gap-3 mt-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      <button
        onClick={togglePlay}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6C63FF] hover:bg-[#5a52d5] flex items-center justify-center transition-all shadow-lg active:scale-95 border border-white/20"
      >
        {isPlaying ? (
          <Pause size={18} className="text-white fill-current" />
        ) : (
          <Play size={18} className="text-white fill-current ml-1" />
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="flex justify-between text-[10px] font-medium text-white/90 px-1 leading-none">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.01" // Importante para a suavidade
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-black/30 rounded-full appearance-none cursor-pointer accent-[#6C63FF]"
          style={{
            WebkitAppearance: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;