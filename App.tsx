import React, { useState, useEffect } from 'react';
import { AppState, ContextType, AnalysisResult, TabState, NavigationState } from './types';
import { analyzeAudio } from './services/geminiService';
import { storageService } from './services/storageService';
import { ResultsView } from './components/ResultsView';
import { LoadingView } from './components/LoadingView';
import { HistoryView } from './components/HistoryView';
import { HistoryDetailView } from './components/HistoryDetailView';
import { AudioRecorder } from './components/AudioRecorder';
import { useTheme } from './context/ThemeContext';
import { InstallPrompt } from './components/InstallPrompt'; 
import { ProfileView } from './components/ProfileView'; 
import { ChevronDown, Moon, Sun, LayoutGrid, History, Mic, XCircle, Flame, User, Trophy, Dices } from 'lucide-react';

interface NotificationState {
  message: string;
  type: 'error' | 'success';
}

// Lista de tópicos para o modo aleatório
const RANDOM_TOPICS = [
  "Venda uma caneta sem tinta para mim.",
  "Explique o que é a Internet para um viajante do tempo de 1800.",
  "Convença seu chefe a te dar um aumento agora.",
  "Faça um discurso de padrinho de casamento de última hora.",
  "Peça desculpas por ter esquecido o aniversário de namoro.",
  "Debata por que pizza com abacaxi é a melhor invenção.",
  "Ensine alguém a amarrar o sapato apenas usando palavras.",
  "Justifique por que você chegou 2 horas atrasado no trabalho.",
  "Convença uma criança a comer brócolis.",
  "Faça um pitch de 30 segundos sobre você mesmo."
];

