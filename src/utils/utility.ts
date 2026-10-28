export function isValidJavaInteger(value: string) {
  let num = Number(value) // Convert string to number
  return Number.isInteger(num) && num >= -2147483648 && num <= 2147483647
}

export function isValidHundredRange(value: string) {
  let num = Number(value) // Convert string to number
  return Number.isInteger(num) && num <= 100
}

export function isDateRangeWithinMonths(startDate: string, endDate: string, maxMonths = 3) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Extract year, month, and day
  const year1 = start.getFullYear()
  const month1 = start.getMonth() + 1 // Months are 0-based
  const day1 = start.getDate()

  const year2 = end.getFullYear()
  const month2 = end.getMonth() + 1
  const day2 = end.getDate()

  // Calculate month difference
  const totalMonths = year2 * 12 + month2 - (year1 * 12 + month1)

  // If the difference is greater than the allowed months, return false
  if (totalMonths > maxMonths) return false

  // If the month difference is exactly the allowed months, check days
  if (totalMonths === maxMonths) {
    return day2 <= day1 // Ensure the end day is not beyond the start day
  }

  return true // Within range
}

export function isValidEmail(email: string) {
  try {
    const validTLDs = ['com', 'org', 'net', 'edu', 'gov', 'io', 'dev', 'pk']

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/

    const hasValidStructure = emailRegex.test(email)

    const hasConsecutiveDots = email.includes('..')

    const domainParts = email.split('@')[1]?.split('.') || []
    const isExcessiveTLD = domainParts.filter((part) => validTLDs.includes(part.toLowerCase())).length > 2

    const isValid = hasValidStructure && !hasConsecutiveDots && !isExcessiveTLD

    return isValid
  } catch (error) {
    return false
  }
}
