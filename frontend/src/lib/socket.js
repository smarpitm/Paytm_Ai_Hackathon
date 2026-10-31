import { useState, useEffect, useRef } from 'react';

const getWsBaseUrl = () => {
  if (import.meta.env.VITE_WS_BASE_URL) return import.meta.env.VITE_WS_BASE_URL;
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('render.com')) {
      return 'wss://voicevyapar-backend.onrender.com';
    }
  }
  return 'ws://localhost:8000';
};

const WS_BASE_URL = getWsBaseUrl();

// -------------------------------------------------------------------
// Speech Synthesis & Base64 Audio Player
// -------------------------------------------------------------------
export function playTtsAudio(ttsBase64, fallbackText = '', onStart = null, onEnd = null) {
  if (ttsBase64 && ttsBase64.length > 20) {
    try {
      const src = ttsBase64.startsWith('data:')
        ? ttsBase64
        : `data:audio/wav;base64,${ttsBase64}`;
      const audio = new Audio(src);

      if (onStart) audio.onplay = () => onStart();
      if (onEnd) {
        audio.onended = () => onEnd();
        audio.onerror = () => onEnd();
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[Audio] Base64 play failed, falling back to Web Speech synthesis:', err);
          fallbackSpeech(fallbackText, onStart, onEnd);
        });
      }
      return audio;
    } catch (err) {
      console.warn('[Audio] Failed to instantiate audio element:', err);
    }
  }

  return fallbackSpeech(fallbackText, onStart, onEnd);
}

function fallbackSpeech(text, onStart = null, onEnd = null) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && text) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 1.02;
      const femaleVoices = window.speechSynthesis.getVoices().filter((voice) =>
        /(female|woman|priya|meera|anushka|manisha|vidya|pooja|ritu|simran|kavya|ishita|shreya|aditi|kalpana|lekha)/i.test(voice.name)
      );
      const femaleVoice = femaleVoices.find((voice) =>
        voice.lang.toLowerCase().startsWith('hi')
      ) || femaleVoices[0];
      if (femaleVoice) utterance.voice = femaleVoice;

      if (onStart) utterance.onstart = () => onStart();
      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      window.speechSynthesis.speak(utterance);
      return utterance;
    } catch (err) {
      console.warn('[Web Speech] Synthesis error:', err);
    }
  }
  if (onEnd) onEnd();
  return null;
}

// -------------------------------------------------------------------
// React Hook: Edge WebSocket + In-Browser Mock Sync
// -------------------------------------------------------------------
export function useVoiceVyaparSocket(onEvent) {
  const [wsConnected, setWsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    let isMounted = true;

    const handlePayload = (payload) => {
      if (!isMounted || !payload) return;
      setLastEvent(payload);

      if (onEventRef.current) {
        onEventRef.current(payload);
      }
    };

    // 1. Connect to Real Edge WebSocket
    function connectWs() {
      try {
        const ws = new WebSocket(`${WS_BASE_URL}/ws/events`);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isMounted) setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handlePayload(data);
          } catch (e) {
            console.error('[WebSocket] Message parsing error:', e);
          }
        };

        ws.onerror = () => {
          if (isMounted) setWsConnected(false);
        };

        ws.onclose = () => {
          if (isMounted) {
            setWsConnected(false);
            reconnectTimeoutRef.current = setTimeout(connectWs, 3000);
          }
        };
      } catch (err) {
        if (isMounted) {
          setWsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connectWs, 3000);
        }
      }
    }

    connectWs();

    // 2. Listen for In-Browser Mock Custom Events (Fallback when :8000 offline)
    const handleMockEvent = (customEvent) => {
      handlePayload(customEvent.detail);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('voicevyapar-mock-ws', handleMockEvent);
    }

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
      if (typeof window !== 'undefined') {
        window.removeEventListener('voicevyapar-mock-ws', handleMockEvent);
      }
    };
  }, []);

  return { wsConnected, lastEvent };
}
