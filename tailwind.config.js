/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#4F46E5',
                    light: '#818CF8',
                },
                productive: '#22C55E',
                neutral: '#F59E0B',
                sink: '#EF4444',
            },
        },
    },
    plugins: [],
};
