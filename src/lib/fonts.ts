import {
  Inter,
  Poppins,
  Nunito,
  Playfair_Display,
  Lora,
  Montserrat,
  Raleway,
  Open_Sans,
  Merriweather,
  Roboto,
} from 'next/font/google';

// =============================================================================
// Theme Font Definitions
// =============================================================================
// All fonts include 'latin-ext' subset for Turkish character support
// (ğ, ü, ş, ı, ö, ç, İ, Ğ, Ü, Ş, Ö, Ç).
// Each font is exported with a CSS variable for dynamic theme switching.
// =============================================================================

export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nunito',
  display: 'swap',
});

export const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-playfair',
  display: 'swap',
});

export const lora = Lora({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-lora',
  display: 'swap',
});

export const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const raleway = Raleway({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-raleway',
  display: 'swap',
});

export const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-opensans',
  display: 'swap',
});

export const merriweather = Merriweather({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-merriweather',
  display: 'swap',
  weight: ['400', '700'],
});

export const roboto = Roboto({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-roboto',
  display: 'swap',
  weight: ['400', '500', '700'],
});

// ---------------------------------------------------------------------------
// Theme Font Registry
// ---------------------------------------------------------------------------
// Used by the theme editor to display font options and apply them dynamically.
// ---------------------------------------------------------------------------

export interface ThemeFont {
  /** Unique key used in restaurant theme config */
  key: string;
  /** Display label shown in the theme editor */
  label: string;
  /** CSS variable name (e.g. '--font-inter') */
  variable: string;
  /** CSS class name for applying the font (from next/font) */
  className: string;
  /** Category for grouping in the editor */
  category: 'sans-serif' | 'serif' | 'display';
}

export const themeFonts: ThemeFont[] = [
  {
    key: 'inter',
    label: 'Inter',
    variable: '--font-inter',
    className: inter.className,
    category: 'sans-serif',
  },
  {
    key: 'poppins',
    label: 'Poppins',
    variable: '--font-poppins',
    className: poppins.className,
    category: 'sans-serif',
  },
  {
    key: 'nunito',
    label: 'Nunito',
    variable: '--font-nunito',
    className: nunito.className,
    category: 'sans-serif',
  },
  {
    key: 'montserrat',
    label: 'Montserrat',
    variable: '--font-montserrat',
    className: montserrat.className,
    category: 'sans-serif',
  },
  {
    key: 'raleway',
    label: 'Raleway',
    variable: '--font-raleway',
    className: raleway.className,
    category: 'sans-serif',
  },
  {
    key: 'opensans',
    label: 'Open Sans',
    variable: '--font-opensans',
    className: openSans.className,
    category: 'sans-serif',
  },
  {
    key: 'roboto',
    label: 'Roboto',
    variable: '--font-roboto',
    className: roboto.className,
    category: 'sans-serif',
  },
  {
    key: 'playfair',
    label: 'Playfair Display',
    variable: '--font-playfair',
    className: playfairDisplay.className,
    category: 'serif',
  },
  {
    key: 'lora',
    label: 'Lora',
    variable: '--font-lora',
    className: lora.className,
    category: 'serif',
  },
  {
    key: 'merriweather',
    label: 'Merriweather',
    variable: '--font-merriweather',
    className: merriweather.className,
    category: 'serif',
  },
];

// ---------------------------------------------------------------------------
// Utility: Build CSS variable classes string for applying all theme fonts
// ---------------------------------------------------------------------------
// Add this to the <html> or <body> className to make all font variables
// available via CSS. The active font is then set via the restaurant theme.
// ---------------------------------------------------------------------------

export const allFontVariables = [
  inter.variable,
  poppins.variable,
  nunito.variable,
  playfairDisplay.variable,
  lora.variable,
  montserrat.variable,
  raleway.variable,
  openSans.variable,
  merriweather.variable,
  roboto.variable,
].join(' ');

/**
 * Get a ThemeFont object by its key.
 * Falls back to Inter if key is not found.
 */
export function getThemeFont(key: string): ThemeFont {
  return themeFonts.find((f) => f.key === key) ?? themeFonts[0];
}
