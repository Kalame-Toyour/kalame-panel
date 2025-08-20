import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, Play, Square, Volume2 } from 'lucide-react'
import { useRouter } from '../contexts/RouterContext'
import { useAuth } from '../hooks/useAuth'
import { useToast } from './ui/Toast'
import { api } from '../utils/api'

interface VoiceSample {
  ID: number
  title: string
  description: string
  voice_url: string
  status: string
}

type Step = 'select' | 'input' | 'result'

function TextToVoicePage() {
  const { navigate } = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [voices, setVoices] = useState<VoiceSample[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<number | null>(null)
  const [step, setStep] = useState<Step>('select')
  const [userText, setUserText] = useState('')
  const [ttsLoading, setTtsLoading] = useState(false)
  const [ttsError, setTtsError] = useState<string | null>(null)
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!user?.accessToken) {
      setError('برای دسترسی به این بخش وارد شوید')
      setLoading(false)
      return
    }
    fetchVoices()
    return () => {
      const a = audioRef.current
      if (a) a.pause()
    }
  }, [user?.accessToken])

  async function fetchVoices() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getWithAuth('/getSampleVoice', user!.accessToken)
      const list = (res as any)?.sampleVoice as VoiceSample[] | undefined
      setVoices(Array.isArray(list) ? list : [])
    } catch (err) {
      setError('خطا در دریافت لیست صداها')
    } finally {
      setLoading(false)
    }
  }

  function handleBack() { navigate('chat') }

  function handlePlay(sample: VoiceSample) {
    const el = audioRef.current
    if (playingId === sample.ID) {
      if (el) el.pause()
      setPlayingId(null)
      return
    }
    if (el) {
      el.src = sample.voice_url
      el.currentTime = 0
      el.play()
      setPlayingId(sample.ID)
      el.onended = () => setPlayingId(null)
    }
  }

  function handleSelectVoice(id: number) {
    setSelectedVoice(id)
    setStep('input')
    setTtsAudioUrl(null)
    setUserText('')
    setTtsError(null)
  }

  async function handleTTS() {
    if (!user?.accessToken) {
      showToast('لطفاً وارد شوید', 'error')
      return
    }
    if (!userText || !selectedVoice) return
    setTtsLoading(true)
    setTtsError(null)
    setTtsAudioUrl(null)
    try {
      const payload = {
        prompt: userText,
        modelType: 'tts',
        subModel: 'tts',
        chatId: '-2',
        voice: voices.find(v => v.ID === selectedVoice)?.title || ''
      }
      const res = await api.postWithAuth('/text-to-speech', payload, user.accessToken) as any
      // Accept both 'audioUrl' and 'url'
      const audioUrl = res?.audioUrl || res?.url
      if (!audioUrl) throw new Error('آدرس فایل صوتی دریافت نشد')
      const finalUrl = typeof audioUrl === 'string' && audioUrl.startsWith('/') ? `https://media.kalame.chat${audioUrl}` : audioUrl
      setTtsAudioUrl(finalUrl)
      setStep('result')
    } catch (err) {
      setTtsError('خطا در تبدیل متن به گفتار')
    } finally {
      setTtsLoading(false)
    }
  }

  function handlePlayPauseResult() {
    if (!audioRef.current || !ttsAudioUrl) return
    if (audioRef.current.src !== ttsAudioUrl) audioRef.current.src = ttsAudioUrl
    if (audioRef.current.paused) audioRef.current.play()
    else audioRef.current.pause()
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900" dir="rtl">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button onClick={handleBack} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">تبدیل متن به گفتار</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {step === 'select' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> در حال بارگذاری صداها...
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {voices.map(v => (
                  <div key={v.ID} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 dark:text-gray-100 truncate" title={v.title}>{v.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{v.description || 'بدون توضیح'}</div>
                      </div>
                      <button
                        onClick={() => handlePlay(v)}
                        className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        title={playingId === v.ID ? 'توقف' : 'پخش نمونه'}
                      >
                        {playingId === v.ID ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleSelectVoice(v.ID)}
                      className="mt-3 w-full rounded-lg py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      انتخاب این صدا
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'input' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">انتخاب صدای گوینده</label>
              <select
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2 text-right text-gray-800 dark:text-gray-100 focus:outline-none mb-4"
                value={selectedVoice ?? ''}
                onChange={e => setSelectedVoice(Number(e.target.value))}
              >
                <option value="" disabled>انتخاب کنید...</option>
                {voices.map(v => (
                  <option key={v.ID} value={v.ID}>{v.title} - {v.description}</option>
                ))}
              </select>
              <textarea
                className="w-full h-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-right text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-sans"
                placeholder="متن مورد نظر خود را بنویسید..."
                defaultValue={userText}
                onChange={(e) => {
                  const newValue = e.target.value;
                  console.log('TextToVoicePage textarea onChange:', newValue, 'Length:', newValue.length, 'Type:', typeof newValue);
                  setUserText(newValue);
                }}
                onKeyDown={(e) => {
                  // جلوگیری از عملکرد دکمه Backspace کیبرد گوشی
                  if (e.key === 'Backspace' && e.target instanceof HTMLTextAreaElement) {
                    const textarea = e.target as HTMLTextAreaElement
                    const cursorPosition = textarea.selectionStart || 0
                    
                    // اگر cursor در ابتدای فیلد باشد، از عملکرد Backspace جلوگیری کن
                    if (cursorPosition === 0) {
                      e.preventDefault()
                      return
                    }
                  }
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  const newValue = target.value;
                  setUserText(newValue);
                }}
                onCompositionStart={() => {
                  // Handle composition start if needed
                }}
                onCompositionUpdate={(e) => {
                  
                  const target = e.target as HTMLTextAreaElement;
                  const newValue = target.value;
                  setUserText(newValue);
                }}
                onCompositionEnd={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  const newValue = target.value;
                  setUserText(newValue);
                }}
                onBlur={(e) => {
                  
                  // Sync on blur to ensure final state
                  const target = e.target as HTMLTextAreaElement;
                  if (target.value !== userText) {
                    setUserText(target.value);
                  }
                }}
                onFocus={() => {
                  // Handle focus if needed
                }}
                onPaste={(e) => {
                  const pastedText = e.clipboardData.getData('text');
                  
                  const newValue = userText + pastedText;
                  setUserText(newValue);
                }}
                dir="rtl"
                lang="fa"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                style={{ 
                  direction: 'rtl',
                  textAlign: 'right',
                  unicodeBidi: 'embed',
                  wordBreak: 'normal',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
              />
            </div>
            {ttsError && <div className="text-center text-red-500">{ttsError}</div>}
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-lg py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!userText || !selectedVoice || ttsLoading}
                onClick={handleTTS}
              >
                {ttsLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin inline-block ml-2" />در حال تبدیل...</>
                ) : 'تبدیل به گفتار'}
              </button>
              <button
                className="flex-1 rounded-lg py-3 bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={() => setStep('select')}
              >بازگشت</button>
            </div>
          </div>
        )}

        {step === 'result' && ttsAudioUrl && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold">
                  <Volume2 className="w-5 h-5" /> نتیجه تبدیل
                </div>
                <button
                  onClick={handlePlayPauseResult}
                  className="rounded-full p-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Play className="w-5 h-5" />
                </button>
              </div>
              <audio ref={audioRef} src={ttsAudioUrl} className="w-full mt-3" controls onEnded={() => { /* no-op */ }} />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 rounded-lg py-3 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setStep('input')}>تبدیل مجدد</button>
              <button className="flex-1 rounded-lg py-3 bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={() => setStep('select')}>انتخاب صدای دیگر</button>
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

export default TextToVoicePage


