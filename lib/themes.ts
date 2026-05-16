export type ThemeConfig = {
  id: string
  name: string
  // colors (pre-computed with opacity where needed)
  bg: string
  navBg: string
  text: string
  textMuted: string
  textFaint: string
  accent: string
  surface: string
  border: string
  // font CSS variable references
  fontSerif: string
  fontSans: string
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'prata',
    name: 'Prata Clássico',
    bg: '#FAF8F5',
    navBg: 'rgba(250,248,245,0.92)',
    text: '#1a1a1a',
    textMuted: 'rgba(26,26,26,0.5)',
    textFaint: 'rgba(26,26,26,0.22)',
    accent: '#B8973A',
    surface: '#F0EDE8',
    border: 'rgba(0,0,0,0.08)',
    fontSerif: 'var(--font-cormorant)',
    fontSans: 'var(--font-jost)',
  },
  {
    id: 'noir',
    name: 'Noir Veludo',
    bg: '#111111',
    navBg: 'rgba(17,17,17,0.97)',
    text: '#F5F0E8',
    textMuted: 'rgba(245,240,232,0.55)',
    textFaint: 'rgba(245,240,232,0.28)',
    accent: '#C4A962',
    surface: '#1E1E1E',
    border: 'rgba(255,255,255,0.1)',
    fontSerif: 'var(--font-playfair)',
    fontSans: 'var(--font-raleway)',
  },
  {
    id: 'blush',
    name: 'Blush Rosé',
    bg: '#FDF5F5',
    navBg: 'rgba(253,245,245,0.92)',
    text: '#4A1428',
    textMuted: 'rgba(74,20,40,0.55)',
    textFaint: 'rgba(74,20,40,0.28)',
    accent: '#C49BAC',
    surface: '#F7E8EC',
    border: 'rgba(74,20,40,0.1)',
    fontSerif: 'var(--font-cormorant)',
    fontSans: 'var(--font-dm-sans)',
  },
  {
    id: 'sage',
    name: 'Sage Natural',
    bg: '#F2F5F0',
    navBg: 'rgba(242,245,240,0.92)',
    text: '#2A3D2A',
    textMuted: 'rgba(42,61,42,0.55)',
    textFaint: 'rgba(42,61,42,0.28)',
    accent: '#8A7A40',
    surface: '#E4EBE1',
    border: 'rgba(42,61,42,0.1)',
    fontSerif: 'var(--font-dm-serif)',
    fontSans: 'var(--font-jost)',
  },
  {
    id: 'safira',
    name: 'Azul Safira',
    bg: '#0D1B2A',
    navBg: 'rgba(13,27,42,0.97)',
    text: '#F5F0E8',
    textMuted: 'rgba(245,240,232,0.55)',
    textFaint: 'rgba(245,240,232,0.28)',
    accent: '#C9A84C',
    surface: '#152334',
    border: 'rgba(255,255,255,0.1)',
    fontSerif: 'var(--font-playfair)',
    fontSans: 'var(--font-raleway)',
  },
  {
    id: 'terracota',
    name: 'Terracota',
    bg: '#FAF4EE',
    navBg: 'rgba(250,244,238,0.92)',
    text: '#5C3020',
    textMuted: 'rgba(92,48,32,0.55)',
    textFaint: 'rgba(92,48,32,0.28)',
    accent: '#C76E45',
    surface: '#F0E5D8',
    border: 'rgba(92,48,32,0.1)',
    fontSerif: 'var(--font-dm-serif)',
    fontSans: 'var(--font-dm-sans)',
  },
  {
    id: 'lavanda',
    name: 'Lavanda',
    bg: '#F5F3FA',
    navBg: 'rgba(245,243,250,0.92)',
    text: '#3A2D5A',
    textMuted: 'rgba(58,45,90,0.55)',
    textFaint: 'rgba(58,45,90,0.28)',
    accent: '#8B74C7',
    surface: '#EAE6F5',
    border: 'rgba(58,45,90,0.1)',
    fontSerif: 'var(--font-cormorant)',
    fontSans: 'var(--font-jost)',
  },
  {
    id: 'areia',
    name: 'Areia Dourada',
    bg: '#F7F2EB',
    navBg: 'rgba(247,242,235,0.92)',
    text: '#4A3828',
    textMuted: 'rgba(74,56,40,0.55)',
    textFaint: 'rgba(74,56,40,0.28)',
    accent: '#A88B5A',
    surface: '#EDE5D8',
    border: 'rgba(74,56,40,0.1)',
    fontSerif: 'var(--font-dm-serif)',
    fontSans: 'var(--font-dm-sans)',
  },
]

export function getTheme(id: string): ThemeConfig {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
