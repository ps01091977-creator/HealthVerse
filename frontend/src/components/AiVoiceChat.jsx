import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  RefreshCw,
  Video,
  Star,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Languages,
  Activity,
  Check,
  Radio,
  MessageSquare,
  Sparkle,
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  Zap,
  Settings,
  Key,
  Info
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import FormattedAiMessage from './FormattedAiMessage';

const AiVoiceChat = ({ isOpen, onClose, mode = 'widget' }) => {
  const { backendUrl, token, userData } = useContext(AppContext);
  const navigate = useNavigate();

  // Assistant View Mode: 'alexa' (Interactive 3D Voice Orb) or 'chat' (Message Stream)
  const [viewMode, setViewMode] = useState('alexa');

  // Speech Language: 'en-IN' (Indian English/Hinglish - Recommended), 'hi-IN' (Hindi), 'en-US' (English US)
  const [speechLang, setSpeechLang] = useState('en-IN');

  // Assistant State: 'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking'
  const [alexaState, setAlexaState] = useState('idle');

  // Live real-time speech transcript and audio states
  const [liveTranscript, setLiveTranscript] = useState('');
  const [latestUserSpoken, setLatestUserSpoken] = useState('');
  const [latestAiSpoken, setLatestAiSpoken] = useState('');
  const [latestActionPayload, setLatestActionPayload] = useState(null);
  const [silenceCountdown, setSilenceCountdown] = useState(null);
  const [audioVolume, setAudioVolume] = useState(0); // 0 - 100%
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [missingGroqKeyNotice, setMissingGroqKeyNotice] = useState(false);

  // Chat Stream Messages
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${userData?.name ? userData.name.split(' ')[0] : 'there'}! 👋 I am your **HealthVerse AI Clinical Assistant** powered by **Groq Whisper STT & Clinical Intelligence**.\n\nI can analyze your symptoms, help you find certified specialists, and schedule doctor consultations with high-accuracy voice or chat.`,
      suggestedChips: [
        "I have had fever for 2 days",
        "Show available Cardiologists",
        "Check Dr. Test User appointment slots",
        "Doctor visit preparation checklist",
        "Emergency SOS Support"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // MediaRecorder & Web Audio Refs
  const recordTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceDetectorTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const liveInterimTextRef = useRef('');

  // Voice Output (TTS) State
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const speechSynthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  // Interactive booking confirmation staging
  const [pendingBooking, setPendingBooking] = useState(null);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, pendingBooking, alexaState, liveTranscript]);

  // Load available audio input devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        setAudioDevices(audioInputs);
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (e) {}
    };
    getDevices();
  }, []);

  // Load and cache browser speech synthesis voices
  useEffect(() => {
    if (!speechSynthRef.current) return;

    const loadVoices = () => {
      try {
        const voices = speechSynthRef.current.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
        }
      } catch (e) {}
    };

    loadVoices();
    speechSynthRef.current.onvoiceschanged = loadVoices;

    return () => {
      stopSpeech();
      stopListening();
    };
  }, []);

  // Clean Markdown string so Text-to-Speech speaks fluently
  const sanitizeTextForSpeech = (rawText) => {
    return (rawText || '')
      .replace(/###\s+/g, '')
      .replace(/##\s+/g, '')
      .replace(/#\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/Disclaimer:.*$/si, '')
      .replace(/⚠️/g, 'Alert: ')
      .replace(/[🩺🌸🎉📅🙏👋❤️⚡✨👶🧠🦴💡👨‍⚕️📋]/g, '')
      .replace(/[-*•]\s+/g, ', ')
      .replace(/\n+/g, '. ')
      .trim();
  };

  // Text to Speech playback
  const speakText = (text, msgId = 'live') => {
    if (!speechSynthRef.current) return;

    try {
      speechSynthRef.current.cancel();
      if (speechSynthRef.current.paused) {
        speechSynthRef.current.resume();
      }
    } catch (e) {}

    const cleanSpeech = sanitizeTextForSpeech(text);
    if (!cleanSpeech) return;

    // First 3-4 sentences for natural conversational response
    const speechSentences = cleanSpeech.split('.').filter(s => s.trim().length > 0).slice(0, 4).join('. ') + '.';

    const utterance = new SpeechSynthesisUtterance(speechSentences);
    utterance.volume = 1.0;

    const isHindiText = /[ह-्]/.test(text) || 
      /\b(hai|hain|karein|kare|chahiye|aapko|doctor|seene|bukhar|dard|lakshan|kripya|nazdeeki|turant|liye|mera|meri|mujhe|batayein|dikhao|salah|namaste|ji)\b/i.test(text);

    if (isHindiText || speechLang === 'hi-IN') {
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
    } else {
      utterance.lang = speechLang || 'en-IN';
      utterance.rate = 0.98;
    }
    utterance.pitch = 1.0;

    const voices = availableVoices.length > 0 ? availableVoices : speechSynthRef.current.getVoices();

    if (isHindiText || speechLang === 'hi-IN') {
      const hindiVoice = voices.find(v => 
        v.lang === 'hi-IN' || 
        v.lang.startsWith('hi') || 
        v.name.includes('Hindi') || 
        v.name.includes('हिन्दी') || 
        v.name.includes('Swara') || 
        v.name.includes('Madhur') || 
        v.name.includes('Hemant') ||
        v.name.includes('Kavya')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      } else {
        const indianEngVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India'));
        if (indianEngVoice) utterance.voice = indianEngVoice;
      }
    } else {
      const engVoice = voices.find(v => (v.lang === 'en-IN' || v.lang === 'en-US' || v.lang.startsWith('en')) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('David')));
      if (engVoice) utterance.voice = engVoice;
    }

    utterance.onstart = () => {
      setCurrentlySpeakingId(msgId);
      setAlexaState('speaking');
    };
    utterance.onend = () => {
      setCurrentlySpeakingId(null);
      setAlexaState('idle');
    };
    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') {
        setCurrentlySpeakingId(null);
        return;
      }
      console.warn('[TTS] Speech synthesis notice:', e);
      setCurrentlySpeakingId(null);
      setAlexaState('idle');
    };

    try {
      speechSynthRef.current.speak(utterance);
    } catch (sErr) {
      console.warn('[TTS] speak failed:', sErr);
    }
  };

  const stopSpeech = () => {
    if (speechSynthRef.current) {
      try {
        speechSynthRef.current.cancel();
      } catch (e) {}
      setCurrentlySpeakingId(null);
      if (alexaState === 'speaking') {
        setAlexaState('idle');
      }
    }
  };

  // Stop Audio Analyser & MediaStream
  const stopAudioAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setAudioVolume(0);
  };

  // Stop Listening Session
  const stopListening = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (silenceDetectorTimerRef.current) {
      clearTimeout(silenceDetectorTimerRef.current);
      silenceDetectorTimerRef.current = null;
    }
    isListeningRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    stopAudioAnalyser();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (alexaState === 'listening') {
      setAlexaState('idle');
    }
  };

  // Setup Web Audio Volume Monitoring with True RMS Time-Domain Sensitivity
  const startAudioAnalyser = async () => {
    try {
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };

      if (selectedDeviceId && selectedDeviceId !== 'default' && selectedDeviceId !== '') {
        audioConstraints.deviceId = { ideal: selectedDeviceId };
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      mediaStreamRef.current = stream;

      // Refresh list of real devices after mic permission is granted
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput' && d.deviceId);
        if (audioInputs.length > 0) {
          setAudioDevices(audioInputs);
        }
      } catch (e) {}

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.3;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateMeter = () => {
            if (!isListeningRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const volPercent = Math.min(100, Math.round((avg / 100) * 100));
            setAudioVolume(volPercent);

            animFrameRef.current = requestAnimationFrame(updateMeter);
          };

          animFrameRef.current = requestAnimationFrame(updateMeter);
        } catch (ctxErr) {
          console.warn('[Voice] AudioContext init notice:', ctxErr);
        }
      }

      // Initialize MediaRecorder for high quality audio capture with 128kbps bitrate
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const recorder = new MediaRecorder(stream, { 
        mimeType: mime,
        audioBitsPerSecond: 128000
      });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start(100);

      return true;
    } catch (err) {
      console.warn('[Voice] getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Microphone permission denied. Please allow microphone access in your browser.');
      } else {
        toast.error('Could not access microphone. Please check your audio devices.');
      }
      return false;
    }
  };

  // Start MediaRecorder Voice Recording Session with Live SpeechRecognition
  const startListening = async () => {
    stopSpeech();
    stopListening();

    setLiveTranscript('');
    setRecordingSeconds(0);
    setMissingGroqKeyNotice(false);
    liveInterimTextRef.current = '';
    isListeningRef.current = true;

    const streamReady = await startAudioAnalyser();
    if (!streamReady) {
      isListeningRef.current = false;
      return;
    }

    setAlexaState('listening');

    // Start live browser SpeechRecognition for instantaneous real-time transcription on screen
    const SpeechRec = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = speechLang === 'hi-IN' ? 'hi-IN' : speechLang === 'en-US' ? 'en-US' : 'en-IN';

        recognition.onresult = (event) => {
          let finalStr = '';
          let interimStr = '';
          for (let i = 0; i < event.results.length; i++) {
            const chunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalStr += chunk + ' ';
            } else {
              interimStr += chunk;
            }
          }
          const recognized = (finalStr + interimStr).trim();
          if (recognized) {
            liveInterimTextRef.current = recognized;
            setLiveTranscript(recognized);
            setLatestUserSpoken(recognized);
            setInput(recognized); // LIVE REAL-TIME TYPING ON SCREEN

            // Reset silence countdown timer to auto-send after 2.2s of user pause
            if (silenceDetectorTimerRef.current) {
              clearTimeout(silenceDetectorTimerRef.current);
            }
            silenceDetectorTimerRef.current = setTimeout(() => {
              if (isListeningRef.current && (liveInterimTextRef.current || '').trim().length > 1) {
                stopListeningAndTranscribe();
              }
            }, 2200);
          }
        };

        recognition.onerror = (e) => {
          console.warn('[WebSpeech] Recognition event:', e.error);
          if (e.error === 'not-allowed') {
            toast.error('Microphone permission was denied.');
            stopListening();
          }
        };

        recognition.onend = () => {
          // Restart recognition if listening is still active (e.g. mobile pause)
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognition.start();
            } catch (rErr) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (recErr) {
        console.warn('[WebSpeech] Init notice:', recErr);
      }
    }

    recordTimerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);

    // Auto-stop recording after 25 seconds max duration if no speech
    silenceDetectorTimerRef.current = setTimeout(() => {
      if (isListeningRef.current) {
        stopListeningAndTranscribe();
      }
    }, 25000);
  };

  // Stop Recording and Send Audio to Groq Whisper Speech-to-Text API
  const stopListeningAndTranscribe = async () => {
    if (!isListeningRef.current && alexaState !== 'listening') return;

    isListeningRef.current = false;
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (silenceDetectorTimerRef.current) {
      clearTimeout(silenceDetectorTimerRef.current);
      silenceDetectorTimerRef.current = null;
    }

    // Flush any pending MediaRecorder chunks
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {}
    }

    // Await MediaRecorder final data chunks
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        await new Promise((resolve) => {
          mediaRecorderRef.current.onstop = resolve;
          mediaRecorderRef.current.stop();
        });
      } catch (e) {}
    }

    const recordedChunks = [...audioChunksRef.current];
    const rawCaptured = (liveInterimTextRef.current || liveTranscript || input || '').trim();
    stopAudioAnalyser();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // 1. FAST PATH: If live speech recognition captured words directly from user's voice
    if (rawCaptured && rawCaptured.length > 1) {
      const cleanCaptured = rawCaptured.replace(/\b([A-Za-z0-9_\u0900-\u097F]+)(\s+\1\b){2,}/gi, '$1').trim();
      console.log('[STT] Instant live speech captured:', cleanCaptured);
      setLiveTranscript(cleanCaptured);
      setLatestUserSpoken(cleanCaptured);
      setInput(cleanCaptured);
      handleSendMessage(cleanCaptured);
      return;
    }

    if (recordedChunks.length === 0) {
      setAlexaState('idle');
      toast.info('No audio detected. Please tap the mic and speak.');
      return;
    }

    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const audioBlob = new Blob(recordedChunks, { type: mimeType });

    if (audioBlob.size < 200) {
      setAlexaState('idle');
      toast.info('Recording was too short. Please tap the microphone and speak your symptoms.');
      return;
    }

    setAlexaState('transcribing');

    try {
      // 1. Prepare FormData for multipart/form-data upload with language steering hint
      const formData = new FormData();
      formData.append('audio', audioBlob, `recording_${Date.now()}.${mimeType.includes('mp4') ? 'm4a' : mimeType.includes('wav') ? 'wav' : 'webm'}`);
      formData.append('mimeType', `lang:${speechLang}`);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { token } : {})
        },
        timeout: 12000
      };

      // 2. Call backend Groq Whisper Transcription Endpoint
      const { data } = await axios.post(`${backendUrl}/api/transcribe`, formData, config);

      let finalRecognizedText = '';

      if (data.success && data.text && data.text.trim()) {
        finalRecognizedText = data.text.trim();
      }

      if (finalRecognizedText) {
        console.log('[STT] Final recognized transcript:', finalRecognizedText);
        setLiveTranscript(finalRecognizedText);
        setLatestUserSpoken(finalRecognizedText);
        setInput(finalRecognizedText);

        // 3. Immediately send transcript to LLM clinical workflow
        handleSendMessage(finalRecognizedText);
      } else if (data.requiresCredential) {
        setAlexaState('idle');
        setMissingGroqKeyNotice(true);
        toast.warn('GROQ_API_KEY is missing in backend/.env.');
      } else {
        setAlexaState('idle');
        toast.info(data.message || 'Could not recognize speech. Please speak clearly into your mic.');
      }
    } catch (error) {
      console.warn('[Voice] Backend upload notice:', error);
      setAlexaState('idle');
      if (error.response?.data?.requiresCredential) {
        setMissingGroqKeyNotice(true);
        toast.warn('GROQ_API_KEY required in backend/.env.');
      } else {
        toast.error(error.response?.data?.message || 'Speech transcription failed. Please try typing or speak again.');
      }
    }
  };

  // Toggle Voice Listening Button
  const toggleListening = () => {
    if (alexaState === 'listening') {
      stopListeningAndTranscribe();
    } else if (alexaState === 'idle' || alexaState === 'speaking') {
      startListening();
    }
  };

  // Primary AI Query Dispatcher (Feeds transcribed speech or text into LLM)
  const handleSendMessage = async (textToSend = null, clientAction = null) => {
    const rawQuery = textToSend !== null ? textToSend : input;
    const query = (rawQuery || '').trim();
    if (!query && !clientAction) return;

    stopListening();
    stopSpeech();

    const newMsgId = Date.now().toString();
    if (query) {
      setLatestUserSpoken(query);
      // 1. Immediately render User message bubble on screen
      setMessages(prev => [
        ...prev,
        { id: newMsgId, sender: 'user', text: query }
      ]);
      setInput('');
      setLiveTranscript('');
    }

    setIsLoading(true);
    setAlexaState('thinking');

    try {
      const config = token ? { headers: { token } } : {};
      const { data } = await axios.post(
        `${backendUrl}/api/ai/chat`,
        {
          message: query,
          chatHistory: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          clientAction
        },
        config
      );

      if (data.success && data.data) {
        const responseData = data.data;
        const botMsgId = (Date.now() + 1).toString();

        const botMessage = {
          id: botMsgId,
          sender: 'ai',
          text: responseData.reply,
          sources: responseData.sources,
          actionPayload: responseData.actionPayload,
          suggestedChips: responseData.suggestedChips || [],
          responseTimeMs: responseData.responseTimeMs
        };

        // 2. FIRST: Render the complete formatted response on screen
        setMessages(prev => [...prev, botMessage]);
        setLatestAiSpoken(responseData.reply);
        setLatestActionPayload(responseData.actionPayload);
        setIsLoading(false);
        setAlexaState('idle');

        // 3. THEN: After screen display, play Text-to-Speech audio
        if (voiceOutputEnabled) {
          setTimeout(() => {
            speakText(responseData.reply, botMsgId);
          }, 150);
        }

        if (responseData.actionPayload?.result?.pendingConfirmation) {
          setPendingBooking(responseData.actionPayload.result);
        }
      } else {
        setIsLoading(false);
        setAlexaState('idle');
        toast.error('Failed to get AI response.');
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setIsLoading(false);
      setAlexaState('idle');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: '⚠️ Could not connect to the HealthVerse AI clinical engine. Please verify your connection and try again.'
        }
      ]);
    }
  };

  // Handle Form Submit
  const onSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Handle Confirmed Appointment Booking
  const handleConfirmBooking = async () => {
    if (!token) {
      toast.info('Please log in to your HealthVerse account to confirm this appointment.');
      navigate('/login');
      return;
    }

    if (!pendingBooking) return;

    setIsBookingSubmitting(true);
    try {
      await handleSendMessage(null, {
        type: 'confirm_booking',
        doctorId: pendingBooking.doctorId,
        slotDate: pendingBooking.slotDate,
        slotTime: pendingBooking.slotTime,
      });
      setPendingBooking(null);
      toast.success('🎉 Appointment Successfully Confirmed!');
    } catch (err) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // Slot Navigation Handlers
  const handleSelectDoctorSlot = (docId, docName, date = 'tomorrow') => {
    handleSendMessage(`${docName} ke ${date} ke available slots dikhao`);
  };

  const handleBookSpecificSlot = (docId, docName, slotDate, slotTime) => {
    handleSendMessage(`Book appointment with ${docName} on ${slotDate} at ${slotTime}`);
  };

  return (
    <div className={`flex flex-col ${mode === 'page' ? 'w-full h-[85vh] max-w-5xl mx-auto rounded-2xl sm:rounded-3xl shadow-xl' : 'w-full sm:w-[480px] h-[100dvh] sm:h-[720px] max-h-[100dvh] sm:max-h-[88vh] rounded-none sm:rounded-3xl shadow-2xl'} bg-white dark:bg-[#0c0d14] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans select-none transition-all duration-300`}>
      
      {/* 🌟 1. HEADER BAR */}
      <div className="bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-[#0c0d14] border-b border-zinc-200 dark:border-zinc-800/80 shadow-sm flex-shrink-0">
        
        {/* Tier 1: Main Title, Status, and Controls */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary/30 border border-white/20">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full animate-pulse" />
            </div>
            
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-white truncate">HealthVerse AI</h3>
                <span className="text-[9px] sm:text-[10px] bg-primary/10 dark:bg-primary/20 text-primary dark:text-indigo-300 border border-primary/20 dark:border-primary/30 font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Groq Whisper v3
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">Clinical Healthcare Assistant</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-850 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 shadow-inner">
              <button
                onClick={() => {
                  stopSpeech();
                  setViewMode('alexa');
                }}
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'alexa'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="Voice Orb Mode"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Voice</span>
              </button>
              <button
                onClick={() => {
                  stopSpeech();
                  setViewMode('chat');
                }}
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'chat'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="Chat Stream Mode"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chat</span>
              </button>
            </div>

            {/* Voice Auto-Reply Speaker Toggle */}
            <button
              onClick={() => {
                setVoiceOutputEnabled(!voiceOutputEnabled);
                if (voiceOutputEnabled) stopSpeech();
              }}
              title={voiceOutputEnabled ? 'Voice Auto-Reply ON' : 'Voice Auto-Reply Muted'}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                voiceOutputEnabled 
                  ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/40 shadow-sm' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button (Widget mode) */}
            {mode === 'widget' && onClose && (
              <button
                onClick={() => {
                  stopSpeech();
                  stopListening();
                  onClose();
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: Sub-toolbar with Language Picker, Microphone Device Selector & Badges */}
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-50/90 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs gap-1.5 sm:gap-2 flex-wrap">
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            <Languages className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <select
              id="voice-language-select"
              name="voiceLanguage"
              value={speechLang}
              onChange={(e) => {
                setSpeechLang(e.target.value);
                toast.info(`Voice output language: ${e.target.value === 'hi-IN' ? 'Hindi (हिन्दी)' : 'English / Hinglish'}`);
              }}
              className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-[11px] sm:text-xs rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 font-semibold border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-primary cursor-pointer max-w-[150px] sm:max-w-none truncate shadow-sm"
            >
              <option value="en-IN">🌐 English / Hinglish (Auto)</option>
              <option value="hi-IN">🇮🇳 हिन्दी (Hindi Voice)</option>
              <option value="en-US">🇺🇸 English (US)</option>
            </select>
          </div>

          {/* Microphone Device Picker */}
          {audioDevices.length > 1 && (
            <div className="flex items-center space-x-1">
              <Mic className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
              <select
                id="voice-mic-device-select"
                name="micDevice"
                value={selectedDeviceId}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value);
                  stopListening();
                  toast.info('Microphone input device updated.');
                }}
                className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 text-[10px] sm:text-[11px] rounded-lg px-1.5 py-0.5 sm:py-1 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-primary cursor-pointer max-w-[130px] sm:max-w-[160px] truncate shadow-sm"
                title="Select Microphone Input Device"
              >
                {audioDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Microphone ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-1 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-medium ml-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Groq Whisper Large v3</span>
          </div>
        </div>
      </div>

      {/* ⚠️ Missing Groq Key Notice Banner */}
      {missingGroqKeyNotice && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 p-2.5 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>
              <strong>GROQ_API_KEY required:</strong> Add key <code className="bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-300 border border-amber-300 dark:border-transparent">GROQ_API_KEY=gsk_...</code> to <code className="bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-300 border border-amber-300 dark:border-transparent">backend/.env</code>
            </span>
          </div>
          <button 
            onClick={() => setMissingGroqKeyNotice(false)} 
            className="text-amber-600 dark:text-amber-400 hover:underline text-xs cursor-pointer ml-2 flex-shrink-0 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 🔮 2. VIEW 1: VOICE ORB EXPERIENCE */}
      {viewMode === 'alexa' ? (
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 flex flex-col justify-between items-center bg-gradient-to-b from-blue-50/40 via-white to-zinc-50 dark:from-[#0c0d14] dark:via-zinc-900/60 dark:to-[#0c0d14] relative min-h-0">
          
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          {/* Quick Vital & Security Banner */}
          <div className="w-full max-w-lg grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-[9px] sm:text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 z-10 mb-1 sm:mb-2 flex-shrink-0">
            <div className="p-1 sm:p-1.5 rounded-lg bg-white/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center space-x-1">
              <Stethoscope className="w-3 h-3 text-primary" />
              <span>Symptom Triage</span>
            </div>
            <div className="p-1 sm:p-1.5 rounded-lg bg-white/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
              <span>ISO & Safe</span>
            </div>
            <div className="p-1 sm:p-1.5 rounded-lg bg-white/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center space-x-1">
              <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>1-Tap Booking</span>
            </div>
          </div>

          {/* Dynamic Status Pill: Listening... → Processing... → Speaking... */}
          <div className="text-center z-10 my-0.5 sm:my-1 flex flex-col items-center gap-1 flex-shrink-0">
            <span className={`inline-flex items-center px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold border transition-all ${
              alexaState === 'listening'
                ? 'bg-red-500/10 dark:bg-red-500/20 border-red-500/30 dark:border-red-500/40 text-red-600 dark:text-red-300 ring-4 ring-red-500/10 dark:ring-red-500/20'
                : alexaState === 'transcribing'
                ? 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/30 dark:border-purple-500/40 text-purple-600 dark:text-purple-300 ring-4 ring-purple-500/10 dark:ring-purple-500/20 animate-pulse'
                : alexaState === 'thinking' || isLoading
                ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30 dark:border-amber-500/40 text-amber-600 dark:text-amber-300'
                : alexaState === 'speaking'
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-300 ring-4 ring-emerald-500/10 dark:ring-emerald-500/20'
                : 'bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/40 text-primary dark:text-indigo-300'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                alexaState === 'listening'
                  ? 'bg-red-500 animate-ping'
                  : alexaState === 'transcribing'
                  ? 'bg-purple-500 animate-spin'
                  : alexaState === 'thinking' || isLoading
                  ? 'bg-amber-500 animate-spin'
                  : alexaState === 'speaking'
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-emerald-500'
              }`} />
              {alexaState === 'listening' && (
                `Listening... Speak now (${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, '0')})`
              )}
              {alexaState === 'transcribing' && 'Processing audio with Groq Whisper AI...'}
              {(alexaState === 'thinking' || isLoading) && 'HealthVerse AI is analyzing your symptoms...'}
              {alexaState === 'speaking' && 'HealthVerse AI is speaking...'}
              {alexaState === 'idle' && !isLoading && 'Tap microphone to speak (Whisper STT)'}
            </span>
          </div>

          {/* Central Pulsating 3D Alexa Holographic Orb */}
          <div className="my-1 sm:my-2 flex flex-col items-center justify-center z-10 flex-shrink-0">
            <div className="relative flex items-center justify-center">
              
              {/* Outer Energy Pulsing Aura */}
              <motion.div
                animate={{
                  scale: alexaState === 'listening' ? [1, 1.15 + (audioVolume / 180), 1] : alexaState === 'speaking' ? [1, 1.2, 1] : [1, 1.06, 1],
                  opacity: alexaState === 'listening' ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3],
                }}
                transition={{ duration: alexaState === 'listening' ? 0.6 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute w-24 h-24 sm:w-36 sm:h-36 rounded-full blur-xl ${
                  alexaState === 'listening'
                    ? 'bg-red-500/30'
                    : alexaState === 'transcribing'
                    ? 'bg-purple-500/30'
                    : alexaState === 'speaking'
                    ? 'bg-emerald-500/30'
                    : alexaState === 'thinking' || isLoading
                    ? 'bg-amber-500/30'
                    : 'bg-primary/20'
                }`}
              />

              {/* Central Interactive Orb Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleListening}
                className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center relative z-20 cursor-pointer shadow-2xl transition-all duration-500 border-2 ${
                  alexaState === 'listening'
                    ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 border-red-200 ring-6 sm:ring-8 ring-red-500/20'
                    : alexaState === 'transcribing'
                    ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 border-purple-200 ring-6 sm:ring-8 ring-purple-500/20 animate-pulse'
                    : alexaState === 'speaking'
                    ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 border-emerald-200 ring-6 sm:ring-8 ring-emerald-500/20'
                    : alexaState === 'thinking' || isLoading
                    ? 'bg-gradient-to-tr from-indigo-600 via-purple-500 to-amber-500 border-amber-200 animate-spin ring-6 sm:ring-8 ring-amber-500/20'
                    : 'bg-gradient-to-tr from-primary via-indigo-600 to-cyan-500 border-white/60 ring-6 sm:ring-8 ring-primary/20'
                }`}
              >
                {alexaState === 'listening' ? (
                  <>
                    <MicOff className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-white mt-0.5">Stop & Send</span>
                  </>
                ) : alexaState === 'transcribing' ? (
                  <>
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-white mt-0.5">Processing...</span>
                  </>
                ) : alexaState === 'speaking' ? (
                  <>
                    <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-bounce" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-white mt-0.5">Speaking...</span>
                  </>
                ) : alexaState === 'thinking' || isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-white mt-0.5">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-white mt-0.5">Tap to Speak</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Sound Wave Frequency Bars */}
            {alexaState === 'listening' && (
              <div className="flex items-end justify-center space-x-1 sm:space-x-1.5 h-4 sm:h-6 mt-1.5 sm:mt-2.5">
                {[4, 10, 8, 16, 12, 20, 9, 18, 11, 14, 8, 12].map((baseH, i) => {
                  const dynamicH = Math.max(3, Math.min(20, Math.round(baseH * 0.8 + (audioVolume / 100) * 12)));
                  return (
                    <motion.span
                      key={i}
                      animate={{ height: [baseH * 0.7, dynamicH, baseH * 0.7] }}
                      transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.025 }}
                      className={`w-1 sm:w-1.5 rounded-full ${audioVolume > 5 ? 'bg-emerald-500 shadow-sm shadow-emerald-400' : 'bg-red-500'}`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* 🌟 3. REAL-TIME SPEECH DISPLAY & STRUCTURED AI RESPONSE CONTAINER */}
          <div className="w-full max-w-lg bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 border border-zinc-200 dark:border-zinc-800 shadow-md dark:shadow-xl z-10 space-y-2 sm:space-y-3 flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Live Spoken Speech Banner (Live typing preview on screen) */}
            {(liveTranscript || latestUserSpoken || (alexaState === 'listening' && input)) && (
              <div className="flex flex-col space-y-1.5 bg-zinc-50 dark:bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/90 flex-shrink-0 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 text-[10px]">
                      <User className="w-2.5 h-2.5 text-zinc-700 dark:text-zinc-300" />
                    </div>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold">
                      {alexaState === 'listening' ? '🎙️ Live Voice Typing:' : 'You said:'}
                    </span>
                  </div>
                  {alexaState === 'listening' && (
                    <span className="flex items-center space-x-1 text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Listening Live...</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed break-words">
                  {liveTranscript || input || latestUserSpoken}
                  {alexaState === 'listening' && <span className="inline-block w-1.5 h-3.5 bg-emerald-500 ml-1 animate-pulse">|</span>}
                </p>
              </div>
            )}

            {/* AI Response Display Area with Rich Medical Formatting */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {alexaState === 'transcribing' ? (
                <div className="p-3 bg-purple-500/10 dark:bg-purple-950/40 rounded-xl border border-purple-500/20 dark:border-purple-800/60 flex items-center space-x-2.5 animate-pulse text-purple-700 dark:text-purple-200 text-xs">
                  <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin flex-shrink-0" />
                  <span>Processing audio with Groq Whisper-large-v3...</span>
                </div>
              ) : isLoading ? (
                <div className="p-3 bg-zinc-100 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center space-x-2.5 animate-pulse">
                  <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300">
                    HealthVerse AI is analyzing your symptoms and clinical records...
                  </span>
                </div>
              ) : latestAiSpoken ? (
                <div className="p-3 bg-zinc-50/80 dark:bg-zinc-950/70 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-inner">
                  
                  {/* Top Bar with Audio Control */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200 dark:border-zinc-800/80 text-[11px]">
                    <div className="flex items-center space-x-1.5 text-primary dark:text-indigo-300 font-bold">
                      <Bot className="w-3.5 h-3.5 text-primary dark:text-indigo-400" />
                      <span>Clinical Assessment</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (alexaState === 'speaking') {
                            stopSpeech();
                          } else {
                            speakText(latestAiSpoken, 'voice-mode');
                          }
                        }}
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                          alexaState === 'speaking'
                            ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30 dark:border-rose-500/40'
                            : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm'
                        }`}
                      >
                        {alexaState === 'speaking' ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 animate-pulse" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Listen Again</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Rich Rendered Formatted Medical Content */}
                  <FormattedAiMessage text={latestAiSpoken} />

                  {/* Doctor Cards if returned */}
                  {latestActionPayload?.result?.doctors && (
                    <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                      <p className="text-xs font-bold text-primary dark:text-indigo-300">Matching Specialists:</p>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {latestActionPayload.result.doctors.map((doc) => (
                          <div key={doc._id} className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs shadow-sm">
                            <div className="flex items-center space-x-2">
                              <img src={doc.image} alt={doc.name} className="w-8 h-8 rounded-full object-cover border border-primary/30" />
                              <div>
                                <p className="font-bold text-zinc-900 dark:text-white text-xs">{doc.name}</p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{doc.speciality} • ₹{doc.fees}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSelectDoctorSlot(doc._id, doc.name, 'tomorrow')}
                              className="px-2.5 py-1 bg-primary text-white rounded-lg font-medium text-[10px] hover:bg-primary/90 cursor-pointer shadow-sm"
                            >
                              View Slots
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Slots Pills */}
                  {latestActionPayload?.result?.availableSlots && (
                    <div className="mt-3 p-2.5 bg-white dark:bg-zinc-900/90 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-primary" />
                        Available Slots for {latestActionPayload.result.doctorName} ({latestActionPayload.result.date}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {latestActionPayload.result.availableSlots.slice(0, 6).map((slot, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleBookSpecificSlot(
                              latestActionPayload.result.doctorId,
                              latestActionPayload.result.doctorName,
                              latestActionPayload.result.date,
                              slot
                            )}
                            className="px-2.5 py-1 text-xs rounded-lg border border-primary/20 dark:border-primary/30 bg-primary/5 hover:bg-primary hover:text-white text-primary dark:text-indigo-400 transition-colors cursor-pointer font-medium"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                  <p className="font-bold text-zinc-700 dark:text-zinc-300 mb-1">How can I assist your health today?</p>
                  <p className="text-[11px] text-zinc-500">
                    Speak naturally in Hindi or English: "Mujhe bukhar hai" or "Show available doctors"
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="flex flex-nowrap overflow-x-auto gap-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0 scrollbar-none pb-0.5">
              {[
                "Mujhe 2 din se bukhar hai",
                "Find Cardiologists",
                "Check Dr. Test User slots",
                "Doctor visit checklist",
                "Emergency SOS Support"
              ].map((chip, cIdx) => (
                <button
                  key={cIdx}
                  onClick={() => handleSendMessage(chip)}
                  className="text-[10px] px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10 dark:hover:bg-primary/30 text-zinc-700 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-primary/50 hover:text-primary dark:hover:text-indigo-300 transition-colors cursor-pointer flex-shrink-0 whitespace-nowrap shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Type Input Bar */}
          <div className="w-full max-w-lg mt-2 flex items-center space-x-2 z-10 pb-safe">
            <div className="relative flex-1 flex items-center">
              <input
                id="voice-assistant-input"
                name="voiceAssistantQuery"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={alexaState === 'listening' ? "🎙️ Speaking... words typing live here" : "Type symptoms or tap microphone..."}
                className={`w-full bg-white dark:bg-zinc-900 border ${alexaState === 'listening' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-zinc-200 dark:border-zinc-800'} rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm`}
              />
              {alexaState === 'listening' && (
                <span className="absolute right-2.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 cursor-pointer shadow-md flex-shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* 💬 4. VIEW 2: FULL CHAT STREAM VIEW */
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/60">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-start max-w-[92%] space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-zinc-800 text-white' 
                    : 'bg-primary/10 text-primary border border-primary/20'
                }`}>
                  {msg.sender === 'user' ? (userData?.image ? <img src={userData.image} alt="User" className="w-8 h-8 rounded-full object-cover" /> : <User className="w-4 h-4" />) : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-800'
                }`}>
                  
                  {/* Rich Rendered Formatted Medical Content */}
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <FormattedAiMessage text={msg.text} />
                  )}

                  {/* Grounded Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-1.5 items-center text-[11px] text-zinc-500">
                      <span className="font-semibold text-primary dark:text-indigo-400">Sources:</span>
                      {msg.sources.map((src, sIdx) => (
                        <span key={sIdx} className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                          {src.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Doctor Search Result Cards */}
                  {msg.actionPayload?.result?.doctors && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-bold text-primary dark:text-indigo-400">Available Specialists:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.actionPayload.result.doctors.map((doc) => (
                          <div key={doc._id} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between space-x-3 shadow-sm">
                            <div className="flex items-center space-x-3">
                              <img src={doc.image} alt={doc.name} className="w-10 h-10 rounded-full object-cover border border-primary/20" />
                              <div>
                                <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{doc.name}</p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{doc.speciality} • ₹{doc.fees}</p>
                                <div className="flex items-center text-[11px] text-amber-500 font-semibold">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline mr-1" />
                                  <span>{doc.rating || 5.0}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSelectDoctorSlot(doc._id, doc.name, 'tomorrow')}
                              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
                            >
                              View Slots
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Slots Pills */}
                  {msg.actionPayload?.result?.availableSlots && (
                    <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-primary" />
                        Open Slots for {msg.actionPayload.result.doctorName} ({msg.actionPayload.result.date}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.actionPayload.result.availableSlots.slice(0, 8).map((slot, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleBookSpecificSlot(
                              msg.actionPayload.result.doctorId,
                              msg.actionPayload.result.doctorName,
                              msg.actionPayload.result.date,
                              slot
                            )}
                            className="px-2.5 py-1 text-xs rounded-lg border border-primary/20 dark:border-primary/30 bg-primary/5 hover:bg-primary hover:text-white text-primary dark:text-indigo-400 transition-colors font-medium cursor-pointer"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio Controls */}
                  {msg.sender === 'ai' && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                      <button
                        onClick={() => {
                          if (currentlySpeakingId === msg.id) {
                            stopSpeech();
                          } else {
                            speakText(msg.text, msg.id);
                          }
                        }}
                        className="flex items-center space-x-1 hover:text-primary transition-colors cursor-pointer font-medium"
                      >
                        {currentlySpeakingId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-primary animate-pulse" />
                            <span className="text-primary font-bold">Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen Audio</span>
                          </>
                        )}
                      </button>
                      {msg.responseTimeMs && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{msg.responseTimeMs}ms</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Suggested Action Chips */}
              {msg.suggestedChips && msg.suggestedChips.length > 0 && msg.id === messages[messages.length - 1]?.id && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 ml-10">
                  {msg.suggestedChips.map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => handleSendMessage(chip)}
                      className="text-xs px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full hover:border-primary hover:text-primary dark:hover:text-indigo-400 transition-all shadow-sm cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {/* Recording & Transcribing status in Chat Mode */}
          {alexaState === 'listening' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-end space-x-2"
            >
              <div className="bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-200 rounded-2xl rounded-tr-none px-4 py-2.5 text-sm flex items-center space-x-2 shadow-sm">
                <Mic className="w-4 h-4 text-red-500 animate-pulse flex-shrink-0" />
                <span className="font-semibold">
                  🎙️ {liveTranscript ? `Typing: "${liveTranscript}"` : `Listening... Speak now (${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, '0')})`}
                </span>
              </div>
            </motion.div>
          )}

          {alexaState === 'transcribing' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-end space-x-2"
            >
              <div className="bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-200 rounded-2xl rounded-tr-none px-4 py-2.5 text-sm flex items-center space-x-2 shadow-sm animate-pulse">
                <Loader2 className="w-4 h-4 text-purple-500 animate-spin flex-shrink-0" />
                <span className="font-semibold">Processing audio with Groq Whisper...</span>
              </div>
            </motion.div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-2 shadow-sm">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">HealthVerse AI is analyzing your symptoms...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* 5. Interactive Appointment Confirmation Modal Dialog */}
      <AnimatePresence>
        {pendingBooking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-950/90 border-t border-emerald-200 dark:border-emerald-800/80 text-zinc-900 dark:text-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  Confirm Appointment Booking
                </h4>
              </div>
              <button onClick={() => setPendingBooking(null)} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
              <p><strong>Doctor:</strong> {pendingBooking.doctorName} ({pendingBooking.speciality})</p>
              <p><strong>Date & Time:</strong> {pendingBooking.slotDate} at {pendingBooking.slotTime}</p>
              <p><strong>Consultation Fee:</strong> ₹{pendingBooking.fees}</p>
            </div>

            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={handleConfirmBooking}
                disabled={isBookingSubmitting}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                {isBookingSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm & Schedule</span>}
              </button>
              <button
                onClick={() => setPendingBooking(null)}
                className="px-3 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Bottom Bar for Chat View Mode */}
      {viewMode === 'chat' && (
        <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-safe">
          <form onSubmit={onSubmit} className="flex items-center space-x-2">
            
            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              title={alexaState === 'listening' ? 'Stop recording & transcribe' : 'Click mic to record voice'}
              className={`relative p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 cursor-pointer ${
                alexaState === 'listening'
                  ? 'bg-red-500 text-white shadow-lg ring-4 ring-red-500/30'
                  : alexaState === 'transcribing'
                  ? 'bg-purple-600 text-white ring-4 ring-purple-500/30 animate-pulse'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-primary hover:text-white border border-zinc-200 dark:border-transparent'
              }`}
            >
              {alexaState === 'listening' ? (
                <MicOff className="w-5 h-5 relative z-10 animate-bounce" />
              ) : alexaState === 'transcribing' ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Input Field */}
            <div className="relative flex-1 flex items-center">
              <input
                id="chat-assistant-input"
                name="chatAssistantQuery"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={alexaState === 'listening' ? "🎙️ Speaking... words typing live here" : "Describe your symptoms or ask a question in Hindi/English..."}
                className={`w-full bg-zinc-50 dark:bg-zinc-800/90 border ${alexaState === 'listening' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-zinc-200 dark:border-zinc-700'} rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-all shadow-inner`}
              />
              {alexaState === 'listening' && (
                <span className="absolute right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0 cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiVoiceChat;
