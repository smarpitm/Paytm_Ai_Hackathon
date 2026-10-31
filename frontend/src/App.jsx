import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SoundboxPage from './pages/SoundboxPage';
import ErpDashboardPage from './pages/ErpDashboardPage';
import { fetchErpDashboard } from './lib/api';
import { useVoiceVyaparSocket, playTtsAudio } from './lib/socket';

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [soundboxState, setSoundboxState] = useState('IDLE');
  const [sessionState, setSessionState] = useState('IDLE');
  const [lastReplyText, setLastReplyText] = useState('Sharma Kirana Store Soundbox Tayyar Hai.');
  const [apiPoolStatus, setApiPoolStatus] = useState({
    sarvam_active_index: 1,
    sarvam_total_keys: 3,
    groq_active_index: 1,
    groq_total_keys: 3,
    telegram_bot_active: false,
  });

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await fetchErpDashboard();
      setDashboard(data);
      if (data?.api_pool_status) {
        setApiPoolStatus(data.api_pool_status);
      }
    } catch (err) {
      console.warn('Could not fetch dashboard (backend may not be running yet):', err);
    }
  }, []);

  // Fetch initial dashboard
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Handle incoming real-time edge WebSocket events
  const handleWebSocketEvent = useCallback((event) => {
    setTelemetryLogs((prev) => [event, ...prev.slice(0, 49)]);

    if (event.soundbox_state) {
      setSoundboxState(event.soundbox_state);
    }
    if (event.conversation_session_state) {
      setSessionState(event.conversation_session_state);
    }
    if (event.reply_text) {
      setLastReplyText(event.reply_text);
    }

    // Play TTS speech audio if provided
    if (event.tts_audio_base64 || event.reply_text) {
      playTtsAudio(
        event.tts_audio_base64,
        event.reply_text,
        () => setSoundboxState('SPEAKING'),
        () => setSoundboxState('IDLE')
      );
    }

    // Refresh ERP dashboard when events mutate data
    if (['VOICE_PROCESSED', 'UPI_PAYMENT_RECEIVED', 'BROADCAST_SENT', 'DEMO_RESET'].includes(event.event_type)) {
      refreshDashboard();
    }
  }, [refreshDashboard]);

  const { isConnected: wsConnected } = useVoiceVyaparSocket(handleWebSocketEvent);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        wsConnected={wsConnected}
        apiPoolStatus={apiPoolStatus}
        refreshDashboard={refreshDashboard}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/soundbox" replace />} />
          <Route
            path="/soundbox"
            element={
              <SoundboxPage
                soundboxState={soundboxState}
                setSoundboxState={setSoundboxState}
                sessionState={sessionState}
                telemetryLogs={telemetryLogs}
                lastReplyText={lastReplyText}
                refreshDashboard={refreshDashboard}
              />
            }
          />
          <Route
            path="/erp"
            element={
              <ErpDashboardPage
                dashboard={dashboard}
                refreshDashboard={refreshDashboard}
              />
            }
          />
          <Route path="*" element={<Navigate to="/soundbox" replace />} />
        </Routes>
      </main>

      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-500">
        Paytm Build for India AI Hackathon • Team BINARYBRAINS • VoiceVyapar
      </footer>
    </div>
  );
}

