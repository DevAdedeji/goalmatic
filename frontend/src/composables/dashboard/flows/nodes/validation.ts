export const isValidScheduleDateTime = (date: string, time: string, timezone?: string): { valid: boolean; message?: string } => {
  if (!date || !time) {
    return { valid: false, message: 'Date and time are required' }
  }

  if (!timezone) {
    return { valid: false, message: 'Timezone is required' }
  }

  const now = new Date()
  const scheduledDateTime = new Date(`${date}T${time}`)

  // Add 5 minutes to current time to get minimum valid time
  const minValidTime = new Date(now.getTime() + 5 * 60 * 1000)

  if (scheduledDateTime < minValidTime) {
    return {
      valid: false,
      message: 'Schedule time must be at least 5 minutes in the future'
    }
  }

  return { valid: true }
}

// Get a default date value for today in YYYY-MM-DD format
export const getDefaultDateValue = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Get a default time value that's 30 minutes in the future
export const getDefaultTimeValue = (): string => {
  const now = new Date()
  // Add 30 minutes to current time
  const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000)

  // Format as HH:MM
  const hours = thirtyMinutesLater.getHours().toString().padStart(2, '0')
  const minutes = thirtyMinutesLater.getMinutes().toString().padStart(2, '0')

  return `${hours}:${minutes}`
}

// Custom validate function for Date property
export const validateScheduleDate = (value: any, formValues: Record<string, any>): { valid: boolean; message?: string } => {
  // If we don't have both date and time, we can't fully validate yet
  if (!value || !formValues.Time) {
    return { valid: true } // Basic validation will catch required fields
  }

  return isValidScheduleDateTime(value, formValues.Time, formValues.Timezone)
}

// Custom validate function for Time property
export const validateScheduleTime = (value: any, formValues: Record<string, any>): { valid: boolean; message?: string } => {
  // If we don't have both date and time, we can't fully validate yet
  if (!value || !formValues.Date) {
    return { valid: true } // Basic validation will catch required fields
  }

  return isValidScheduleDateTime(formValues.Date, value, formValues.Timezone)
}
