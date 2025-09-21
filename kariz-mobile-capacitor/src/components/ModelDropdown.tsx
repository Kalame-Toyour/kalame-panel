import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Bot, Search, Brain, Lock } from 'lucide-react';
import { useUserInfoContext } from '../contexts/UserInfoContext';
import { PremiumUpgradeModal } from './PremiumUpgradeModal';

export interface ModelCapabilities {
  streaming: boolean;
  webSearch: boolean;
  reasoning: boolean;
  vision: boolean;
  code: boolean;
  fileUpload: boolean;
}

export interface ModelFeatures {
  maxTokens: number;
  contextLength: number;
  temperature: number;
  supportsStreaming: boolean;
  supportsWebSearch: boolean;
  supportsReasoning: boolean;
}

export interface LanguageModel {
  name: string;
  shortName: string;
  icon?: string;
  tokenCost?: number;
  provider?: string;
  modelPath?: string;
  capabilities?: ModelCapabilities;
  features?: ModelFeatures;
  type?: 'text' | 'image' | string;
  supportedSizes?: string[];
  description?: string;
  accessLevel?: 'full' | 'limited' | 'premium';
}

export interface ModelCategory {
  name: string;
  models: LanguageModel[];
}

export interface ModelsResponse {
  models: {
    language: ModelCategory;
    image: ModelCategory;
    audio: ModelCategory;
  };
}

interface ModelDropdownProps {
  selectedModel: LanguageModel | null;
  setSelectedModel: (model: LanguageModel | null) => void;
  className?: string;
  models: LanguageModel[];
  loading: boolean;
  title?: string;
  mode?: 'text' | 'image';
}

const DEFAULT_ICON = <Bot size={18} />;

