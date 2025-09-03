'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Clock, CreditCard, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import fetchWithAuth from '../components/utils/fetchWithAuth'

interface Transaction {
  id: number
  packageId: number
  packageTitle: string
  amount: number
  tokenNumber: number
  packagePrice: number
  code: string
  trackId: string
  status: string
  statusText: string
  gatewayStatus: number
  gatewayStatusText: string
  refNumber: string
  cardNumber: string
  paidAt: string
  createdAt: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface TransactionsData {
  transactions: Transaction[]
  pagination: Pagination
}

function TransactionsPage() {
  const [transactionsData, setTransactionsData] = useState<TransactionsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const hasLoadedRef = useRef(false)

  const fetchTransactions = useCallback(async (page: number) => {
    if (!user?.id) return
    
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchWithAuth(`/api/transactions?userId=${user.id}&page=${page}&limit=10`)
      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات')
      }
      const data = await response.json()
      if (data.success) {
        setTransactionsData(data.data)
        setCurrentPage(page)
      } else {
        throw new Error(data.error || 'خطای نامشخص')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای نامشخص')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Initial data load effect
  useEffect(() => {
    if (!isAuthLoading && user?.id && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      fetchTransactions(1)
    } else if (!isAuthLoading && !user) {
      router.push('/auth')
    }
  }, [user?.id, isAuthLoading, router, fetchTransactions])

  const handleGoBack = () => {
    router.back()
  }

  const handlePageChange = (page: number) => {
    fetchTransactions(page)
  }

  const getStatusIcon = (status: string, gatewayStatus: number) => {
    if (status === 'verify' && gatewayStatus === 1) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (status === 'error' || gatewayStatus === 0) {
      return <XCircle className="w-5 h-5 text-red-500" />
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string, gatewayStatus: number) => {
    if (status === 'verify' && gatewayStatus === 1) {
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
    } else if (status === 'error' || gatewayStatus === 0) {
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
    } else {
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
            <div className="h-12 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
            <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Content Skeleton */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
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
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 animate-fade-in">
              لیست تراکنش‌ها
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-fade-in delay-200">
              تاریخچه کامل خریدها و پرداخت‌های شما
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl m-2 md:m-10 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in delay-500">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-cyan-500/10 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">تراکنش‌های من</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transactionsData?.pagination.totalItems ? `${formatNumber(transactionsData.pagination.totalItems)} تراکنش` : 'بدون تراکنش'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {transactionsData?.transactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">هیچ تراکنشی یافت نشد</h3>
                <p className="text-gray-500 dark:text-gray-500">شما تا کنون هیچ خریدی انجام نداده‌اید</p>
              </div>
            ) : (
              <>
                {/* Transactions List */}
                <div className="space-y-4 mb-8">
                  {transactionsData?.transactions.map((transaction) => (
                    <div key={transaction.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status, transaction.gatewayStatus)}
                          <div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{transaction.packageTitle}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">کد تراکنش: {transaction.code}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status, transaction.gatewayStatus)}`}>
                          {transaction.statusText}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">مبلغ:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{formatNumber(transaction.amount)} تومان</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">توکن:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{formatNumber(transaction.tokenNumber)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">کارت:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{transaction.cardNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(transaction.paidAt || transaction.createdAt)}</span>
                        </div>
                        {transaction.refNumber && (
                          <span>شماره مرجع: {transaction.refNumber}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {transactionsData && transactionsData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!transactionsData.pagination.hasPrevPage}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                      قبلی
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, transactionsData.pagination.totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg transition-all ${
                              page === currentPage
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {formatNumber(page)}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!transactionsData.pagination.hasNextPage}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      بعدی
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
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

export default TransactionsPage
