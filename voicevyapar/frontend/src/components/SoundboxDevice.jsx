import React, { useState } from 'react';
import { Mic, Moon, Volume2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { processVoiceText, triggerNightlyBrief } from '../lib/api';

export default function SoundboxDevice({
  soundboxState = 'IDLE',
  setSoundboxState,
  sessionState = 'IDLE',
  lastReplyText = 'Sharma Kirana Store Soundbox Tayyar Hai.',
  refreshDashboard
}) {
  const [inputText, setInputText] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  // LED ring class resolver
  const getLedClass = () => {
    switch (soundboxState) {
      case 'LISTENING':
        return 'led-listening';
      case 'PROCESSING':
        return 'led-processing';
      case 'SPEAKING':
        return 'led-speaking';
      case 'ALERT_SUCCESS':
        return 'led-success';
      case 'IDLE':
      default:
        return 'led-idle';
    }
  };

  const handleSendText = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    try {
      setIsBusy(true);
      if (setSoundboxState) setSoundboxState('PROCESSING');
      await processVoiceText(text, 'SOUNDBOX');
      setInputText('');
      if (refreshDashboard) refreshDashboard();
    } catch (err) {
      console.error('Error sending voice text:', err);
    } finally {
      setIsBusy(false);
      if (setSoundboxState) setSoundboxState('IDLE');
    }
  };

  const handleNightlyBrief = async () => {
    try {
      setIsBusy(true);
      if (setSoundboxState) setSoundboxState('PROCESSING');
      await triggerNightlyBrief();
      if (refreshDashboard) refreshDashboard();
    } catch (err) {
      console.error('Nightly brief error:', err);
    } finally {
      setIsBusy(false);
      if (setSoundboxState) setSoundboxState('IDLE');
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* 3D Styled Soundbox Hardware */}
      <div className="relative w-80 bg-[#002970] rounded-3xl p-6 shadow-2xl border-4 border-[#001844] flex flex-col items-center text-center">
        
        {/* Brand Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-blue-900/60 mb-4">
          <span className="font-extrabold text-sm text-[#00BAF2] tracking-wider">Paytm</span>
          <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-300">
            Soundbox AI
          </span>
        </div>

        {/* LED Status Ring & Speaker Grille */}
        <div className={`relative w-44 h-44 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${getLedClass()}`}>
          {/* Internal Grille Mesh */}
          <div className="w-36 h-36 rounded-full bg-[#001844] border-2 border-slate-700/60 flex flex-col items-center justify-center p-3 relative overflow-hidden">
            {/* Grille dots pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00BAF2_1px,transparent_1px)] [background-size:8px_8px]" />
            
            {/* Soundbox Speaker Icon / Waveform */}
            <Volume2 className={`w-12 h-12 text-[#00BAF2] transition-transform ${soundboxState === 'SPEAKING' ? 'scale-110 animate-bounce' : ''}`} />
            
            <span className="text-[11px] font-mono mt-1 text-slate-300 font-semibold tracking-wider">
              {soundboxState}
            </span>
          </div>
        </div>

        {/* Multi-Turn Session State Badge */}
        {sessionState !== 'IDLE' && (
          <div className="mt-3 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs flex items-center gap-1 animate-pulse">
            <AlertCircle className="w-3 h-3" />
            <span>State: {sessionState}</span>
          </div>
        )}

        {/* Speech Bubble / Last Reply */}
        <div className="mt-4 w-full bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 text-xs text-slate-200 min-h-[52px] flex items-center justify-center text-center italic">
          "{lastReplyText}"
        </div>

        {/* Hardware Action Buttons */}
        <div className="w-full mt-4 flex flex-col gap-2">
          {/* Push to talk button */}
          <button
            onClick={() => handleSendText(inputText || 'Ramesh ko 250 ka tel udhaar diya')}
            disabled={isBusy}
            className="w-full py-3 bg-[#00BAF2] hover:bg-[#00a2d3] text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          >
            <Mic className="w-5 h-5 text-slate-950" />
            <span>Hold / Click to Speak</span>
          </button>

          {/* Nightly Brief Button */}
          <button
            onClick={handleNightlyBrief}
            disabled={isBusy}
            className="w-full py-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Moon className="w-4 h-4 text-amber-300" />
            <span>Trigger 9 PM Nightly Brief</span>
          </button>
        </div>

        {/* Manual Test Utterance Input */}
        <div className="w-full mt-4 flex gap-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            placeholder="Type voice command (Hinglish)..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BAF2]"
          />
          <button
            onClick={() => handleSendText()}
            disabled={isBusy || !inputText.trim()}
            className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium border border-slate-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

