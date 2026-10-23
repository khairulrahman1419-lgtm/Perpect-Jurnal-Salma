import React, { useState, useRef, useEffect } from 'react';
import { ChildProfile, GrowthRecord, AIConsultMessage } from '../types';
import { calculateAgeInMonths } from '../utils/whoStandards';
import { Send, Sparkles, AlertCircle, Bot, User, Stethoscope, RefreshCw, Loader2 } from 'lucide-react';

interface AIConsultTabProps {
  child: ChildProfile;
  latestRecord?: GrowthRecord;
}

const QUICK_QUESTIONS = [
  'Bagaimana tips mengatasi anak GTM (Gerakan Tutup Mulut) saat makan MPASI?',
  'Anak saya belum bisa berjalan di usia ini, apakah perlu diperiksakan?',
  'Berapa suhu demam anak yang memerlukan obat penurun panas dan kapan harus ke IGD?',
  'Bagaimana cara menaikkan berat badan anak yang sulit naik (weight faltering)?',
  'Apakah normal jika anak sering terbangun di malam hari (night waking)?',
];

export const AIConsultTab: React.FC<AIConsultTabProps> = ({ child, latestRecord }) => {
  const age = calculateAgeInMonths(child.birthDate);

  const [messages, setMessages] = useState<AIConsultMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Halo Ayah & Ibu! Saya Dr. Sari Rahmawati, Sp.A, dokter spesialis anak. Saya siap membantu menjawab pertanyaan seputar pertumbuhan fisik, stimulasi perkembangan, nutrisi MPASI, dan kesehatan ${child.name} (${age.display}). Ada hal yang ingin dikonsultasikan hari ini?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || isLoading) return;

    const userMsg: AIConsultMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const childContext = {
        name: child.name,
        gender: child.gender,
        ageDisplay: age.display,
        weight: latestRecord?.weight,
        height: latestRecord?.height,
        headCirc: latestRecord?.headCircumference,
      };

      const res = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          history: messages,
          childContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal berkonsultasi dengan dokter AI');

      const botMsg: AIConsultMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: AIConsultMessage = {
        id: `msg_e_${Date.now()}`,
        sender: 'assistant',
        text: 'Mohon maaf, terjadi kendala saat menghubungkan ke dokter AI. Silakan coba kembali sesaat lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[700px]">
      {/* Doctor Header Profile */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50/90 via-sky-50/70 to-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500 shadow-xs shrink-0">
            <img
              src="/src/assets/images/pediatrician_dr_avatar_1792637535557.jpg"
              alt="Dr. Sari Rahmawati, Sp.A"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Dr. Sari Rahmawati, Sp.A</h3>
              <span className="text-[10px] font-semibold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full">
                Dokter Spesialis Anak AI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Konsultan Tumbuh Kembang, Imunisasi & Nutrisi Anak · Pasien: <strong className="text-slate-700">{child.name}</strong> ({age.display})
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: `msg_reset_${Date.now()}`,
                sender: 'assistant',
                text: `Percakapan telah direset. Ada hal lain seputar kesehatan ${child.name} yang ingin ditanyakan?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
          title="Mulai sesi baru"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Sesi</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-2xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-sky-600 text-white'
                    : 'bg-teal-600 text-white shadow-2xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-tr-xs shadow-2xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right font-mono ${
                    isUser ? 'text-sky-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span>Dr. Sari sedang menuliskan penjelasan medis...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Contoh Pertanyaan:</span>
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Tanyakan pada Dr. Sari seputar tumbuh kembang ${child.name}...`}
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-slate-400 text-center mt-2">
          Konsultasi ini bersifat edukatif berbasis panduan IDAI & WHO. Jika anak mengalami tanda gawat darurat (sesak napas, kejang, demam &gt;39°C pada bayi muda, dehidrasi), segera ke IGD terdekat.
        </p>
      </div>
    </div>
  );
};
