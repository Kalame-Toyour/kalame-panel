import { useCallback } from 'react'

interface UseNumericInputOptions {
  maxLength?: number
  allowDecimal?: boolean
  allowNegative?: boolean
}

export function useNumericInput(options: UseNumericInputOptions = {}) {
  const { maxLength, allowDecimal = false, allowNegative = false } = options

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement
    const cursorPosition = target.selectionStart || 0
    const value = target.value

    // جلوگیری از عملکرد دکمه Backspace کیبرد گوشی وقتی cursor در ابتدای فیلد است
    if (e.key === 'Backspace' && cursorPosition === 0) {
      e.preventDefault()
      return
    }

    // کلیدهای مجاز
    const allowedKeys = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown'
    ]

    // اضافه کردن کلیدهای اختیاری
    if (allowDecimal) {
      allowedKeys.push('.', ',')
    }
    if (allowNegative) {
      allowedKeys.push('-')
    }

    // اگر کلید مجاز نیست، از عملکرد آن جلوگیری کن
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault()
      return
    }

    // بررسی محدودیت‌های خاص
    if (e.key === '.' || e.key === ',') {
      // فقط یک نقطه اعشار مجاز است
      if (value.includes('.') || value.includes(',')) {
        e.preventDefault()
        return
      }
    }

    if (e.key === '-') {
      // منفی فقط در ابتدای فیلد مجاز است
      if (cursorPosition !== 0) {
        e.preventDefault()
        return
      }
    }

    // بررسی محدودیت طول
    if (maxLength && value.length >= maxLength && !['Backspace', 'Delete'].includes(e.key)) {
      e.preventDefault()
      return
    }
  }, [maxLength, allowDecimal, allowNegative])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setValue: (value: string) => void) => {
    let newValue = e.target.value

    // حذف کاراکترهای غیرمجاز
    if (allowDecimal && allowNegative) {
      newValue = newValue.replace(/[^0-9.-]/g, '')
    } else if (allowDecimal) {
      newValue = newValue.replace(/[^0-9.]/g, '')
    } else if (allowNegative) {
      newValue = newValue.replace(/[^0-9-]/g, '')
    } else {
      newValue = newValue.replace(/[^0-9]/g, '')
    }

    // بررسی محدودیت طول
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength)
    }

    setValue(newValue)
  }, [maxLength, allowDecimal, allowNegative])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>, setValue: (value: string) => void) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    
    let cleanValue = pastedText

    // حذف کاراکترهای غیرمجاز
    if (allowDecimal && allowNegative) {
      cleanValue = cleanValue.replace(/[^0-9.-]/g, '')
    } else if (allowDecimal) {
      cleanValue = cleanValue.replace(/[^0-9.]/g, '')
    } else if (allowNegative) {
      cleanValue = cleanValue.replace(/[^0-9-]/g, '')
    } else {
      cleanValue = cleanValue.replace(/[^0-9]/g, '')
    }

    // بررسی محدودیت طول
    if (maxLength && cleanValue.length > maxLength) {
      cleanValue = cleanValue.slice(0, maxLength)
    }

    setValue(cleanValue)
  }, [maxLength, allowDecimal, allowNegative])

  return {
    handleKeyDown,
    handleChange,
    handlePaste
  }
}
