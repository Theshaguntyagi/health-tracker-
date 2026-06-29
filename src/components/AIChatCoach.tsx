import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Send, Sparkles, Brain, Trash2, ArrowRight } from 'lucide-react';

const QUICK_PROMPTS = [
  'How much protein did I eat today?',
  'Can I eat Maggi?',
  'Suggest dinner under 500 calories',
  'Why isn\'t my weight decreasing?',
  'What should I eat tomorrow?'
];

export const AIChatCoach: React.FC = () => {
  const { messages, sendChatMessage, clearChat } = useData();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setInputText('');
    try {
      await sendChatMessage(trimmed);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col justify-between">
      {/* Chat Header */}
      <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/40 pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" /> AI Chat Coach
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask questions about nutrition, macros, workout plans, and weight loss plateaus.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Clear chat history?')) clearChat();
          }}
          className="p-2 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 dark:text-slate-600 rounded-xl transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-550/10'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/45 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              {/* Custom message text formatting */}
              <div className="whitespace-pre-line text-xs md:text-sm">
                {msg.content.split(/\*\*(.*?)\*\*/g).map((part, i) => 
                  i % 2 === 1 ? <strong key={i} className="font-extrabold">{part}</strong> : part
                )}
              </div>
              <div className={`text-[9px] mt-2 text-right ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/45 text-slate-800 dark:text-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500 animate-bounce" />
              <span className="text-xs text-slate-400 font-medium">Coach is thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Footer / Input & Suggestions */}
      <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/40 space-y-3 bg-slate-900/0">
        
        {/* Suggestion Chips */}
        {messages.length < 5 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={sending}
                className="whitespace-nowrap bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-850 text-[11px] font-bold text-slate-600 dark:text-slate-350 border border-slate-200/40 dark:border-slate-800/30 px-3.5 py-1.5 rounded-full transition-all active:scale-95 flex items-center gap-1"
              >
                {prompt} <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        )}

        {/* Input Field */}
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask your coach anything (e.g. How do I eat more protein?)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            className="flex-1 glass-input py-3 text-sm focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-indigo-500/10"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
