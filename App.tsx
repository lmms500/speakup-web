import React, { useState, useEffect } from 'react';
import { AppState, ContextType, AnalysisResult, TabState, NavigationState } from './types';
import { analyzeAudio } from './services/geminiService';
import { storageService } from './services/storageService';
import { ResultsView } from './components/ResultsView';
import { LoadingView } from './components/LoadingView';
import { HistoryView } from './components/HistoryView';
import { HistoryDetailView } from './components/HistoryDetailView';
import { CompareView } from './components/CompareView';
import { AudioRecorder } from './components/AudioRecorder';
import { useTheme, ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { InstallPrompt } from './components/InstallPrompt'; 
import { ProfileView } from './components/ProfileView'; 
import { Onboarding } from './components/Onboarding'; // [NOVO]
import { ChevronDown, Moon, Sun, LayoutGrid, History, Mic, XCircle, Flame, User, Trophy, Dices } from 'lucide-react';
import { TRANSLATIONS, TranslationKey } from './i18n/translations';

interface NotificationState {
  message: string;
  type: 'error' | 'success';
}

const RANDOM_TOPICS = [
  "Venda uma caneta sem tinta para mim.",
  "Explique o que é a Internet.",
  "Convença seu chefe a te dar um aumento."
];

const MainApp = () => {
  const [navState, setNavState] = useState<NavigationState>({ view: 'PRACTICE' });
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [selectedContext, setSelectedContext] = useState<ContextType>(ContextType.INTERVIEW);
  const [customContext, setCustomContext] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [streak, setStreak] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false); // [NOVO]
  
  const { theme, toggleTheme } = useTheme();
  const { t, language } = useLanguage();

  useEffect(() => {
    setStreak(storageService.getStreak());
    
    // Checar se o onboarding já foi visto
    const hasSeenOnboarding = localStorage.getItem('speakup_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [appState]);

  const showNotification = (message: string, type: 'error' | 'success' = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_TOPICS.length);
    setSelectedContext(ContextType.CUSTOM);
    setCustomContext(RANDOM_TOPICS[randomIndex]);
  };

  const handleRecordingStop = async (audioBlob: Blob, duration: number) => {
    setAppState('ANALYZING');
    
    let finalContext = "";
    if (selectedContext === ContextType.CUSTOM) {
        finalContext = customContext.trim() || "Custom";
    } else {
        const translationKey = `ctx_${selectedContext.toLowerCase()}` as TranslationKey;
        finalContext = t(translationKey);
    }

    const currentProfile = storageService.getUserProfile();

    try {
      const result = await analyzeAudio(audioBlob, finalContext, duration, currentProfile.persona, language);
      
      if (result.speech_detected) {
        const { newBadges } = await storageService.saveResult(result, audioBlob);
        if (newBadges.length > 0) showNotification(`${t('sys_success')} +${newBadges.length}`, 'success');
      }

      setAnalysisResult(result);
      setAppState('RESULTS');
    } catch (error: any) {
      console.error(error);
      showNotification(t('sys_error'), 'error');
      setAppState('IDLE');
    }
  };

  // Função para renderizar com animação de slide
  const AnimatedContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full h-full animate-slide-up">{children}</div>
  );

  const renderContent = () => {
    if (navState.view === 'DETAILS' && navState.detailId) {
      const detailItem = storageService.getById(navState.detailId);
      if (detailItem) return <AnimatedContainer><HistoryDetailView result={detailItem} onBack={() => setNavState({ view: 'HISTORY' })} /></AnimatedContainer>;
    }
    if (navState.view === 'COMPARE' && navState.compareIds) {
      const r1 = storageService.getById(navState.compareIds[0]);
      const r2 = storageService.getById(navState.compareIds[1]);
      if (r1 && r2) return <AnimatedContainer><CompareView resultA={r1} resultB={r2} onBack={() => setNavState({ view: 'HISTORY' })} /></AnimatedContainer>;
    }
    if (navState.view === 'PROFILE') return <AnimatedContainer><ProfileView /></AnimatedContainer>;
    if (navState.view === 'HISTORY') return <AnimatedContainer><HistoryView onSelectDetail={(id) => setNavState({ view: 'DETAILS', detailId: id })} onCompare={(id1, id2) => setNavState({ view: 'COMPARE', compareIds: [id1, id2] })} /></AnimatedContainer>;
    
    switch (appState) {
      case 'IDLE':
      case 'RECORDING':
        return (
          <div className="w-full flex flex-col items-center gap-4 animate-slide-up z-10 flex-1">
             {appState === 'IDLE' && (
                <div className="text-center space-y-2 mt-4 mb-4">
                  <h2 className="text-3xl font-heading font-bold text-brand-charcoal dark:text-dark-text">{t('home_title')}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{t('home_subtitle')}</p>
                </div>
             )}
            {appState === 'IDLE' && (
              <div className="w-full space-y-4">
                <div className="bg-white dark:bg-dark-surface p-1 rounded-2xl shadow-soft transition-all">
                  <div className="relative group">
                    <select 
                      value={selectedContext}
                      onChange={(e) => setSelectedContext(e.target.value as ContextType)}
                      className="w-full p-5 bg-transparent border-0 rounded-xl appearance-none outline-none text-brand-charcoal dark:text-dark-text font-semibold text-lg cursor-pointer z-10 relative"
                    >
                      {Object.values(ContextType).map((ctxKey) => {
                        const translationKey = `ctx_${ctxKey.toLowerCase()}` as TranslationKey;
                        return (
                          <option key={ctxKey} value={ctxKey} className="text-brand-charcoal bg-white">
                            {t(translationKey)}
                          </option>
                        );
                      })}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-purple"><ChevronDown size={24} /></div>
                  </div>
                  {selectedContext === ContextType.CUSTOM && (
                    <div className="px-1 pb-1 animate-fade-in">
                      <textarea
                        placeholder={t('context_placeholder')}
                        value={customContext}
                        onChange={(e) => setCustomContext(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-brand-purple/50 rounded-xl outline-none text-brand-charcoal dark:text-white font-medium resize-none h-24"
                      />
                    </div>
                  )}
                </div>
                <button onClick={handleRandomTopic} className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-brand-purple/30 text-brand-purple dark:text-dark-primary font-bold flex items-center justify-center gap-2 hover:bg-brand-purple/5">
                  <Dices size={20} /> {t('btn_random')}
                </button>
              </div>
            )}
            <div className="flex-1 flex items-center w-full">
               <AudioRecorder 
                 context={selectedContext === ContextType.CUSTOM ? (customContext || "Custom") : t(`ctx_${selectedContext.toLowerCase()}` as TranslationKey)} 
                 onStop={handleRecordingStop} 
                 onRecordingStart={() => setAppState('RECORDING')}
                />
            </div>
          </div>
        );
      case 'ANALYZING': return <LoadingView />;
      case 'RESULTS': return analysisResult ? <AnimatedContainer><ResultsView result={analysisResult} onRetry={() => { setAnalysisResult(null); setAppState('IDLE'); }} /></AnimatedContainer> : null;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-brand-offwhite dark:bg-dark-bg text-brand-charcoal dark:text-dark-text overflow-hidden font-sans transition-colors duration-300">
      
      {/* Tutorial Overlay */}
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

      {notification && (
        <div className={`absolute top-4 left-4 right-4 p-4 rounded-2xl shadow-2xl z-50 animate-fade-in flex items-center gap-4 border ${notification.type === 'error' ? 'bg-brand-coral text-white border-red-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-white/20'}`}>
          <div className="p-2 rounded-full bg-white/20">{notification.type === 'error' ? <XCircle size={24} /> : <Trophy size={24} />}</div>
          <div className="flex-1"><p className="font-medium text-sm">{notification.message}</p></div>
        </div>
      )}

      <header className="w-full px-6 py-4 flex items-center justify-between bg-brand-offwhite dark:bg-dark-bg z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-purple dark:bg-dark-primary rounded-xl flex items-center justify-center text-white"><Mic size={24} /></div>
          <div className="flex flex-col">
            <h1 className="text-xl font-heading font-bold tracking-tight">{t('app_name')}</h1>
            <div className="flex items-center gap-1.5">
              <Flame size={14} className={`${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300'} `} />
              <span className="text-xs font-bold">{streak}</span>
            </div>
          </div>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-dark-surface shadow-sm">{theme === 'light' ? <Moon size={24} className="text-brand-purple"/> : <Sun size={24} className="text-yellow-400"/>}</button>
      </header>

      <main className="flex-1 w-full max-w-md flex flex-col p-6 relative overflow-y-auto scrollbar-hide">
        {renderContent()}
      </main>

      {(appState === 'IDLE' || (appState === 'RESULTS' && navState.view !== 'DETAILS' && navState.view !== 'COMPARE')) && (
        <nav className="w-full max-w-md bg-white dark:bg-dark-surface border-t border-slate-100 dark:border-white/5 flex justify-between px-6 py-3 pb-6 shadow-soft z-30 rounded-t-3xl flex-shrink-0">
          <button onClick={() => setNavState({view: 'PRACTICE'})} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${navState.view === 'PRACTICE' ? 'text-brand-purple dark:text-dark-primary' : 'text-slate-400'}`}>
            <LayoutGrid size={24} /><span className="text-[10px] font-bold uppercase">{t('tab_practice')}</span>
          </button>
          <button onClick={() => setNavState({view: 'HISTORY'})} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${navState.view === 'HISTORY' ? 'text-brand-purple dark:text-dark-primary' : 'text-slate-400'}`}>
            <History size={24} /><span className="text-[10px] font-bold uppercase">{t('tab_history')}</span>
          </button>
          <button onClick={() => setNavState({view: 'PROFILE'})} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${navState.view === 'PROFILE' ? 'text-brand-purple dark:text-dark-primary' : 'text-slate-400'}`}>
            <User size={24} /><span className="text-[10px] font-bold uppercase">{t('tab_profile')}</span>
          </button>
        </nav>
      )}
      <InstallPrompt />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;