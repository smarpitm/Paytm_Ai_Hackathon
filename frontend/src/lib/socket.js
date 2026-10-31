import { useState, useEffect, useRef } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

export function useVoiceVyaparSocket(onEvent) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    function connect() {
      try {
        const ws = new WebSocket(`${WS_BASE_URL}/ws/events`);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isMounted) setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (isMounted) {
              setLastEvent(data);
              if (onEvent) onEvent(data);
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        ws.onerror = () => {
          if (isMounted) setIsConnected(false);
        };

        ws.onclose = () => {
          if (isMounted) {
            setIsConnected(false);
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
          }
        };
      } catch (err) {
        if (isMounted) {
          setIsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [onEvent]);

  return { isConnected, lastEvent };
}

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
      audio.play().catch((err) => {
        console.warn('Audio play was prevented or failed:', err);
        fallbackSpeech(fallbackText, onStart, onEnd);
      });
      return audio;
    } catch (err) {
      console.warn('Error creating audio element:', err);
    }
  }

  return fallbackSpeech(fallbackText, onStart, onEnd);
}

function fallbackSpeech(text, onStart = null, onEnd = null) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    if (onStart) utterance.onstart = () => onStart();
    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }
    window.speechSynthesis.speak(utterance);
    return utterance;
  }
  if (onEnd) onEnd();
  return null;
}