function App() {
  const [navState, setNavState] = useState<NavigationState>({ view: 'PRACTICE' });
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [selectedContext, setSelectedContext] = useState<ContextType>(ContextType.INTERVIEW);
  const [customContext, setCustomContext] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  
  const [streak, setStreak] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setStreak(storageService.getStreak());
  }, [appState]);

  const showNotification = (message: string, type: 'error' | 'success' = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_TOPICS.length);
    const topic = RANDOM_TOPICS[randomIndex];
    
    setSelectedContext(ContextType.CUSTOM);
    setCustomContext(topic);
    
    // Efeito visual de feedback (opcional)
    // showNotification("Tópico gerado! Boa sorte.", 'success'); 
  };

  const handleRecordingStop = async (audioBlob: Blob, duration: number) => {
    setAppState('ANALYZING');
    
    const finalContext = selectedContext === ContextType.CUSTOM 
      ? (customContext.trim() || "Fala Livre") 
      : selectedContext;

    const currentProfile = storageService.getUserProfile();
    const currentPersona = currentProfile.persona;

    try {
      const result = await analyzeAudio(audioBlob, finalContext, duration, currentPersona);
      
      if (result.speech_detected) {
        const { newBadges } = await storageService.saveResult(result, audioBlob);
        
        if (newBadges.length > 0) {
           const names = newBadges.map(b => b.name).join(', ');
           showNotification(`Nova Conquista Desbloqueada: ${names}!`, 'success');
        }
      }

      setAnalysisResult(result);
      setAppState('RESULTS');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.userMessage || "Erro ao analisar áudio. Tente novamente.";
      showNotification(errorMsg, 'error');
      setAppState('IDLE');
    }
  };

  const handleRetry = () => {
    setAnalysisResult(null);
    setAppState('IDLE');
  };

  const navigateTo = (view: TabState) => {
    setNavState({ view });
    if (appState === 'RESULTS' && view === 'HISTORY') handleRetry();
  };

  const handleSelectDetail = (id: string) => setNavState({ view: 'DETAILS', detailId: id });
  const handleBackFromDetail = () => setNavState({ view: 'HISTORY' });

  const renderContent = () => {
    if (navState.view === 'DETAILS' && navState.detailId) {
      const detailItem = storageService.getById(navState.detailId);
      if (detailItem) return <HistoryDetailView result={detailItem} onBack={handleBackFromDetail} />;
    }
    
    if (navState.view === 'PROFILE') return <ProfileView />;

    if (navState.view === 'HISTORY') return <HistoryView onSelectDetail={handleSelectDetail} />;
    
    switch (appState) {
      case 'IDLE':
      case 'RECORDING':
        return (
          <div className="w-full flex flex-col items-center gap-4 animate-fade-in z-10 flex-1">
             {appState === 'IDLE' && (
                <div className="text-center space-y-2 mt-4 mb-4">
                  <h2 className="text-3xl font-heading font-bold text-brand-charcoal dark:text-dark-text transition-colors">Vamos praticar?</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg transition-colors">Escolha um cenário ou tente a sorte.</p>
                </div>
             )}
            {appState === 'IDLE' && (
              <div className="w-full space-y-4">
                <div className="bg-white dark:bg-dark-surface p-1 rounded-2xl shadow-soft dark:shadow-dark-soft transition-all">
                  <div className="relative group">
                    <select 
                      value={selectedContext}
                      onChange={(e) => setSelectedContext(e.target.value as ContextType)}
                      className="w-full p-5 bg-transparent border-0 rounded-xl appearance-none outline-none text-brand-charcoal dark:text-dark-text font-semibold text-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors z-10 relative"
                    >
                      {Object.values(ContextType).map((ctx) => (
                        <option key={ctx} value={ctx} className="text-brand-charcoal bg-white">{ctx}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-purple dark:text-dark-primary">
                      <ChevronDown size={24} />
                    </div>
                  </div>

                  {/* Input condicional para Contexto Personalizado */}
                  {selectedContext === ContextType.CUSTOM && (
                    <div className="px-1 pb-1 animate-fade-in">
                      <textarea
                        placeholder="Qual é o cenário? (Ex: Pedido de Casamento)"
                        value={customContext}
                        onChange={(e) => setCustomContext(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-brand-purple/50 rounded-xl outline-none text-brand-charcoal dark:text-white font-medium transition-all resize-none h-24"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Botão de Desafio Aleatório */}
                <button 
                  onClick={handleRandomTopic}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-brand-purple/30 hover:border-brand-purple hover:bg-brand-purple/5 dark:hover:bg-brand-purple/10 text-brand-purple dark:text-dark-primary font-bold flex items-center justify-center gap-2 transition-all group active:scale-95"
                >
                  <Dices size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                  Gerar Desafio Surpresa
                </button>
              </div>
            )}
            <div className="flex-1 flex items-center w-full">
               <AudioRecorder 
                 context={selectedContext === ContextType.CUSTOM ? (customContext || "Personalizado") : selectedContext} 
                 onStop={handleRecordingStop} 
                 onRecordingStart={() => setAppState('RECORDING')}
                />
            </div>
          </div>
        );
      case 'ANALYZING': return <LoadingView />;
      case 'RESULTS': return analysisResult ? <ResultsView result={analysisResult} onRetry={handleRetry} /> : null;
    }
  };

  const showNav = appState === 'IDLE' || (appState === 'RESULTS' && navState.view !== 'DETAILS');

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-brand-offwhite dark:bg-dark-bg text-brand-charcoal dark:text-dark-text overflow-hidden font-sans transition-colors duration-300 selection:bg-brand-purple selection:text-white">
      
      {notification && (
        <div className={`
          absolute top-4 left-4 right-4 p-4 rounded-2xl shadow-2xl z-50 animate-fade-in flex items-center gap-4 border
          ${notification.type === 'error' 
            ? 'bg-brand-coral text-white border-red-400' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-white/20 shadow-glow-purple'}
        `}>
          <div className={`
            p-2 rounded-full shrink-0
            ${notification.type === 'error' ? 'bg-white/20' : 'bg-white/20 backdrop-blur-md'}
          `}>
            {notification.type === 'error' ? <XCircle size={24} /> : <Trophy size={24} className="text-yellow-300 drop-shadow-sm" />}
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-sm uppercase tracking-wide opacity-90">
              {notification.type === 'error' ? 'Algo deu errado' : 'Parabéns!'}
            </h4>
            <p className="font-medium text-sm leading-snug">{notification.message}</p>
          </div>
        </div>
      )}

      <header className="w-full px-6 py-4 flex items-center justify-between bg-brand-offwhite dark:bg-dark-bg z-20 flex-shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-purple dark:bg-dark-primary rounded-xl flex items-center justify-center text-white shadow-glow-purple transition-colors">
            <Mic size={24} />
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-xl font-heading font-bold tracking-tight text-brand-charcoal dark:text-dark-text transition-colors leading-tight">SpeakUp</h1>
            
            <div className="flex items-center gap-1.5">
              <Flame 
                size={14} 
                className={`${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300 dark:text-slate-600'} transition-colors`} 
              />
              <span className={`text-xs font-bold ${streak > 0 ? 'text-orange-500' : 'text-slate-400'} transition-colors`}>
                {streak} {streak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>
        </div>
        
        <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-dark-surface text-brand-charcoal dark:text-dark-text shadow-sm transition-all hover:scale-105 active:scale-95">
          {theme === 'light' ? <Moon size={24} className="text-brand-purple"/> : <Sun size={24} className="text-yellow-400"/>}
        </button>
      </header>

      <main className="flex-1 w-full max-w-md flex flex-col p-6 relative overflow-y-auto scrollbar-hide">
        {renderContent()}
      </main>

      {showNav && (
        <nav className="w-full max-w-md bg-white dark:bg-dark-surface border-t border-slate-100 dark:border-white/5 flex justify-between px-6 py-3 pb-6 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none z-30 rounded-t-3xl flex-shrink-0 transition-colors duration-300">
          <button 
            onClick={() => navigateTo('PRACTICE')} 
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${navState.view === 'PRACTICE' ? 'text-brand-purple dark:text-dark-primary' : 'text-slate-400 dark:text-slate-500 hover:text-brand-charcoal dark:hover:text-dark-text'}`}
          >
            <LayoutGrid size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Praticar</span>
          </button>
          
          <button 
            onClick={() => navigateTo('HISTORY')} 
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${navState.view === 'HISTORY' ? 'text-brand-purple dark:text-dark-primary' : 'text-slate-400 dark:text-slate-500 hover:text-brand-charcoal dark:hover:text-dark-text'}`}
          >
            <History size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Histórico</span>
          </button>

          <button 
             onClick={() => navigateTo('PROFILE')}
             className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${navState.view === 'PROFILE' ? 'text-brand-purple dark:text-dark-primary' : 'text-slate-400 dark:text-slate-500 hover:text-brand-charcoal dark:hover:text-dark-text'}`}
           >
             <User size={24} />
             <span className="text-[10px] font-bold uppercase tracking-wide">Perfil</span>
           </button>
        </nav>
      )}

      <InstallPrompt />
    </div>
  );
}

export default App;