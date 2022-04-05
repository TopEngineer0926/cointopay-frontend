const path = require('path')
const colors = require('tailwindcss/colors')

module.exports = {
  purge: [
    path.resolve(__dirname, './node_modules/litepie-datepicker/**/*.js'),
    path.resolve(__dirname, './node_modules/vue3-carousel/dist/carousel.css'),
    './public/**/*.html',
    './src/**/*.{vue,js}'
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'litepie-primary': colors.blue, // color system for light mode
        'litepie-secondary': colors.coolGray, // color system for dark mode
        blue: {
          500: '#446bb3',
          700: '#2F4A7C'
        },
        yellow: {
          500: '#ffd200',
          600: '#edbd00'
        },
        green: {
          100: '#e7f1d5',
          500: '#89B92E'
        },
        orange: {
          500: '#f26c22',
          700: '#c14703'
        },
        red: {
          100: '#facece'
        }
      },
      transitionProperty: {
        height: 'height',
        'max-height': 'max-height'
      },
      fontFamily: {
        sans: ['Roboto']
      },
      width: {
        30: '7.5rem'
      },
      maxHeight: {
        240: '60rem'
      },
      maxWidth: {
        '8xl': '120rem'
      },
      screens: {
        '3xl': '1600px'
      }
    }
  },
  variants: {
    scrollbar: ['dark'],
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled']
    }
  },
  plugins: [
    require('@tailwindcss/forms', {
      strategy: 'class'
    }),
    require('tailwind-scrollbar')
  ]
}
