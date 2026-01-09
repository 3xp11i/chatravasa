export const useNumberLocalization = () => {
  const { locale } = useI18n()

  // Hindi numerals mapping
  const hindiNumerals: Record<string, string> = {
    '0': '०',
    '1': '१',
    '2': '२',
    '3': '३',
    '4': '४',
    '5': '५',
    '6': '६',
    '7': '७',
    '8': '८',
    '9': '९'
  }

  /**
   * Converts English numerals to Hindi numerals if current locale is Hindi
   * @param input - Number or string to convert
   * @returns Converted string with Hindi numerals if locale is 'hi', otherwise original input
   */
  const localizeNumber = (input: number | string): string => {
    if (locale.value !== 'hi') {
      return String(input)
    }

    const inputStr = String(input)
    return inputStr.split('').map(char => {
      return hindiNumerals[char] || char
    }).join('')
  }

  return {
    localizeNumber
  }
}