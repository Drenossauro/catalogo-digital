'use client'

import { createContext, useContext } from 'react'
import { THEMES, type ThemeConfig } from '@/lib/themes'

const ThemeContext = createContext<ThemeConfig>(THEMES[0])

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ theme, children }: { theme: ThemeConfig; children: React.ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}
