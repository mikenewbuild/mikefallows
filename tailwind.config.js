const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  purge: {
    content: ['_site/**/*.html'],
    options: {
      safelist: [],
    },
  },
  darkMode: 'media',
  theme: {
    colors: {
      gray: colors.warmGray,
      ...colors
    },
    fontFamily: {
      sans: [defaultTheme.fontFamily.sans],
      body: ['"Crimson Pro"', 'sans-serif'],
      mono: [defaultTheme.fontFamily.mono],
    },
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            fontSize: '1.25rem',
            color: theme('colors.gray.700'),
            a: {
              color: 'inherit',
            },
            blockquote: {
              color: 'inherit',
            },
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
            code: {
              display: 'inline-block',
              padding: '0 0.25em',
              fontWeight: 400,
              backgroundColor: theme('colors.gray.200'),
              fontSize: '0.625em',
            },
            pre: {
              backgroundColor: theme('colors.gray.200'),
              color: theme('colors.gray.800'),
            },
            h1: {
              color: 'inherit',
              fontFamily: theme('fontFamily.sans'),
              fontWeight: 500,
              fontSize: '1.75rem',
            },
            h2: {
              color: 'inherit',
              fontFamily: theme('fontFamily.sans'),
              fontWeight: 500,
              fontSize: '1.5rem',
            },
            h3: {
              color: 'inherit',
              fontFamily: theme('fontFamily.sans'),
              fontWeight: 400,
              fontSize: '1.5rem',
            },
            h4: {
              color: 'inherit',
              fontFamily: theme('fontFamily.sans'),
              fontWeight: 500,
              fontSize: '1.25rem',
            },
            h5: {
              color: 'inherit',
              fontFamily: theme('fontFamily.sans'),
              fontWeight: 400,
              fontSize: '1.25rem',
            },
          }
        },
        dark: {
          css: {
            color: theme('colors.gray.200'),
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
            code: {
              backgroundColor: theme('colors.gray.700'),
              color: theme('colors.gray.200'),
            },
            pre: {
              backgroundColor: theme('colors.gray.700'),
              color: theme('colors.gray.200'),
            }
          }
        }
      })
    },
  },
  variants: {
    extend: {
      typography: ['dark']
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
