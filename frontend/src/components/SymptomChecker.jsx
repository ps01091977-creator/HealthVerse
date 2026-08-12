import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, AlertTriangle, ArrowRight, User } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const SymptomChecker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'bot',
      text: 'Hello! I am your AI Health Assistant. Describe your symptoms, and I will analyze them and recommend specialties.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { token, backendUrl } = useContext(AppContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { id: Date.now().toString(), type: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // If patient is not logged in, we inform them they should log in, but we still do the symptom check using the token if available.
      // If token is missing, we use standard route or call direct if token is not required (our route uses authUser, but let's check.
      // Wait, userRouter.post("/ai/symptom-check", authUser, aiSymptomCheck) requires a token! So we pass the token.
      const config = token ? { headers: { token } } : {};
      
      const response = await axios.post(`${backendUrl}/api/user/ai/symptom-check`, {
        symptoms: userText,
      }, config);

      if (response.data?.success && response.data.data) {
        const aiData = response.data.data;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            text: aiData.analysis,
            aiAnalysis: aiData, // Contains specialties, urgency, suggestions
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            text: 'I could not process the assessment. Please try again.',
          },
        ]);
      }
    } catch (error) {
      console.error('Error assessing symptoms:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Connection error. Please ensure you are logged in to use the AI assistant.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[90vw] sm:w-[420px] h-[550px] mb-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">HealthVerse AI Assistant</h3>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" /> Powered by Gemini
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div className="space-y-2 max-w-[80%]">
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.type === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200/50 dark:border-zinc-700/50'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* AI Assessment Details */}
                    {msg.aiAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5"
                      >
                        {/* Urgency Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400">Urgency Assessment</span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold tracking-wide uppercase ${getUrgencyColor(
                              msg.aiAnalysis.urgency
                            )}`}
                          >
                            {msg.aiAnalysis.urgency || 'Low'}
                          </span>
                        </div>

                        {/* Precaution suggestions */}
                        {msg.aiAnalysis.suggestions && msg.aiAnalysis.suggestions.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-500" /> Precautionary Advice
                            </span>
                            <ul className="text-[10px] list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-0.5 pl-1">
                              {msg.aiAnalysis.suggestions.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Specialty Links */}
                        {msg.aiAnalysis.specialties && msg.aiAnalysis.specialties.length > 0 && (
                          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                            <span className="text-[10px] font-medium text-zinc-400">Recommended Specialties</span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.aiAnalysis.specialties.map((spec) => (
                                <button
                                  key={spec}
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/doctors/${spec}`);
                                  }}
                                  className="text-[10px] bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 transition-all px-2.5 py-1 rounded-lg flex items-center gap-1"
                                >
                                  Find {spec} <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                  {msg.type === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 flex-shrink-0 animate-bounce">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none border border-zinc-200/50 dark:border-zinc-700/50 flex items-center gap-1 max-w-[80%]">
                    <span className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe symptoms (e.g. skin rash, headache)..."
                className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center cursor-pointer relative group"
      >
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping group-hover:animate-none"></div>
        {isOpen ? <X className="w-6 h-6 relative z-10" /> : <Bot className="w-6 h-6 relative z-10" />}
      </motion.button>
    </div>
  );
};

export default SymptomChecker;
