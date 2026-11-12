# Librerías y recursos de terceros alojados en este repositorio

Se sirven desde aquí para que SCREENS no dependa de redes de distribución externas.

| Qué | Dónde | Autor | Licencia |
|---|---|---|---|
| three.js 0.160 y cuatro de sus módulos (OrbitControls, RoomEnvironment, RectAreaLightUniformsLib, SVGLoader) | `assets/lib/three/` | Three.js Authors | MIT (ver `three/LICENSE`) |
| Hoja de estilos generada con Tailwind CSS 3.4 | `assets/tailwind.css` | Tailwind Labs | MIT |
| html2canvas-pro 2.5 (dibuja la hoja del PDF) | `assets/lib/pdf/html2canvas-pro.min.js` | Niklas von Hertzen y colaboradores | MIT |
| jsPDF 4.2 (compone el archivo PDF) | `assets/lib/pdf/jspdf.umd.min.js` | James Hall, yWorks GmbH y colaboradores | MIT |
| Inter | `assets/fonts/inter-*.woff2` | The Inter Project Authors | SIL Open Font License 1.1 |
| Share Tech Mono | `assets/fonts/share-tech-mono-*.woff2` | Carrois Type Design | SIL Open Font License 1.1 |

`assets/tailwind.css` solo contiene las reglas de las clases que usa `led.html`. Si se añaden clases nuevas hay que regenerarla con `sh tools/tailwind.sh` desde la raíz del repositorio.
