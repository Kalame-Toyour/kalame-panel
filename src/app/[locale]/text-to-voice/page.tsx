'use client';

import React, { useEffect, useState } from 'react';
import { useDynamicContent } from '@/utils/dynamicContent';

interface VoiceSample {
  ID: number;
  title: string;
  description: string;
  voice_url: string;
  status: string;
}

const VoiceListPage = () => {
  const [voices, setVoices] = useState<VoiceSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<number | null>(null);
  const [step, setStep] = useState<'select' | 'input' | 'result'>('select');
  const [userText, setUserText] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const content = useDynamicContent();

  useEffect(() => {
    fetchVoices();
    return () => {
      if (audio) audio.pause();
    };
  }, []);

  useEffect(() => {
    if (!ttsAudioUrl) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [ttsAudioUrl]);

  const fetchVoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/getSampleVoice');
      if (!res.ok) throw new Error('خطا در دریافت لیست صداها');
      const data = await res.json();
      setVoices(data.sampleVoice || []);
    } catch (err: unknown) {
      let message = 'خطا در ارتباط با سرور';
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (voice: VoiceSample) => {
    if (audio) {
      audio.pause();
      setAudio(null);
      setPlayingId(null);
    }
    if (playingId !== voice.ID) {
      const newAudio = new Audio(voice.voice_url);
      setAudio(newAudio);
      setPlayingId(voice.ID);
      newAudio.play();
      newAudio.onended = () => {
        setPlayingId(null);
        setAudio(null);
      };
    }
  };

  const handleSelectVoice = (id: number) => {
    setSelectedVoice(id);
    setStep('input');
    setTtsAudioUrl(null);
    setUserText('');
    setTtsError(null);
  };

  const handleTTS = async () => {
    setTtsLoading(true);
    setTtsError(null);
    setTtsAudioUrl(null);
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          modelType: 'tts',
          subModel: 'tts',
          chatId: '-2',
          voice: voices.find(v => v.ID === selectedVoice)?.title || '',
        }),
      });
      if (!res.ok) throw new Error('خطا در تبدیل متن به گفتار');
      const data = await res.json();
      console.log(data);
      if (!data.audioUrl) throw new Error('خطا در دریافت فایل صوتی');
      setTtsAudioUrl(data.audioUrl);
      setStep('result');
    } catch (err: unknown) {
      let message = 'خطا در ارتباط با سرور';
      if (err instanceof Error) message = err.message;
      setTtsError(message);
    } finally {
      setTtsLoading(false);
    }
  };

  const handleVoicePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVoiceEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4" dir="rtl">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-10 mt-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-right">تبدیل متن به گفتار</h1>
        {step === 'select' && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-xl shadow-lg p-5 flex flex-col justify-between animate-pulse">
                    <div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mb-4"></div>
                    </div>
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-300 dark:border-gray-500">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {voices.map((voice) => (
                  <div key={voice.ID} className="bg-gray-50 dark:bg-gray-700/60 rounded-xl shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-xl">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 truncate" title={voice.title}>{voice.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 h-10 overflow-hidden text-ellipsis">
                        {voice.description || 'بدون توضیحات'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button 
                        title={playingId === voice.ID ? "توقف" : "پخش نمونه"}
                        className={`p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 ${
                          content.brandName === 'کلمه' ? 'focus:ring-blue-500' : 'focus:ring-purple-500'
                        }`}
                        onClick={() => handlePlay(voice)}
                      >
                        {playingId === voice.ID ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25Zm7.5 0a.75.75 0 01.75-.75H16.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25Z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <button 
                        className={`flex-1 rounded-lg py-2.5 px-4 text-white font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                          content.brandName === 'کلمه'
                            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                        }`}
                        onClick={() => handleSelectVoice(voice.ID)}
                      >
                        انتخاب این صدا
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {step === 'input' && (
          <>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">انتخاب صدای گوینده</label>
              <select
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2 text-right text-gray-800 dark:text-gray-100 focus:outline-none mb-4"
                value={selectedVoice ?? ''}
                onChange={e => setSelectedVoice(Number(e.target.value))}
              >
                <option value="" disabled>انتخاب کنید...</option>
                {voices.map(voice => (
                  <option key={voice.ID} value={voice.ID}>{voice.title} - {voice.description}</option>
                ))}
              </select>
              <textarea
                className={`w-full h-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-right text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 resize-none ${
                  content.brandName === 'کلمه' ? 'focus:ring-blue-400' : 'focus:ring-purple-400'
                }`}
                placeholder="متن مورد نظر خود را بنویسید..."
                value={userText}
                onChange={e => setUserText(e.target.value)}
                dir="rtl"
              />
            </div>
            {ttsError && <div className="text-center text-red-500 mb-4">{ttsError}</div>}
            <div className="flex gap-4">
              <button
                className={`flex-1 rounded-lg py-3 text-white font-semibold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                  content.brandName === 'کلمه'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                disabled={!userText || !selectedVoice || ttsLoading}
                onClick={handleTTS}
              >
                {ttsLoading ? 'در حال تبدیل...' : 'تبدیل به گفتار'}
              </button>
              <button
                className="flex-1 rounded-lg py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-lg transition-colors"
                onClick={() => setStep('select')}
              >بازگشت</button>
            </div>
          </>
        )}
        {step === 'result' && ttsAudioUrl && (
          <div className="flex flex-col items-center gap-6 mt-8 w-full">
            <div className={`w-full max-w-xl flex flex-col items-center rounded-2xl shadow-xl p-6 ${
              typeof window !== 'undefined' && window.location.hostname === 'okian.ai' 
                ? 'bg-gradient-to-br from-purple-50 to-purple-200 dark:from-gray-800 dark:to-gray-700'
                : 'bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-800 dark:to-gray-700'
            }`}>
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center gap-4 w-full justify-center mb-4">
                  <button
                    className={`rounded-full text-white p-4 shadow-lg focus:outline-none transition-all duration-200 ${isPlaying ? 'scale-110' : ''} ${
                      typeof window !== 'undefined' && window.location.hostname === 'okian.ai' 
                        ? 'bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-400'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400'
                    }`}
                    onClick={handleVoicePlayPause}
                    aria-label={isPlaying ? 'توقف' : 'پخش'}
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                        <rect x="6" y="5" width="4" height="14" rx="1.5" />
                        <rect x="14" y="5" width="4" height="14" rx="1.5" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                        <path d="M5 3.878v16.244c0 1.518 1.64 2.47 2.98 1.71l12.04-8.122c1.32-.89 1.32-2.93 0-3.82L7.98 1.768C6.64 1.008 5 1.96 5 3.478z" />
                      </svg>
                    )}
                  </button>
                  {/* Waveform animation */}
                  <div className="flex items-end gap-1 h-8">
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <div
                        key={i}
                        className={`w-1.5 rounded transition-all duration-300 ${isPlaying ? 'animate-wave' : 'h-2'} ${
                          content.brandName === 'کلمه'
                            ? 'bg-blue-400 dark:bg-blue-300'
                            : 'bg-purple-400 dark:bg-purple-300'
                        }`}
                        style={{ height: isPlaying ? `${Math.random() * 24 + 8}px` : '8px' }}
                      />
                    ))}
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={ttsAudioUrl}
                  onEnded={handleVoiceEnded}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  className="hidden"
                />
                <div className="text-center text-gray-700 dark:text-gray-200 text-base mt-2">برای پخش یا توقف، روی دکمه کلیک کنید</div>
              </div>
            </div>
            <div className="flex gap-2 w-full max-w-4xl mt-2 justify-center">
              <button
                className={`min-w-[90px] rounded-md py-3 px-3 text-white font-normal text-sm transition-colors ${
                  content.brandName === 'کلمه'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                onClick={() => setStep('input')}
              >تبدیل مجدد</button>
              <button
                className="min-w-[90px] rounded-md py-3 px-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-normal text-sm transition-colors"
                onClick={() => setStep('select')}
              >انتخاب صدای دیگر</button>
            </div>
            {/* Waveform animation CSS */}
            <style>{`
              @keyframes wave {
                0% { height: 8px; }
                20% { height: 32px; }
                40% { height: 16px; }
                60% { height: 28px; }
                80% { height: 12px; }
                100% { height: 8px; }
              }
              .animate-wave {
                animation: wave 1s infinite linear;
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceListPage; 