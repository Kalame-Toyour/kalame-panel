import React, { useEffect, useState } from 'react'

interface PromptSuggestion {
  id: string
  title: string
  icon: string // now a URL
  prompt: string
  color: string // e.g. 'from-pink-400 to-fuchsia-500'
}

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void
}

// Helper to extract main color from gradient string (e.g. 'from-pink-400 to-fuchsia-500' => 'pink-400')
function extractMainColor(gradient: string) {
  const match = gradient.match(/from-([\w-]+)/)
  return match ? match[1] : 'blue-500'
}

// Tailwind safelist for dynamic colors:
// border-pink-400 border-fuchsia-500 border-green-400 border-blue-500 border-yellow-400 border-orange-400 border-purple-400 border-indigo-500 border-blue-400 border-cyan-400 border-emerald-400 border-lime-400

function PromptSuggestions({ onSelectPrompt }: PromptSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/prompt-suggestions')
      .then(res => res.json())
      .then(data => {
        setSuggestions(data.suggestions || [])
        setLoading(false)
      })
      .catch(() => {
        setError('خطا در دریافت پیشنهادها')
        setLoading(false)
      })
  }, [])

  if (loading) return null
  if (error) return <div className="text-red-500 text-sm text-center my-2">{error}</div>
  if (!suggestions.length) return null

  return (
    <div className="w-full flex flex-wrap justify-center gap-2 mt-4 animate-fade-in">
      {suggestions.map(({ id, title, icon, prompt, color }) => {
        const mainColor = extractMainColor(color)
        const borderClass = `border-${mainColor}`
        return (
          <button
            key={id}
            type="button"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 md:px-4 md:py-2 bg-white dark:bg-gray-900 border ${borderClass} shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-2 transition-all text-xs md:text-sm min-w-[90px] md:min-w-[120px] max-w-xs focus:ring-2 focus:ring-blue-400 focus:outline-none`}
            onClick={() => onSelectPrompt(prompt)}
            aria-label={title}
            style={{ borderWidth: 1.5 }}
          >
            <img src={icon} alt="" className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover drop-shadow" loading="lazy" />
            <span className="truncate md:text-sm text-xs font-bold text-gray-800 dark:text-gray-100">{title}</span>
          </button>
        )
      })}
    </div>
  )
}

export { PromptSuggestions } 