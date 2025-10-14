import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, Bot, Search, Brain, Lock } from 'lucide-react'
import { Button } from './ui/button'
import { useLocale } from 'next-intl'
import { PremiumUpgradeModal } from './PremiumUpgradeModal'
import { isUserPremium } from '@/utils/premiumUtils'
import { useUserInfoContext } from '../contexts/UserInfoContext'
import { useDynamicContent } from '@/utils/dynamicContent'

export interface ModelCapabilities {
  streaming: boolean
  webSearch: boolean
  reasoning: boolean
  vision: boolean
  code: boolean
  fileUpload: boolean
}

export interface ModelFeatures {
  maxTokens: number
  contextLength: number
  temperature: number
  supportsStreaming: boolean
  supportsWebSearch: boolean
  supportsReasoning: boolean
}

export interface LanguageModel {
  name: string
  shortName: string
  icon?: string
  tokenCost?: number
  provider?: string
  modelPath?: string
  capabilities?: ModelCapabilities
  features?: ModelFeatures
  type?: 'text' | 'image' | string
  supportedSizes?: string[]
  description?: string
  accessLevel?: 'full' | 'limited' | 'premium'
}

export interface ModelCategory {
  name: string
  models: LanguageModel[]
}

export interface ModelsResponse {
  models: {
    language: ModelCategory
    image: ModelCategory
    audio: ModelCategory
  }
}

interface ModelDropdownProps {
  selectedModel: LanguageModel | null
  setSelectedModel: (model: LanguageModel | null) => void
  className?: string
  models: LanguageModel[]
  loading: boolean
  title?: string
  mode?: 'text' | 'image'
}

const DEFAULT_ICON = <Bot size={18} />


