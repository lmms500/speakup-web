import React, { useState } from 'react';
import { AppState, ContextType, AnalysisResult, TabState, NavigationState } from './types';
import { analyzeAudio } from './services/geminiService';
import { storageService } from './services/storageService';
import { ResultsView } from './components/ResultsView';
import { LoadingView } from './components/LoadingView';
import { HistoryView } from './components/HistoryView';
import { HistoryDetailView } from './components/HistoryDetailView';
import { AudioRecorder } from './components/AudioRecorder';
import { useTheme } from './context/ThemeContext';

function App() {
  const [navState, setNavState] = useState<NavigationState>({ view: 'PRACTICE' });
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [selectedContext, setSelectedContext] = useState<ContextType>(ContextType.INTERVIEW);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const { theme, toggleTheme } = useTheme();

  const handleRecordingStop = async (audioBlob: Blob) => {
    setAppState('ANALYZING');
    
    try {
      const result = await analyzeAudio(audioBlob, selectedContext);
      
      // Persistência Automática
      if (result.speech_detected) {
        await storageService.saveResult(result, audioBlob);
      }

      setAnalysisResult(result);
      setAppState('RESULTS');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.userMessage || "Erro ao analisar áudio. Tente novamente.";
      alert(errorMsg);
      setAppState('IDLE');
    }
  };

  const handleRetry = () => {
    setAnalysisResult(null);
    setAppState('IDLE');
  };

  const navigateTo = (view: TabState) => {
    setNavState({ view });
    if (appState === 'RESULTS' && view === 'HISTORY') {
       handleRetry();
    }
  };

  const handleSelectDetail = (id: string) => {
    setNavState({ view: 'DETAILS', detailId: id });
  };

  const handleBackFromDetail = () => {
    setNavState({ view: 'HISTORY' });
  };

  const renderContent = () => {
    if (navState.view === 'DETAILS' && navState.detailId) {
      const detailItem = storageService.getById(navState.detailId);
      if (detailItem) {
        return <HistoryDetailView result={detailItem} onBack={handleBackFromDetail} />;
      }
    }

    if (navState.view === 'HISTORY') {
      return <HistoryView onSelectDetail={handleSelectDetail} />;
    }

    // STATE MACHINE FOR PRACTICE TAB
    switch (appState) {
      case 'IDLE':
      case 'RECORDING':
        return (
          <div className="w-full flex flex-col items-center gap-4 animate-fade-in z-10 flex-1">
             {/* Header Text only in Idle */}
             {appState === 'IDLE' && (
                <div className="text-center space-y-2 mt-4 mb-4">
                  <h2 className="text-3xl font-heading font-bold text-brand-charcoal dark:text-dark-text transition-colors">Vamos praticar?</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg transition-colors">Escolha o cenário.</p>
                </div>
             )}

            {/* Context Dropdown - Hide when recording to reduce clutter */}
            {appState === 'IDLE' && (
              <div className="w-full space-y-2 bg-white dark:bg-dark-surface p-1 rounded-2xl shadow-soft dark:shadow-dark-soft transition-all mb-4">
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
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 flex items-center w-full">
               <AudioRecorder 
                  context={selectedContext}
                  onStop={handleRecordingStop}
                  onRecordingStart={() => setAppState('RECORDING')}
               />
            </div>
          </div>
        );

      case 'ANALYZING':
        return <LoadingView />;

      case 'RESULTS':
        return analysisResult ? (
          <ResultsView result={analysisResult} onRetry={handleRetry} />
        ) : null;
    }
  };

  const showNav = appState === 'IDLE' || (appState === 'RESULTS' && navState.view !== 'DETAILS');

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-brand-offwhite dark:bg-dark-bg text-brand-charcoal dark:text-dark-text overflow-hidden font-sans transition-colors duration-300 selection:bg-brand-purple selection:text-white">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between bg-brand-offwhite dark:bg-dark-bg z-20 flex-shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-purple dark:bg-dark-primary rounded-xl flex items-center justify-center text-white shadow-glow-purple transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="10" width="3" height="8" rx="1.5" fill="white" fillOpacity="0.8"/>
              <rect x="16" y="8" width="3" height="10" rx="1.5" fill="white" fillOpacity="0.8"/>
              <path d="M12 4L14.5 7H9.5L12 4Z" fill="white"/>
              <rect x="10.5" y="7" width="3" height="13" rx="1.5" fill="white"/>
            </svg>
          </div>
          <h1 className="text-xl font-heading font-bold tracking-tight text-brand-charcoal dark:text-dark-text transition-colors">SpeakUp</h1>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-dark-surface text-brand-charcoal dark:text-dark-text shadow-sm transition-all hover:scale-105 active:scale-95"
          aria-label="Alternar Tema"
        >
          {theme === 'light' ? (
            <svg className="w-6 h-6 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md flex flex-col p-6 relative overflow-y-auto scrollbar-hide">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="w-full max-w-md bg-white dark:bg-dark-surface border-t border-slate-100 dark:border-white/5 flex justify-around py-3 pb-6 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none z-30 rounded-t-3xl flex-shrink-0 transition-colors duration-300">
          <button 
            onClick={() => navigateTo('PRACTICE')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${navState.view === 'PRACTICE' ? 'text-brand-purple dark:text-dark-primary' : 'text-slate-400 dark:text-slate-500 hover:text-brand-charcoal dark:hover:text-dark-text'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wide">Praticar</span>
          </button>
          
          <button 
             onClick={() => navigateTo('HISTORY')}
             className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${navState.view === 'HISTORY' || navState.view === 'DETAILS' ? 'text-brand-purple dark:text-dark-primary' : 'text-slate-400 dark:text-slate-500 hover:text-brand-charcoal dark:hover:text-dark-text'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wide">Histórico</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;