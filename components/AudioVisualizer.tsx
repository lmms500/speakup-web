import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ stream, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuração inicial do Canvas para alta densidade (Retina displays)
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Função de desenho "Idle" (Linha suave pulsante)
    const drawIdle = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      const centerY = rect.height / 2;
      
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(rect.width, centerY);
      ctx.strokeStyle = "rgba(108, 99, 255, 0.2)"; // Roxo bem fraco
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pequeno ponto pulsante no meio
      const time = Date.now() / 1000;
      const radius = 2 + Math.sin(time * 3);
      
      ctx.beginPath();
      ctx.arc(rect.width / 2, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#6C63FF";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#6C63FF";
      ctx.fill();
      
      if (!isRecording) {
        animationRef.current = requestAnimationFrame(drawIdle);
      }
    };

    // Se não estiver gravando ou sem stream, desenha estado ocioso
    if (!isRecording || !stream) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      drawIdle();
      return;
    }

    // --- SETUP DE ÁUDIO ---

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioCtx = audioContextRef.current;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64; // Menor FFT para barras mais grossas e estéticas
    analyser.smoothingTimeConstant = 0.8; // Suavização
    analyserRef.current = analyser;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    sourceRef.current = source;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // --- LOOP DE DESENHO ATIVO ---

    const drawActive = () => {
      animationRef.current = requestAnimationFrame(drawActive);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Configuração do Efeito Neon/Glow
      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
      gradient.addColorStop(0, '#6C63FF'); // Roxo
      gradient.addColorStop(0.5, '#8B85FF'); // Roxo Claro
      gradient.addColorStop(1, '#00C896'); // Menta

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(108, 99, 255, 0.6)";

      const barWidth = (rect.width / bufferLength) * 0.8; // Espaçamento entre barras
      const centerY = rect.height / 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // Normaliza o valor (0-255) e aplica escala
        const v = dataArray[i] / 255;
        // Altura simétrica (para cima e para baixo)
        const barHeight = (v * rect.height * 0.8) + 4; // +4 para garantir visibilidade mínima

        const y = centerY - (barHeight / 2);

        // Desenha barra com cantos arredondados
        // Fallback simples para rect se roundRect não existir
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 50);
            ctx.fill();
        } else {
            ctx.fillRect(x, y, barWidth, barHeight);
        }

        x += barWidth + (rect.width / bufferLength) * 0.2; // Move X com gap
      }
    };

    drawActive();

    // Cleanup function
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
    };
  }, [stream, isRecording]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full rounded-xl"
      style={{ width: '100%', height: '100%' }}
    />
  );
};