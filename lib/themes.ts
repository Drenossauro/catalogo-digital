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
  // --- Inspirado em Vivara: branco puro, ouro quente, tipografia refinada
  {
    id: 'prata',
    name: 'Cristal Branco',
    bg: '#FFFFFF',
    navBg: 'rgba(255,255,255,0.96)',
    text: '#0E0E0E',
    textMuted: 'rgba(14,14,14,0.48)',
    textFaint: 'rgba(14,14,14,0.20)',
    accent: '#B5883E',
    surface: '#F5F3F0',
    border: 'rgba(0,0,0,0.07)',
    fontSerif: 'var(--font-playfair)',
    fontSans: 'var(--font-raleway)',
  },
  // --- Inspirado em Boticário: verde floresta suave, refrescante
  {
    id: 'sage',
    name: 'Natura Verde',
    bg: '#F5F9F4',
    navBg: 'rgba(245,249,244,0.96)',
    text: '#1C3020',
    textMuted: 'rgba(28,48,32,0.50)',
    textFaint: 'rgba(28,48,32,0.22)',
    accent: '#3E6B47',
    surface: '#E6EFE4',
    border: 'rgba(28,48,32,0.08)',
    fontSerif: 'var(--font-cormorant)',
    fontSans: 'var(--font-jost)',
  },
  // --- Inspirado em Eudora: rosê dourado, feminino e sofisticado
  {
    id: 'blush',
    name: 'Rosê Dourado',
    bg: '#FBF7F5',
    navBg: 'rgba(251,247,245,0.96)',
    text: '#2E1810',
    textMuted: 'rgba(46,24,16,0.50)',
    textFaint: 'rgba(46,24,16,0.22)',
    accent: '#C07B58',
    surface: '#F2EAE5',
    border: 'rgba(46,24,16,0.08)',
    fontSerif: 'var(--font-cormorant)',
    fontSans: 'var(--font-raleway)',
  },
  // --- Dark luxury: preto profundo, creme e ouro
  {
    id: 'noir',
    name: 'Noir Absoluto',
    bg: '#0A0A0A',
    navBg: 'rgba(10,10,10,0.97)',
    text: '#F0EBE0',
    textMuted: 'rgba(240,235,224,0.52)',
    textFaint: 'rgba(240,235,224,0.25)',
    accent: '#C9A84C',
    surface: '#161616',
    border: 'rgba(255,255,255,0.08)',
    fontSerif: 'var(--font-playfair)',
    fontSans: 'var(--font-raleway)',
  },
  // --- Dark navy premium: safira profunda e ouro
  {
    id: 'safira',
    name: 'Safira Noturna',
    bg: '#0C1925',
    navBg: 'rgba(12,25,37,0.97)',
    text: '#EDF0F5',
    textMuted: 'rgba(237,240,245,0.50)',
    textFaint: 'rgba(237,240,245,0.25)',
    accent: '#C8A84E',
    surface: '#14253A',
    border: 'rgba(255,255,255,0.09)',
    fontSerif: 'var(--font-playfair)',
    fontSans: 'var(--font-raleway)',
  },
  // --- Âmbar quente: terracota refinada
  {
    id: 'terracota',
    name: 'Âmbar',
    bg: '#FAF4EE',
    navBg: 'rgba(250,244,238,0.96)',
    text: '#3A1E0E',
    textMuted: 'rgba(58,30,14,0.50)',
    textFaint: 'rgba(58,30,14,0.22)',
    accent: '#C06E3A',
    surface: '#F0E2D4',
    border: 'rgba(58,30,14,0.08)',
    fontSerif: 'var(--font-dm-serif)',
    fontSans: 'var(--font-dm-sans)',
  },
  // --- Ametista: violeta suave e elegante
  {
    id: 'lavanda',
    name: 'Ametista',
    bg: '#F6F4FB',
    navBg: 'rgba(246,244,251,0.96)',
    text: '#2A1E4A',
    textMuted: 'rgba(42,30,74,0.50)',
    textFaint: 'rgba(42,30,74,0.22)',
    accent: '#7B5EC7',
    surface: '#EAE5F5',
    border: 'rgba(42,30,74,0.09)',
    fontSerif: 'var(--font-cormorant)',
    fontSans: 'var(--font-jost)',
  },
  // --- Creme & Ouro: clássico e atemporal
  {
    id: 'areia',
    name: 'Creme & Ouro',
    bg: '#F8F4ED',
    navBg: 'rgba(248,244,237,0.96)',
    text: '#3A2C1E',
    textMuted: 'rgba(58,44,30,0.50)',
    textFaint: 'rgba(58,44,30,0.22)',
    accent: '#A88245',
    surface: '#EDE4D5',
    border: 'rgba(58,44,30,0.09)',
    fontSerif: 'var(--font-dm-serif)',
    fontSans: 'var(--font-jost)',
  },
]

export function getTheme(id: string): ThemeConfig {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
