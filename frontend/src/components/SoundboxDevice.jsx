import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Moon,
  Volume2,
  VolumeX,
  RotateCw,
  QrCode,
  Radio,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { processVoiceAudio, processVoiceText, triggerNightlyBrief } from '../lib/api';
import { playTtsAudio } from '../lib/socket';

export default function SoundboxDevice({
  soundboxState = 'IDLE',
  setSoundboxState,
  sessionState = 'IDLE',
  lastReplyText = 'Sharma Kirana Store Soundbox Tayyar Hai.',
  qrPreviewBase64 = null,
  ttsAudioBase64 = null,
  refreshDashboard
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [showCustomerQr, setShowCustomerQr] = useState(true);
  const [micError, setMicError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Automatically show customer QR whenever a new one arrives
  useEffect(() => {
    if (qrPreviewBase64) {
      setShowCustomerQr(true);
    }
  }, [qrPreviewBase64]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

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

  // Replay spoken voice
  const handleReplayVoice = () => {
    if (!lastReplyText && !ttsAudioBase64) return;
    playTtsAudio(
      ttsAudioBase64,
      lastReplyText,
      () => setSoundboxState && setSoundboxState('SPEAKING'),
      () => setSoundboxState && setSoundboxState('IDLE')
    );
  };

  // 1. Microphone Start Recording (MediaRecorder with SpeechRecognition Fallback)
  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];

    // Attempt browser MediaRecorder API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const mimeType = mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          // Stop media stream tracks
          stream.getTracks().forEach((track) => track.stop());

          if (audioBlob.size > 0) {
            try {
              setIsBusy(true);
              if (setSoundboxState) setSoundboxState('PROCESSING');
              await processVoiceAudio(audioBlob);
              if (refreshDashboard) refreshDashboard();
            } catch (err) {
              console.error('[Soundbox] Audio process failed:', err);
            } finally {
              setIsBusy(false);
            }
          }
        };

        mediaRecorder.start(250);
        setIsRecording(true);
        if (setSoundboxState) setSoundboxState('LISTENING');
        return;
      } catch (err) {
        console.warn('[Soundbox] MediaRecorder access failed or denied, trying SpeechRecognition fallback:', err);
        setMicError('Mic access denied or unsupported. Using Web Speech recognition.');
      }
    }

    // 2. SpeechRecognition Fallback (hi-IN)
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        recognitionRef.current = rec;
        rec.lang = 'hi-IN';
        rec.continuous = false;
        rec.interimResults = false;

        rec.onstart = () => {
          setIsRecording(true);
          if (setSoundboxState) setSoundboxState('LISTENING');
        };

        rec.onresult = async (event) => {
          const transcript = event.results[0][0].transcript;
          setIsRecording(false);
          setIsBusy(true);
          if (setSoundboxState) setSoundboxState('PROCESSING');
          try {
            await processVoiceText(transcript, 'SOUNDBOX');
            if (refreshDashboard) refreshDashboard();
          } catch (e) {
            console.error('[Soundbox] SpeechRecognition process failed:', e);
          } finally {
            setIsBusy(false);
          }
        };

        rec.onerror = (event) => {
          console.warn('[Soundbox] SpeechRec error:', event.error);
          setIsRecording(false);
          if (setSoundboxState) setSoundboxState('IDLE');
          setMicError(`Speech error: ${event.error}`);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        rec.start();
        return;
      } catch (e) {
        console.error('[Soundbox] SpeechRec start failed:', e);
      }
    }

    // If both failed, alert user
    setMicError('Microphone not available. Please use the 1-click preset cards on the right.');
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Trigger 9 PM Nightly Brief
  const handleNightlyBrief = async () => {
    try {
      setIsBusy(true);
      if (setSoundboxState) setSoundboxState('PROCESSING');
      await triggerNightlyBrief();
      if (refreshDashboard) refreshDashboard();
    } catch (err) {
      console.error('[Soundbox] Nightly brief error:', err);
    } finally {
      setIsBusy(false);
    }
  };

  // Format recording timer
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      {/* Authentic Paytm 3D Soundbox Hardware Chassis */}
      <div className="relative w-full bg-gradient-to-b from-[#002970] via-[#002462] to-[#001844] rounded-[36px] p-6 shadow-[0_25px_60px_-15px_rgba(0,41,112,0.6)] border-4 border-[#001844] flex flex-col items-center text-center text-slate-100 transition-all">
        
        {/* Top Hardware Bezel & Brand Logo */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-blue-900/60 mb-5">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-lg tracking-tight text-[#00BAF2]">Paytm</span>
            <span className="text-[10px] font-black tracking-widest uppercase bg-[#00BAF2]/20 text-[#00BAF2] px-1.5 py-0.5 rounded border border-[#00BAF2]/40">
              AI
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-300 uppercase bg-[#001844]/80 px-2 py-0.5 rounded-full border border-blue-900/50">
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              4G IoT
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" title="Power ON" />
          </div>
        </div>

        {/* 360° Animated LED Status Ring & Speaker Grille */}
        <div className="relative my-2 flex items-center justify-center">
          {/* External LED Ring */}
          <div
            className={`relative w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${getLedClass()}`}
          >
            {/* Inner Metallic Acoustic Chamber */}
            <div className="w-40 h-40 rounded-full bg-gradient-to-b from-[#001a4d] to-[#000f2e] border-2 border-blue-950 flex flex-col items-center justify-center p-3 relative overflow-hidden shadow-inner">
              
              {/* Radial Grille Mesh Holes */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00BAF2_1.5px,transparent_1.5px)] [background-size:8px_8px]" />

              {/* State Dependent Visual Display */}
              {soundboxState === 'SPEAKING' ? (
                <div className="flex items-center justify-center gap-1 z-10 h-10">
                  <span className="w-1.5 bg-[#00BAF2] rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-8 shadow-[0_0_8px_#00BAF2]" />
                  <span className="w-1.5 bg-cyan-300 rounded-full animate-[bounce_0.4s_ease-in-out_infinite] h-10 shadow-[0_0_10px_#67e8f9]" />
                  <span className="w-1.5 bg-white rounded-full animate-[bounce_0.5s_ease-in-out_infinite] h-6 shadow-[0_0_8px_#ffffff]" />
                  <span className="w-1.5 bg-cyan-300 rounded-full animate-[bounce_0.7s_ease-in-out_infinite] h-9 shadow-[0_0_10px_#67e8f9]" />
                  <span className="w-1.5 bg-[#00BAF2] rounded-full animate-[bounce_0.5s_ease-in-out_infinite] h-7 shadow-[0_0_8px_#00BAF2]" />
                </div>
              ) : soundboxState === 'LISTENING' ? (
                <div className="flex flex-col items-center justify-center z-10 animate-pulse">
                  <Mic className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <span className="text-[11px] font-mono font-bold text-emerald-300 mt-1">
                    {formatTimer(recordingSeconds)}
                  </span>
                </div>
              ) : soundboxState === 'PROCESSING' ? (
                <div className="flex flex-col items-center justify-center z-10">
                  <RotateCw className="w-9 h-9 text-amber-400 animate-spin drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  <span className="text-[10px] font-mono font-bold text-amber-300 mt-1 uppercase tracking-wider">
                    Analyzing...
                  </span>
                </div>
              ) : soundboxState === 'ALERT_SUCCESS' ? (
                <div className="flex flex-col items-center justify-center z-10">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce drop-shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                  <span className="text-[10px] font-mono font-bold text-emerald-300 mt-1 uppercase tracking-wider">
                    ₹ Settled!
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center z-10">
                  <Volume2 className="w-10 h-10 text-[#00BAF2] opacity-80" />
                  <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 tracking-widest uppercase">
                    IDLE
                  </span>
                </div>
              )}

              {/* Paytm Subtitle */}
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1 z-10">
                Bulbul v3 Edge
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Paytm Standee QR Code Face Plate */}
        <div className="w-full mt-4 bg-white rounded-2xl p-3 shadow-lg border border-slate-200 text-slate-900 flex flex-col items-center relative overflow-hidden transition-all">
          
          {/* Paytm All-in-One Standee Header */}
          <div className="w-full bg-[#002970] -mx-3 -mt-3 mb-2 px-3 py-1.5 flex items-center justify-between text-white">
            <span className="font-black text-xs tracking-tight text-[#00BAF2]">Paytm</span>
            <span className="text-[9px] font-bold tracking-wider uppercase text-amber-300">
              All-In-One QR
            </span>
          </div>

          {/* QR Display: Dynamic Customer Udhaar QR vs Merchant Master QR */}
          <div className="relative w-36 h-36 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-center p-1.5 shadow-inner">
            {qrPreviewBase64 && showCustomerQr ? (
              <img
                src={qrPreviewBase64.startsWith('data:') ? qrPreviewBase64 : `data:image/png;base64,${qrPreviewBase64}`}
                alt="Dynamic Customer Udhaar QR"
                className="w-full h-full object-contain rounded"
              />
            ) : (
              // Default Merchant Paytm QR (Generated SVG)
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                {/* Standard recognizable QR pattern */}
                <rect x="5" y="5" width="28" height="28" fill="#002970" rx="3" />
                <rect x="10" y="10" width="18" height="18" fill="white" />
                <rect x="14" y="14" width="10" height="10" fill="#002970" />

                <rect x="67" y="5" width="28" height="28" fill="#002970" rx="3" />
                <rect x="72" y="10" width="18" height="18" fill="white" />
                <rect x="76" y="14" width="10" height="10" fill="#002970" />

                <rect x="5" y="67" width="28" height="28" fill="#002970" rx="3" />
                <rect x="10" y="72" width="18" height="18" fill="white" />
                <rect x="14" y="76" width="10" height="10" fill="#002970" />

                {/* Data blocks */}
                <rect x="38" y="10" width="6" height="6" fill="#002970" />
                <rect x="48" y="10" width="6" height="6" fill="#002970" />
                <rect x="38" y="22" width="6" height="6" fill="#002970" />
                <rect x="52" y="26" width="6" height="6" fill="#002970" />
                <rect x="10" y="42" width="6" height="6" fill="#002970" />
                <rect x="22" y="42" width="6" height="6" fill="#002970" />
                <rect x="38" y="42" width="10" height="10" fill="#00BAF2" />
                <rect x="52" y="42" width="6" height="6" fill="#002970" />
                <rect x="68" y="42" width="6" height="6" fill="#002970" />
                <rect x="80" y="42" width="6" height="6" fill="#002970" />
                <rect x="38" y="58" width="6" height="6" fill="#002970" />
                <rect x="48" y="58" width="6" height="6" fill="#002970" />
                <rect x="38" y="74" width="6" height="6" fill="#002970" />
                <rect x="52" y="74" width="8" height="8" fill="#002970" />
                <rect x="68" y="68" width="8" height="8" fill="#002970" />
                <rect x="82" y="78" width="6" height="6" fill="#002970" />

                {/* Center Paytm Blue Icon Badge */}
                <circle cx="50" cy="50" r="8" fill="#00BAF2" />
                <text x="50" y="53" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#002970">P</text>
              </svg>
            )}

            {/* Live Indicator overlay if customer udhaar QR is active */}
            {qrPreviewBase64 && showCustomerQr && (
              <span className="absolute top-1 right-1 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                UDHAAR
              </span>
            )}
          </div>

          {/* Standee Merchant Info */}
          <div className="mt-2 text-center">
            <span className="text-[11px] font-bold text-slate-800 block">
              {qrPreviewBase64 && showCustomerQr ? 'Khata Settlement QR Code' : 'Sharma Kirana Store'}
            </span>
            <span className="text-[9px] font-mono text-slate-500 block">
              {qrPreviewBase64 && showCustomerQr ? 'Instant Paytm UPI Payment' : 'sharmakirana@paytm • Accepted Here'}
            </span>
          </div>

          {/* Toggle QR preview if custom QR exists */}
          {qrPreviewBase64 && (
            <button
              onClick={() => setShowCustomerQr(!showCustomerQr)}
              className="mt-1 text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              {showCustomerQr ? 'Show Store Master QR' : 'Show Customer Udhaar QR'}
            </button>
          )}
        </div>

        {/* Live Vernacular Hindi Spoken Speech Bubble */}
        <div className="mt-4 w-full bg-[#001844]/90 rounded-2xl p-3 border border-blue-900/60 flex flex-col items-center justify-between min-h-[64px]">
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00BAF2] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Soundbox Spoken Reply
            </span>
            
            {/* Replay Voice button */}
            <button
              onClick={handleReplayVoice}
              disabled={isBusy || soundboxState === 'SPEAKING'}
              className="px-2 py-0.5 bg-blue-950 hover:bg-blue-900 text-[#00BAF2] border border-[#00BAF2]/40 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-40"
              title="Replay Voice Speech"
            >
              <Volume2 className="w-3 h-3" />
              Replay
            </button>
          </div>

          <p className="text-xs text-slate-200 italic leading-snug w-full text-center">
            "{lastReplyText}"
          </p>
        </div>

        {/* Primary Hardware Action Buttons */}
        <div className="w-full mt-4 flex flex-col gap-2.5">
          
          {/* Main Speak (Mic) Button */}
          <button
            onClick={handleToggleRecord}
            disabled={isBusy}
            className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 disabled:opacity-50 ${
              isRecording
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                : 'bg-[#00BAF2] hover:bg-[#00a3d4] text-[#002970] shadow-[0_0_20px_rgba(0,186,242,0.4)]'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5 text-white" />
                <span>Recording... Tap to Send ({formatTimer(recordingSeconds)})</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-[#002970]" />
                <span>Hold or Click to Speak (Mic)</span>
              </>
            )}
          </button>

          {/* Trigger 9 PM Nightly Brief Button */}
          <button
            onClick={handleNightlyBrief}
            disabled={isBusy || isRecording}
            className="w-full py-2.5 bg-[#001844] hover:bg-blue-950 border border-blue-800/80 hover:border-[#00BAF2] text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Moon className="w-4 h-4 text-amber-400" />
            <span>🌙 Trigger 9 PM Nightly Brief</span>
          </button>
        </div>

        {/* Fallback Error / Info Notification */}
        {micError && (
          <div className="mt-3 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2 flex items-center gap-1.5 text-left w-full">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{micError}</span>
          </div>
        )}

      </div>
    </div>
  );
}
