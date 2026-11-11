/* SCREENS · configuración de Tailwind (la misma que llevaba led.html en línea). Para regenerar assets/tailwind.css tras añadir clases nuevas:
   sh tools/tailwind.sh   (desde la raíz del repositorio) */
module.exports = {
  content: ['./tools/.tw-contenido.html', './comun/*.js', './credito.js', './fallo.js'],
  theme: {
    extend: {
      colors: {
        'corp-green': '#0f584c',
        'corp-teal': '#00a792',
        'corp-lime': '#ccff00',
        'corp-light': '#73ac44',
        green: { 50: '#eef6e8', 100: '#e0efd3', 300: '#b5d79a', 500: '#73ac44', 700: '#0f584c', 800: '#0f584c' },
        'tech-gray': '#e5e7eb',
        'human-gray': '#374151',
      },
      fontFamily: {
        'days': ['"Days One"', 'sans-serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
      boxShadow: {
        'halo': '0 0 15px rgba(204, 255, 0, 0.4)',
        'screen': '0 4px 20px rgba(0,0,0,0.25)',
      }
    }
  }
};
