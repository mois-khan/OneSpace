"use client";

import { useState, useRef, useCallback } from "react";
import { useMembers, useTickets, useAllBookings, useAppActions } from "@/lib/store";

export function useVoiceAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const deepgramSocketRef = useRef<any>(null);

  // Get live store data for context
  const members = useMembers();
  const tickets = useTickets();
  const bookings = useAllBookings();
  const mrr = members.reduce((acc, m) => acc + (m.status === 'active' ? m.monthlyFee : 0), 0);

  const toggleAgent = useCallback(() => {
    setIsOpen(prev => !prev);
    if (isOpen) {
      stopListening();
    }
  }, [isOpen]);

  const processAIResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Update history with user's speech
      const newHistory = [...chatHistory, { role: "user", text }];
      setChatHistory(newHistory);

      // Call Gemini backend
      const res = await fetch("/api/ai/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          context: {
            totalMembers: members.length,
            openTickets: tickets.filter(t => t.status === "open").length,
            mrr,
            averageRisk: Math.round(members.reduce((acc, m) => acc + (m.riskScore || 0), 0) / (members.length || 1)),
          }
        }),
      });

      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      
      // Update history with AI response
      setChatHistory(prev => [...prev, { role: "model", text: data.text }]);

      // Get TTS Audio from Deepgram Aura
      const ttsRes = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.text }),
      });

      if (!ttsRes.ok) throw new Error("TTS request failed");
      
      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        // Automatically start listening again for seamless conversation
        // startListening(); 
      };
      
      await audio.play();
      
    } catch (error) {
      console.error("Agent Error:", error);
      setIsSpeaking(false);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      // Fetch a temporary secure token from our backend
      const tokenRes = await fetch("/api/ai/deepgram-token");
      if (!tokenRes.ok) {
        throw new Error("Failed to fetch secure Deepgram token");
      }
      const { token } = await tokenRes.json();

      if (!token) {
        throw new Error("Deepgram token is missing");
      }

      const socket = new WebSocket("wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true", ["token", token]);
      deepgramSocketRef.current = socket;

      socket.onopen = () => {
        setIsListening(true);
        mediaRecorderRef.current?.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0 && socket.readyState === 1) {
            socket.send(event.data);
          }
        });
        mediaRecorderRef.current?.start(250); // Send audio chunks every 250ms
      };

      let currentTranscript = "";

      socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.type === "Results") {
          const tr = data.channel.alternatives[0].transcript;
          if (tr) {
            currentTranscript += " " + tr;
            setTranscript(currentTranscript.trim());
            
            if (data.is_final) {
              // Process the final sentence
              stopListening();
              processAIResponse(currentTranscript.trim());
            }
          }
        }
      };

      socket.onerror = (error) => {
        console.error("Deepgram Error:", error);
        stopListening();
      };

    } catch (error) {
      console.error("Microphone access denied or error:", error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (deepgramSocketRef.current && deepgramSocketRef.current.readyState === 1) {
      deepgramSocketRef.current.close();
    }
  };

  return {
    isOpen,
    isListening,
    isSpeaking,
    transcript,
    chatHistory,
    toggleAgent,
    startListening,
    stopListening
  };
}