export function ModelDropdown({ selectedModel, setSelectedModel, className, models, loading, title, mode = 'text' }: ModelDropdownProps) {
  const locale = useLocale()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPremiumModel, setSelectedPremiumModel] = useState<LanguageModel | null>(null)
  const { localUserInfo } = useUserInfoContext()
  const isPremiumUser = localUserInfo ? isUserPremium(localUserInfo) : false
  const content = useDynamicContent()

  // Handle model selection with premium check
  const handleModelSelect = (model: LanguageModel) => {
    if (model.accessLevel === 'premium' && !isPremiumUser) {
      setSelectedPremiumModel(model)
      setShowUpgradeModal(true)
      setShowDropdown(false)
      return
    }
    
    console.log('ModelDropdown - Model selected:', {
      modelName: model.name,
      modelShortName: model.shortName,
      previousModel: selectedModel?.name
    });
    
    setSelectedModel(model)
    setShowDropdown(false)
  }

  // Check if a model is accessible to the current user
  const isModelAccessible = useCallback((model: LanguageModel) => {
    if (!model.accessLevel || model.accessLevel === 'full') return true
    if (model.accessLevel === 'limited') return true
    if (model.accessLevel === 'premium') return isPremiumUser
    return true
  }, [isPremiumUser])

  // اگر selectedModel مقدار نداشت یا مدل انتخابی وجود نداشت، اولین مدل قابل دسترس را انتخاب کن
  useEffect(() => {
    if (models.length > 0) {
      // فقط اگر selectedModel وجود نداشته باشد یا در لیست مدل‌های موجود نباشد، آن را تغییر دهیم
      if (!selectedModel || !models.some(m => m.name === selectedModel.name)) {
        // پیدا کردن اولین مدل قابل دسترس
        const accessibleModel = models.find(model => isModelAccessible(model))
        setSelectedModel(accessibleModel || models[0] || null)
      }
    }
  }, [models, setSelectedModel, isPremiumUser, isModelAccessible, selectedModel]) // selectedModel را از dependency array حذف کردم تا از override شدن جلوگیری شود


  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  const selectedModelObj = selectedModel || { name: 'GPT-4', shortName: 'gpt4' };

  // Group models by provider for better organization (only when not in image mode)
  const groupedModels = mode !== 'image' ? models.reduce((acc, model) => {
    const provider = model.provider || 'other'
    if (!acc[provider]) {
      acc[provider] = []
    }
    acc[provider].push(model)
    return acc
  }, {} as Record<string, LanguageModel[]>) : null

  const providerNames = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    'x-ai': 'X AI',
    deepseek: 'DeepSeek',
    'meta-llama': 'Meta Llama',
    mistralai: 'Mistral AI',
    midjourney: 'Midjourney',
    'stability-ai': 'Stability AI',
    meta: 'Meta',
    other: 'Other'
  }

  return (
    <div ref={dropdownRef} className={`relative ${className || ''}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`rounded-full px-2 py-0 md:py-1 flex items-center gap-2 font-bold min-w-[160px] sm:min-w-[180px] md:min-w-[220px] max-w-full sm:max-w-xl whitespace-nowrap bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm transition-all w-full justify-between ${
          content.brandName === 'کلمه'
            ? 'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 focus:ring-2 focus:ring-blue-400'
            : 'hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:text-purple-200 focus:ring-2 focus:ring-purple-400'
        }`}
        onClick={() => setShowDropdown(v => !v)}
        aria-label={locale === 'fa' ? 'انتخاب مدل هوش مصنوعی' : 'Select AI model'}
      >
        {loading ? (
          <>
            <span className="text-sm font-bold truncate max-w-[100px] sm:max-w-[180px]">در حال دریافت مدل ها</span>
            <span className="animate-spin">⏳</span>
          </>
        ) : (
          <>
            {selectedModelObj?.icon ? (
              <img src={selectedModelObj.icon} alt="icon" className="w-5 h-5 object-contain" />
            ) : DEFAULT_ICON}
            <span className="text-sm font-bold truncate max-w-[140px] sm:max-w-[180px]">{selectedModelObj?.name || 'انتخاب مدل'}</span>
            <span className="transition-transform duration-300" style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <ChevronDown size={16} />
            </span>
          </>
        )}
      </Button>
      {showDropdown && (
        <div
          className={`absolute z-30 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl top-full animate-fade-in
            left-1/2 -translate-x-1/2 md:right-0 md:translate-x-0`}
          style={{ 
            minWidth: '280px', 
            maxWidth: 'calc(100vw - 2rem)',
            width: 'min(400px, calc(100vw - 2rem))',
            maxHeight: 'calc(100vh - 2rem)',
            overflowY: 'auto'
          }}
        >
          <div className="px-3 md:px-4 py-1 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title ?? (locale === 'fa' ? 'مدل پاسخگویی را انتخاب کنید' : 'Select Response Model')}</h3>
          </div>
          <div className="py-1 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-3 md:px-4 py-2 text-gray-400">{locale === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}</div>
            ) : models.length === 0 ? (
              <div className="px-3 md:px-4 py-2 text-gray-400">{locale === 'fa' ? 'مدلی یافت نشد' : 'No models found'}</div>
            ) : mode === 'image' ? (
              // Simple list for image mode (no provider grouping)
              models.map((model) => {
                const isAccessible = isModelAccessible(model)
                const isPremium = model.accessLevel === 'premium'
                
                return (
                <div
                  key={model.shortName}
                  className={`p-3 md:p-4 transition-all duration-200 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 relative group ${
                    selectedModel?.name === model.name 
                      ? content.brandName === 'کلمه'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                        : 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500'
                      : ''
                  } ${!isAccessible ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                  onClick={() => handleModelSelect(model)}
                >
                  {/* Premium Badge for locked models */}
                  {isPremium && !isPremiumUser && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg border border-yellow-300 dark:border-yellow-600">
                      <Lock className="w-3 h-3 text-white" />
                      <span className="text-xs font-bold text-white">پریمیوم</span>
                    </div>
                  )}
                  
                  {/* Premium overlay effect */}
                  {isPremium && !isPremiumUser && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/30 to-orange-50/30 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-lg pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10 rounded-lg pointer-events-none animate-pulse" />
                    </>
                  )}
                  {/* Enhanced Model Row with larger icons */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Larger Icon */}
                    {model.icon ? (
                      <img src={model.icon} alt="icon" className="w-10 h-10 object-contain rounded-lg flex-shrink-0 bg-white dark:bg-gray-800 p-1 shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Bot size={20} />
                      </div>
                    )}
                    
                    {/* Model Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm md:text-base font-bold truncate ${
                          isPremium && !isPremiumUser 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {model.name}
                        </span>
                        {isPremium && !isPremiumUser && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                            🔒
                          </span>
                        )}
                      </div>
                      
                      {/* Description for image mode */}
                      {model.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{model.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                )
              })
            ) : (
              // Grouped by provider for text mode
              groupedModels && Object.entries(groupedModels).map(([provider, providerModels]) => (
                <div key={provider} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  {/* Provider Header */}
                  <div className="px-3 md:px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide truncate">
                      {providerNames[provider as keyof typeof providerNames] || provider}
                    </h4>
                  </div>
                  
                  {/* Provider Models */}
                  {providerModels.map((model) => {
                    const isAccessible = isModelAccessible(model)
                    const isPremium = model.accessLevel === 'premium'
                    
                    return (
                    <div
                      key={model.shortName}
                      className={`p-3 md:p-4 transition-all duration-200 cursor-pointer relative group ${
                        selectedModel?.name === model.name 
                          ? content.brandName === 'کلمه'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                            : 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500'
                          : ''
                      } ${!isAccessible ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                      onClick={() => handleModelSelect(model)}
                    >
                      {/* Premium Badge for locked models */}
                      {isPremium && !isPremiumUser && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg border border-yellow-300 dark:border-yellow-600">
                          <Lock className="w-3 h-3 text-white" />
                          <span className="text-[10px] font-bold text-white">پیشرفته</span>
                        </div>
                      )}
                        
                      {/* Premium overlay effect */}
                      {isPremium && !isPremiumUser && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/30 to-orange-50/30 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-lg pointer-events-none" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10 rounded-lg pointer-events-none animate-pulse" />
                        </>
                      )}
                      {/* Enhanced Model Row with larger icons */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Larger Icon */}
                        {model.icon ? (
                          <img src={model.icon} alt="icon" className="w-10 h-10 object-contain rounded-lg flex-shrink-0 bg-white dark:bg-gray-800 p-1 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Bot size={20} />
                          </div>
                        )}
                        
                        {/* Model Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm md:text-base font-bold truncate ${
                              isPremium && !isPremiumUser 
                                ? 'text-gray-600 dark:text-gray-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {model.name}
                            </span>
                            {isPremium && !isPremiumUser && (
                              <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                                🔒
                              </span>
                            )}
                            <div className="flex gap-1">
                              {model.features?.supportsWebSearch && (
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                  content.brandName === 'کلمه'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                }`}>
                                  <Search size={10} />
                                  <span className="text-[10px]">جست‌وجو</span>
                                </span>
                              )}
                              {model.features?.supportsReasoning && (
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                  content.brandName === 'کلمه'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                }`}>
                                  <Brain size={10} />
                                  <span className="text-[10px]">استدلال</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false)
          setSelectedPremiumModel(null)
        }}
        modelName={selectedPremiumModel?.name}
        mode={mode}
      />
    </div>
  )
} 