import { useAlert } from '@/composables/core/notification'

export const convertTo12HourFormat = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours < 12 ? 'AM' : 'PM'
  const adjustedHours = hours % 12 === 0 ? 12 : hours % 12
  return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export const convertObjWithRefToObj = (obj: Record<string, Ref>, ignoreKeys: string[] = []) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !ignoreKeys.includes(key)).map(([key, value]) => [key, value.value])
  )
}
const getOrdinalSuffix = (num: number): string => {
  const lastDigit = num % 10
  const lastTwoDigits = num % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th'
  } else if (lastDigit === 1) {
    return 'st'
  } else if (lastDigit === 2) {
    return 'nd'
  } else if (lastDigit === 3) {
    return 'rd'
  } else {
    return 'th'
  }
}

export const formatDate = (dateInput: string | number | Date | { seconds: number; nanoseconds?: number } | { toDate(): Date }, type?: 'dateInput'): string => {
  let date: Date

  // Handle different input types
  if (dateInput instanceof Date) {
    date = dateInput
  } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    date = new Date(dateInput)
    } else if (dateInput && typeof dateInput === 'object') {
    // Handle Firestore Timestamp objects (have toDate method)
    if ('toDate' in dateInput && typeof dateInput.toDate === 'function') {
      date = dateInput.toDate()
    } else if ('seconds' in dateInput && typeof dateInput.seconds === 'number') {
      // Handle plain Firestore timestamp objects with seconds/nanoseconds
      date = new Date(dateInput.seconds * 1000 + (dateInput.nanoseconds || 0) / 1000000)
    } else {
      date = new Date(dateInput as any)
    }
  } else {
    date = new Date()
  }

  // Validate the date
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const day = date.getDate()
  const ordinal = getOrdinalSuffix(day)
  const year = date.getFullYear()

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString() && !type) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString() && !type) {
    return 'Yesterday'
  } else {
    return `${day}${ordinal} ${month}, ${year}`
  }
}

export const formatDateTime = (
  dateInput: string | number | Date | { seconds: number; nanoseconds?: number } | { toDate(): Date }
): string => {
  let date: Date

  if (dateInput instanceof Date) {
    date = dateInput
  } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    date = new Date(dateInput)
  } else if (dateInput && typeof dateInput === 'object') {
    if ('toDate' in dateInput && typeof (dateInput as any).toDate === 'function') {
      date = (dateInput as any).toDate()
    } else if ('seconds' in dateInput && typeof (dateInput as any).seconds === 'number') {
      const ts = dateInput as { seconds: number; nanoseconds?: number }
      date = new Date(ts.seconds * 1000 + (ts.nanoseconds || 0) / 1000000)
    } else {
      date = new Date(dateInput as any)
    }
  } else {
    date = new Date()
  }

  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date)
}

export const formatDateTimeForInput = (date: Date): string => {
	const year = date.getFullYear()
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const day = date.getDate().toString().padStart(2, '0')
	const hours = date.getHours().toString().padStart(2, '0')
	const minutes = date.getMinutes().toString().padStart(2, '0')

	return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const truncateString = (input: string, maxChars = 80): string => {
  if (!input) return ''

  // Convert to array of characters to handle Unicode properly
  const chars = [...input]

  if (chars.length <= maxChars) {
    return input
  } else {
    return chars.slice(0, maxChars).join('') + '...'
  }
}

export const formatDateString = (dateStr: string, options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)

  if (isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export const validate_data = (data: Record<string, any>, ignoreKeys: string[] = []) => {
  const missingKeys: string[] = []

  const checkData = (data: Record<string, any>, parentKey = '') => {
    for (const key in data) {
      if (data.hasOwnProperty(key) && !ignoreKeys.includes(key)) {
        const value = data[key]
        const fullKey = parentKey ? `${parentKey}.${key}` : key
        if (!value) {
          missingKeys.push(fullKey)
        }
        if (typeof value === 'object' && value !== null) {
          checkData(value, fullKey)
        }
      }
    }
  }

  checkData(data)

  if (missingKeys.length > 0) {
    useAlert().openAlert({ type: 'ERROR', msg: `Error: ${missingKeys.join(', ')} are required` })
    return false
  }
  return true
}

export const transformString = (inputString: string): string => {
  const trimmedString = inputString.trim()
  const lowercaseString = trimmedString.toLowerCase()
  const transformedString = lowercaseString.replace(/ /g, '-')

  return transformedString
}

export const numberToString = (number: number): string => {
  switch (number) {
    case 1:
      return 'Once'
    case 2:
      return 'Twice'
    case 3:
      return 'Thrice'
    default:
      return `${number} times`
  }
}
interface TimeDuration {
  time: string; // e.g., "12:00"
  duration: number; // in minutes
}

export const isToday = (date: Date | string): boolean => {
  const today = new Date()
  const dateObj = new Date(date)
	return dateObj.getDate() === today.getDate() &&
		dateObj.getMonth() === today.getMonth() &&
		dateObj.getFullYear() === today.getFullYear()
}

export const capitalize = (text: string) => (text[0] ?? '').toUpperCase() + text.slice(1).toLowerCase()

export const formatTimeWithSeconds = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()
  const seconds = dateObj.getSeconds()
  const period = hours >= 12 ? 'PM' : 'AM'

  // Convert to 12-hour format
  const displayHours = hours % 12 || 12

  // Format with padding for minutes and seconds
  return `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`
}

