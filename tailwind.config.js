const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');
const fontSans = `"Mukta", ${defaultTheme.fontFamily.sans.join(',')}`;
const fontSerif = `"Crimson Pro", ${defaultTheme.fontFamily.mono.join(',')}`;
const fontMono = `${defaultTheme.fontFamily.mono.join(',')}`;

module.exports = {
  content: ['_site/**/*.html'],
  darkMode: 'class',
  theme: {
    colors: {
      white: colors.white,
      gray: colors.stone,
      accent: colors.red,
    },
    fontFamily: {
      sans: fontSans,
      body: fontSerif,
      mono: fontMono,
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: colors.stone[700],
            a: {
              color: 'inherit',
            },
            blockquote: {
              color: 'inherit',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            code: {
              display: 'inline-block',
              padding: '0 0.25em',
              fontWeight: 400,
              backgroundColor: colors.stone[100],
            },
            pre: {
              backgroundColor: colors.stone[200],
              color: colors.stone[700],
            },
            h1: {
              color: 'inherit',
              fontFamily: fontSans,
              fontWeight: 500,
            },
            h2: {
              color: 'inherit',
              fontFamily: fontSans,
              fontWeight: 500,
            },
            h3: {
              color: 'inherit',
              fontFamily: fontSans,
              fontWeight: 400,
            },
            h4: {
              color: 'inherit',
              fontFamily: fontSans,
              fontWeight: 500,
              fontSize: '1.125em',
            },
            h5: {
              color: 'inherit',
              fontFamily: fontSans,
              fontWeight: 400,
              fontSize: '1.125em',
            },
          },
        },
        dark: {
          css: {
            color: colors.stone[200],
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            code: {
              backgroundColor: colors.stone[800],
              color: colors.stone[200],
            },
            pre: {
              backgroundColor: colors.stone[800],
              color: colors.stone[200],
            },
          },
        },
      },
    },
  },
  variants: {
    extend: {
      typography: ['dark'],
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
