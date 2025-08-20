import React, { useEffect, useState } from 'react'
import { ArrowRight, Loader2, Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useRouter } from '../contexts/RouterContext'
import { api } from '../utils/api'

function AboutPage() {
  const { navigate } = useRouter()
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/about') as any
        let text = res?.content || ''
        if (!text && res?.success && Array.isArray(res?.about)) {
          text = res.about
            .map((item: { text?: string }) => item?.text || '')
            .filter(Boolean)
            .join('\n\n')
        }
        if (mounted) {
          setContent(text)
          if (typeof res?.lastUpdated === 'string') setLastUpdated(res.lastUpdated)
        }
      } catch {
        if (mounted) setError('خطا در دریافت اطلاعات')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="about-help-page flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" dir="rtl">
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="about-help-header relative z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-600 bg-white/90 dark:bg-slate-800/95 backdrop-blur-md">
        <button onClick={() => navigate('chat')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <ArrowRight size={20} className="text-gray-600 dark:text-slate-300" />
        </button>
        <h1 className="about-help-heading text-lg font-bold text-gray-900 dark:text-slate-100">درباره ما</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4">
        <div className="about-help-content bg-white/90 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-slate-600 p-5">
          {loading ? (
            <div className="about-help-loading text-center text-gray-500 dark:text-slate-400 py-8">
              <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> در حال بارگذاری...
            </div>
          ) : error ? (
            <div className="about-help-error text-center text-red-500 dark:text-red-400">{error}</div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-gray-800 dark:prose-headings:text-slate-200 prose-p:text-gray-700 dark:prose-p:text-slate-300 prose-strong:text-gray-800 dark:prose-strong:text-slate-200">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="about-help-heading text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4 pb-2 border-b border-gray-200 dark:border-slate-600">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="about-help-heading text-xl md:text-2xl font-bold text-gray-800 dark:text-slate-200 mb-3 mt-6 flex items-center gap-2">
                      <div className="about-help-accent w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-full" />
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="about-help-heading text-lg md:text-xl font-semibold text-gray-800 dark:text-slate-200 mb-2 mt-4 flex items-center gap-2">
                      <div className="about-help-accent w-1.5 h-5 bg-gradient-to-b from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 rounded-full" />
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2 my-4 list-disc list-inside">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="about-help-text text-gray-700 dark:text-slate-300">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="about-help-heading font-semibold text-gray-800 dark:text-slate-200 px-0.5">
                      {children}
                    </strong>
                  ),
                  p: ({ children }) => (
                    <p className="about-help-text text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
                      {children}
                    </p>
                  ),
                  hr: () => (
                    <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-500 to-transparent" />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        {lastUpdated && (
          <div className="about-help-footer mt-4 flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span>آخرین بروزرسانی: {new Date(lastUpdated).toLocaleDateString('fa-IR')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AboutPage


