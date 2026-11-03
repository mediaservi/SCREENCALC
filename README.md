# SCREENCALC

Calculadora web de pantallas LED. A partir de lo que pide el cliente (medidas, uso, distancia de visión, resolución) propone el modelo de cabinet, calcula la pantalla y genera un listado completo de proyecto, con simulación, electrónica de control, mediaserver y PDF.

**Versión actual: v4.4**

Web pública: https://mediaservi.github.io/screencalc/ · Otra copia: https://screencalcx.netlify.app/

## Para qué sirve

Para pasar de una petición como *"pantalla led para exterior de 6x2 metros que se lea bien a 4 m"* a una propuesta técnica verificable: modelo de cabinet, número de cabinets, resolución, peso, consumo, líneas de señal, electrónica y mediaserver recomendados, todo exportable a PDF en una hoja A4.

## Funciones

- **Petición en lenguaje natural (📝):** se pega el texto del cliente y la app propone una pantalla. Si falta un dato, pregunta con un popup. Se interpreta con reglas locales, sin servicios externos de IA.
- **Panel de entrada manual:** INSTALL / RENTAL, INDOOR / OUTDOOR / ESCAPARATE, pitch y nits (valores de la tabla con flechas ▲▼), columnas y filas, ancho y alto con selector de unidad m / cm / mm (por defecto cm; el PDF sigue la unidad elegida), resolución mínima (HD / FHD / UHD 4K) y altura sobre el suelo. Muestra en vivo las medidas, los cabinets y la resolución.
- **Modo resumen:** si la petición se hizo en texto, el panel solo muestra lo elegido. Con "Editar a mano" se vuelve al panel completo.
- **Resultados:** características de la pantalla y del cabinet, distancias de visión mínima y óptima, peso, consumo, líneas de señal (con backup) y simulación a escala con figura humana.
- **Esquemas de cableado:** propuesta de cableado de señal y eléctrico.
- **Electrónica de control:** motor propio basado en especificaciones del fabricante (NovaStar MCTRL, VX Pro, NovaPro, COEX MX y H Series). Admite con o sin backup y conexión directa por RJ45 o rack con fibra y convertidores CVT10 Pro.
- **Mediaserver:** NovaStar (ET) y PixelHue, con filtro por marca y audio Dante, y un resumen de características en cada opción.
- **Enlaces e imágenes de producto** en las opciones de electrónica y mediaserver: icono de enlace y, a la izquierda de cada burbuja de electrónica, una pila con logo, vista frontal y trasera (clic para ampliar al 80 % de la pantalla). Solo aparecen si hay dato; las imágenes no van al PDF. Se leen de la hoja ELECTRONICAS (columnas `url`, `front`, `back`, `logo`) cada vez que se abre la app.
- **Vídeo de la simulación:** por defecto el último vídeo subido al canal de YouTube @MEDIASERVI.
- **PDF:** "PDF pantalla" y "PDF cableado", cada uno en una sola hoja A4.
- **Adaptada a PC y móvil.**

## Datos

La app lee en vivo las pestañas MODELOS, ELECTRONICAS y HIERROS de una hoja de Google Sheets publicada como CSV, y guarda una caché local en el navegador. No usa datos de muestra salvo como último recurso sin conexión. El catálogo de electrónica y mediaservers está en el propio `index.html` (constantes `ELEC_DEVICES` y `ELEC_MEDIASERVERS`).

## Tecnología y despliegue

Archivo único `index.html` con React 18, Babel Standalone 7.29.0 y Tailwind. No necesita compilación. Los recursos gráficos están en `assets/` y se referencian con rutas relativas, por lo que funciona igual en Netlify y en GitHub Pages.

## Ramas

- `main`: versión oficial y pública, aprobada.
- Dos ramas de versión más recientes (`v4.x`) para pruebas. Las anteriores se eliminan.

## Cambios de la versión actual (v4.5)

- Los enlaces de la app apuntan a https://mediaservi.github.io/SCREENCALC/.
- Selector de unidad m / cm / mm (por defecto cm) en entradas y datos mostrados, incluido el PDF. El pitch se mantiene en mm; peso, potencia y píxeles no cambian.
- Cuadro 📝 a todo el ancho y más alto, con el icono flotando dentro y el texto de guía completo.
- Ayuda de pitch: "A menor pitch, más definición. Con 3.9p se ve bien desde 3,9 m (óptimo desde 11,7 m)", en la unidad elegida.
- Tamaño Pantalla: COLUMNAS y FILAS; se eliminan los números de paso 1 · / 2 · / 3 ·.
- Botón flotante ⚙ PANEL en móvil para volver al panel desde los resultados.
- Electrónica: pila logo / frontal / trasera con visor al 80 %, enlace Charmex del VX400 Pro y lectura de enlaces e imágenes desde la hoja.
- Vídeo por defecto: último subido al canal @MEDIASERVI (YouTube no publica cuál es el vídeo fijado).

## Historial de versiones

- **v4.4:** rutas de `assets/` relativas para funcionar en GitHub Pages.
- **v4.3:** panel de entrada rediseñado con petición en lenguaje natural, modo resumen/manual, pitch y nits con flechas, botones simétricos, y enlace a VJSHOW en el pie.
- **v4.2:** nuevo motor de electrónica basado en especificaciones del fabricante, bloque de mediaserver con filtros, enlaces a producto y PDF compacto.
- **v4.1:** migración a Netlify, filtros INDOOR / OUTDOOR / ESCAPARATE, logo y fondo en `assets/`.

## Licencia

Distribuido bajo la licencia **GNU General Public License v3.0** (GPL-3.0). Consulta el archivo [LICENSE](LICENSE).

## Autoría

Proyecto de [mediaservi.com](https://mediaservi.com). Si te gusta, prueba también [VJSHOW](https://mediaservi.github.io/VJSHOW/) (visuales audio-reactivos).
