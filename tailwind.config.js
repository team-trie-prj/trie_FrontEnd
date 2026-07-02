/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 데모 버전 디자인 토큰 그대로 유지
        bg: '#000000',
        panel: '#0A0A0A',
        panel2: '#060606',
        line: '#1A1A1A',
        line2: '#262626',
        line3: '#1C1C1C',
        ink: '#F4F4F4',
        mut: '#8E8E8E',
        mut2: '#7E7E7E',
        mut3: '#6E6E6E',
        mut4: '#5E5E5E',
        danger: '#FF6B6B',
        kakao: '#FEE500',
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: { card: '18px' },
      maxWidth: { wrap: '1180px' },
    },
  },
  plugins: [],
};