export function ModelDropdown({ 
  selectedModel, 
  setSelectedModel, 
  className, 
  models, 
  loading,
  title,
  mode = 'text'
}: ModelDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [lockedModelName, setLockedModelName] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { localUserInfo } = useUserInfoContext();

  // Check if a model is premium and user is free
  const isModelLocked = useCallback((model: LanguageModel) => {
    if (!localUserInfo) return false;
    if (localUserInfo.userType !== 'free') return false;
    
    // Use access_level from API data to determine if model is locked
    // Only lock models with accessLevel === 'premium'
    if (model.accessLevel === 'premium') {
      return true;
    }
    
    // If accessLevel is 'full' or 'limited', allow access for free users
    if (model.accessLevel === 'full' || model.accessLevel === 'limited') {
      return false;
    }
    
    // Fallback to name patterns only if accessLevel is not provided
    if (!model.accessLevel) {
      const premiumPatterns = [
        'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini',
        'claude-3', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku',
        'gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash',
        'llama-3', 'llama-3.1', 'llama-3.2',
        'midjourney', 'dall-e-3', 'stable-diffusion'
      ];
      
      const modelName = model.name.toLowerCase();
      const shortName = model.shortName.toLowerCase();
      
      return premiumPatterns.some(pattern => 
        modelName.includes(pattern) || shortName.includes(pattern)
      );
    }
    
    // Default: allow access if accessLevel is not premium
    return false;
  }, [localUserInfo]);

  // Handle model selection with premium check
  const handleModelSelect = (model: LanguageModel) => {
    if (isModelLocked(model)) {
      setLockedModelName(model.name);
      setShowPremiumModal(true);
      setShowDropdown(false);
      return;
    }
    
    setSelectedModel(model);
    setShowDropdown(false);
  };

  // اگر selectedModel مقدار نداشت یا مدل انتخابی وجود نداشت، اولین مدل را انتخاب کن
  useEffect(() => {
    if (models.length > 0) {
      // اگر مدل انتخاب شده وجود ندارد یا در لیست مدل‌های موجود نیست
      if (!selectedModel || !models.some(m => m.name === selectedModel.name)) {
        // Find first non-locked model
        const availableModel = models.find(m => !isModelLocked(m)) || models[0];
        setSelectedModel(availableModel || null);
      }
    }
  }, [models, selectedModel, setSelectedModel, localUserInfo, isModelLocked]);

  // Group models by provider for better organization
  const groupedModels = models.reduce((acc, model) => {
    const provider = model.provider || 'other';
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, LanguageModel[]>);

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
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  const selectedModelObj = selectedModel || { name: 'GPT-4', shortName: 'gpt4' };

  return (
    <div ref={dropdownRef} className={`relative flex justify-center items-center w-full model-dropdown-container ${className || ''}`}>
      <button
        type="button"
        className={`rounded-full px-2 md:py-1 flex items-center gap-2 font-bold min-w-[170px] md:min-w-[170px] w-full whitespace-nowrap bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-200 focus:ring-2 focus:ring-blue-400 transition-all model-dropdown-button`}
        onClick={() => setShowDropdown(v => !v)}
        aria-label="انتخاب مدل هوش مصنوعی"
      >
        {loading ? (
          <>
            <span className="text-sm font-bold truncate flex-1 text-center">در حال دریافت مدل ها</span>
            <span className="animate-spin">⏳</span>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
              {selectedModelObj?.icon ? (
                <img src={selectedModelObj.icon} alt="icon" className="w-5 h-5 object-contain" />
              ) : DEFAULT_ICON}
            </div>
            <span className="text-sm font-bold truncate flex-1 text-center">{selectedModelObj?.name || 'انتخاب مدل'}</span>
            <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
              <span className="transition-transform duration-300" style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <ChevronDown size={16} />
              </span>
            </div>
          </>
        )}
      </button>
      
      {showDropdown && (
        <div
          className="absolute z-[250] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 shadow-2xl model-dropdown-content"
          style={{ minWidth: '280px' }}
        >
            <div className="px-3 md:px-4 py-3 border-b border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 text-right">{title || (mode === 'image' ? 'مدل تولید تصویر را انتخاب کنید' : 'مدل پاسخگویی را انتخاب کنید')}</h3>
            </div>
            <div className="py-1 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="px-3 md:px-4 py-2 text-gray-400 dark:text-gray-500 text-right">در حال بارگذاری...</div>
              ) : models.length === 0 ? (
                <div className="px-3 md:px-4 py-2 text-gray-400 dark:text-gray-500 text-right">مدلی یافت نشد</div>
              ) : mode === 'image' ? (
                // For image mode: show models without provider grouping and with descriptions
                models.map((model) => (
                  <div
                    key={model.shortName}
                    className={`model-dropdown-item p-2 md:p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                      selectedModel?.name === model.name ? 'selected bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500' : 'bg-transparent dark:bg-transparent'
                    } ${isModelLocked(model) ? 'opacity-60' : ''}`}
                    onClick={() => handleModelSelect(model)}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      {model.icon ? (
                        <img src={model.icon} alt="icon" className="w-6 h-6 object-contain rounded flex-shrink-0" />
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                          <Bot size={14} className="text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm md:text-base font-bold text-gray-900 dark:text-white w-full break-words text-right flex items-center gap-2">
                          {model.name}
                          {isModelLocked(model) && (
                            <Lock className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        {/* Show description for image models */}
                        {model.description && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right leading-tight">
                            {model.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // For text mode: show models with provider grouping and features
                Object.entries(groupedModels).map(([provider, providerModels]) => (
                  <div key={provider} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    {/* Provider Header */}
                    <div className="px-3 md:px-4 py-2 bg-gray-50 dark:bg-gray-800">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide truncate text-right">
                        {providerNames[provider as keyof typeof providerNames] || provider}
                      </h4>
                    </div>
                    
                    {/* Provider Models */}
                    {providerModels.map((model) => (
                      <div
                        key={model.shortName}
                        className={`model-dropdown-item p-2 md:p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                          selectedModel?.name === model.name ? 'selected bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500' : 'bg-transparent dark:bg-transparent'
                        } ${isModelLocked(model) ? 'opacity-60' : ''}`}
                        onClick={() => handleModelSelect(model)}
                      >
                        <div className="flex items-center gap-2 justify-center">
                          {model.icon ? (
                            <img src={model.icon} alt="icon" className="w-6 h-6 object-contain rounded flex-shrink-0" />
                          ) : (
                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                              <Bot size={14} className="text-gray-600 dark:text-gray-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm md:text-base font-bold text-gray-900 dark:text-white w-full break-words text-right flex items-center gap-2">
                              {model.name}
                              {isModelLocked(model) && (
                                <Lock className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            {/* Show features for text models */}
                            <div className="mt-1 flex items-center justify-start gap-2 w-full flex-wrap">
                              {model.features?.supportsReasoning && (
                                <span className="flex items-center gap-1 px-1 py-0.5 bg-purple-200 dark:bg-purple-900/40 text-purple-900 dark:text-purple-300 rounded text-xs font-medium border border-purple-400 dark:border-purple-700">
                                  <Brain size={10} />
                                  <span className="text-[10px]">استدلال</span>
                                </span>
                              )}
                              {model.features?.supportsWebSearch && (
                                <span className="flex items-center gap-1 px-1 py-0.5 bg-blue-200 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300 rounded text-xs font-medium border border-blue-400 dark:border-blue-700">
                                  <Search size={10} />
                                  <span className="text-[10px]">جست‌وجو</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      
      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        modelName={lockedModelName}
        mode={mode}
      />
    </div>
  );
}