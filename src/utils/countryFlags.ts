import pakistan from '@/assets/country-flags/Pakistan.png'
import bangladesh from '@/assets/country-flags/Bangladesh.png'
import nepal from '@/assets/country-flags/Nepal.png'

const flags: Record<string, string> = {
  'Pakistan': pakistan.src,
  'Bangladesh': bangladesh.src,
  'Nepal': nepal.src,
}

export const countryFlag = (country: string) => flags[country]