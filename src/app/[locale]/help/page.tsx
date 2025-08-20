'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Clock, BookOpen, MessageCircle, Image as ImageIcon, Mic, HeadphonesIcon, ExternalLink, Mail, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface HelpData {
  content: string
  lastUpdated: string
}

function HelpPage() {
  const [helpData, setHelpData] = useState<HelpData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        const response = await fetch('/api/help')
        if (!response.ok) {
          throw new Error('خطا در دریافت اطلاعات')
        }
        const data = await response.json()
        setHelpData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطای نامشخص')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHelpData()
  }, [])

  const handleGoBack = () => {
    router.back()
  }

  const filteredContent = helpData?.content || ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
            <div className="h-12 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
            <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Search Skeleton */}
          <div className="mb-8">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>

          {/* Content Skeleton */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="space-y-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">خطا در بارگذاری</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            بازگشت
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            <span className="font-medium">بازگشت</span>
          </button> */}
          
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 animate-fade-in">
              راهنمای کاربری
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-fade-in delay-200">
              آموزش کامل نحوه استفاده از تمام قابلیت‌های پلتفرم کلمه
            </p>
          </div>
        </div>

        {/* Search Bar */}
        {/* <div className="mb-8 animate-fade-in delay-300">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="جستجو در راهنما..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div> */}

        {/* Quick Access Cards */}
        {/* <div className="mb-8 animate-fade-in delay-400">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:scale-105 transition-all duration-200 cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">گفت‌وگوی هوشمند</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">نحوه چت با AI</p>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:scale-105 transition-all duration-200 cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">تولید تصویر</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">ساخت تصاویر AI</p>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:scale-105 transition-all duration-200 cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                  <Mic className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">متن به گفتار</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">تبدیل متن به صدا</p>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:scale-105 transition-all duration-200 cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                  <HeadphonesIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">گفتار به متن</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">تبدیل صدا به متن</p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl m-2 md:m-10 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in delay-500">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-cyan-500/10 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">راهنمای کامل</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">همه چیزی که باید بدانید</p>
                </div>
              </div>
              {/* {searchTerm && (
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  جستجو: "{searchTerm}"
                </div>
              )} */}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-gray-800 dark:prose-headings:text-gray-200 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-800 dark:prose-strong:text-gray-200 prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-a:text-green-600 dark:prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 mt-8 flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-emerald-500 rounded-full"></div>
                      {children}
                    </h4>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2 my-4">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-800 dark:text-gray-200 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 px-1 py-0.5 rounded">
                      {children}
                    </strong>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  hr: () => (
                    <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-r-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 my-4 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {filteredContent}
              </ReactMarkdown>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 via-green-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>آخرین بروزرسانی: {helpData?.lastUpdated ? new Date(helpData.lastUpdated).toLocaleDateString('fa-IR') : ''}</span>
              </div> */}
              <div className="flex items-center gap-4">
                <a
                  href="mailto:support@kalame.ai"
                  className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">پشتیبانی</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {/* <a
                  href="tel:+989123456789"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">تماس</span>
                  <ExternalLink className="w-3 h-3" />
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-400 {
          animation-delay: 400ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  )
}

export default HelpPage
