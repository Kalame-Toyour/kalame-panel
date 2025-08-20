import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Bot, Search, Brain } from 'lucide-react'
import { Button } from './ui/button'
import { useLocale } from 'next-intl'

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

  // اگر selectedModel مقدار نداشت یا مدل انتخابی وجود نداشت، اولین مدل را انتخاب کن
  useEffect(() => {
    if (models.length > 0) {
      // اگر مدل انتخاب شده وجود ندارد یا در لیست مدل‌های موجود نیست
      if (!selectedModel || !models.some(m => m.name === selectedModel.name)) {
        setSelectedModel(models[0] || null)
      }
    }
  }, [models, setSelectedModel])

  // Group models by provider for better organization
  const groupedModels = models.reduce((acc, model) => {
    const provider = model.provider || 'other'
    if (!acc[provider]) {
      acc[provider] = []
    }
    acc[provider].push(model)
    return acc
  }, {} as Record<string, LanguageModel[]>)

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

  return (
    <div ref={dropdownRef} className={`relative ${className || ''}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`rounded-full px-2 py-0 md:py-2 flex items-center gap-2 font-bold min-w-[180px] md:min-w-[220px] max-w-xl whitespace-nowrap bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 focus:ring-2 focus:ring-blue-400 transition-all w-full justify-between`}
        onClick={() => setShowDropdown(v => !v)}
        aria-label={locale === 'fa' ? 'انتخاب مدل هوش مصنوعی' : 'Select AI model'}
      >
        {loading ? (
          <>
            <span className="text-sm font-bold truncate max-w-[180px]">در حال دریافت مدل ها</span>
            <span className="animate-spin">⏳</span>
          </>
        ) : (
          <>
            {selectedModelObj?.icon ? (
              <img src={selectedModelObj.icon} alt="icon" className="w-5 h-5 object-contain" />
            ) : DEFAULT_ICON}
            <span className="text-sm font-bold truncate max-w-[180px]">{selectedModelObj?.name || 'انتخاب مدل'}</span>
            <span className="transition-transform duration-300" style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <ChevronDown size={16} />
            </span>
          </>
        )}
      </Button>
      {showDropdown && (
        <div
          className={`absolute z-50 mt-2 w-[calc(100vw-2rem)] md:w-[400px] mx-auto md:mx-0 max-w-2xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl top-full animate-fade-in
            ${locale === 'fa' ? 'md:right-0 md:left-auto' : 'md:left-0'}
            left-1/2 -translate-x-1/2 md:translate-x-0`}
          style={{ minWidth: '280px', maxWidth: 'calc(100vw - 2rem)' }}
        >
          <div className="px-3 md:px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title ?? (locale === 'fa' ? 'مدل پاسخگویی را انتخاب کنید' : 'Select Response Model')}</h3>
          </div>
          <div className="py-1 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-3 md:px-4 py-2 text-gray-400">{locale === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}</div>
            ) : models.length === 0 ? (
              <div className="px-3 md:px-4 py-2 text-gray-400">{locale === 'fa' ? 'مدلی یافت نشد' : 'No models found'}</div>
            ) : (
              Object.entries(groupedModels).map(([provider, providerModels]) => (
                <div key={provider} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  {/* Provider Header */}
                  <div className="px-3 md:px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide truncate">
                      {providerNames[provider as keyof typeof providerNames] || provider}
                    </h4>
                  </div>
                  
                  {/* Provider Models */}
                  {providerModels.map((model) => (
                    <div
                      key={model.shortName}
                      className={`p-2 md:p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                        selectedModel?.name === model.name ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => {
                        setSelectedModel(model)
                        setShowDropdown(false)
                      }}
                    >
                      {/* Compact Model Row - 1 line: Name + Capabilities or Cost */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Icon */}
                        {model.icon ? (
                          <img src={model.icon} alt="icon" className="w-6 h-6 object-contain rounded flex-shrink-0" />
                        ) : (
                          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                            <Bot size={14} />
                          </div>
                        )}
                        {/* Model Name */}
                        <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white text-left">{model.name}</span>
                        {mode !== 'image' && (
                          <>
                            {model.features?.supportsWebSearch && (
                              <span className="flex items-center gap-1 px-0.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                <Search size={11} />
                                <span className="text-[10px]">جست‌وجو</span>
                              </span>
                            )}
                            {model.features?.supportsReasoning && (
                              <span className="flex items-center gap-1 px-0.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                                <Brain size={11} />
                                <span className="text-[10px]">استدلال</span>
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
} 