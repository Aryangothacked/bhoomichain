export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4F8A',
          light: '#2563EB',
        },
        accent: '#FF6B35',
        surface: '#F8FAFC',
        danger: '#DC2626',
        success: '#16A34A',
        warning: '#D97706',
      }
    },
  },
  plugins: [],
}
