# SCREENCALC

Calculadora web de pantallas LED. A partir de lo que pide el cliente (medidas, uso, distancia de visión, resolución, electrónica) propone el modelo de cabinet, calcula la pantalla y genera un listado completo de proyecto llave en mano, con simulación, electrónica de control, mediaserver, esquema de conexiones y PDF.

**Versión actual: v4.20**

Web pública: https://mediaservi.github.io/SCREENCALC/ · Otra copia: https://screencalcx.netlify.app/

## Para qué sirve

Para pasar de una petición como *"pantalla led para exterior de 6x2 metros que se lea bien a 4 m"* a una propuesta técnica verificable: modelo de cabinet, número de cabinets, resolución, peso, consumo, líneas de señal, electrónica y mediaserver recomendados, todo exportable a PDF en una hoja A4.

## Funciones

- **Petición en lenguaje natural (📝):** se pega el texto del cliente y la app propone una pantalla. Si falta un dato, pregunta con un popup; lo que ya viene en el texto no se vuelve a preguntar. Se interpreta con reglas locales, sin servicios externos de IA.
- **Preguntas de proyecto llave en mano:** uso (interior, exterior, escaparate), instalación o alquiler, distancia del público, ¿cerca del mar o mucha humedad? (variante tropicalizada con contactos de oro), electrónica sí/no (con o sin backup, con o sin escalador, conexión RJ45 o rack con fibra), mediaserver (marca, Dante), número, tipo y resolución de las fuentes de vídeo y distancia de las fuentes.
- **Panel de entrada manual:** INSTALL / RENTAL, INDOOR / OUTDOOR / ESCAPARATE, pitch y nits (valores de la tabla con flechas ▲▼), COLUMNAS y FILAS, ancho y alto con selector de unidad m / cm / mm (por defecto cm; el PDF sigue la unidad elegida), resolución mínima (HD / FHD / UHD 4K) y altura sobre el suelo. Muestra en vivo medidas, cabinets y resolución.
- **Modo resumen:** si la petición se hizo en texto, el panel solo muestra lo elegido. Con "Editar a mano" se vuelve al panel completo. En móvil, el botón flotante ⚙ PANEL vuelve al panel desde los resultados.
- **Resultados:** características de la pantalla en tarjetas (dimensiones, resolución con niveles HD / FHD / 4K / 8K, distancia de visión mínima y óptima, cabinets, instalación, señal y alimentación), en hasta 3 columnas en PC y apiladas en móvil.
- **Simulación a escala:** figura humana, cotas, cuadros de resolución y resumen, con layout dinámico que aprovecha el espacio sin desbordes en PC y móvil. El vídeo por defecto es https://youtu.be/vKN4AcGz7zs.
- **Electrónica de control:** motor propio basado en especificaciones del fabricante (NovaStar MCTRL, VX Pro, NovaPro, COEX MX y H Series, con tarjetas de salida y de entrada). Admite con o sin backup y conexión directa por RJ45 o rack con fibra y convertidores CVT10 Pro.
- **Mediaserver:** NovaStar (ET) y PixelHue, con filtro por marca, audio Dante y número de entradas, y un resumen de características en cada opción.
- **Elección manual de equipos:** clic en una burbuja de electrónica o de mediaserver para elegirla; otro clic la quita.
- **Esquema de conexiones y material (llave en mano):** diagrama con símbolos AV y colores por señal (vídeo, Ethernet, fibra, alimentación, control, backup) y listado de material, que incluye el cable HDMI PureLink FlexInstall más adecuado a la distancia de las fuentes. Se muestra en resultados y es la página 2 de ambos PDF.
- **Enlaces e imágenes de producto:** icono de enlace (a la ficha o a la búsqueda de Charmex por modelo) y, en electrónica, pila de logo, vista frontal y trasera con visor al 80 % de la pantalla. Se leen de la hoja ELECTRONICAS (columnas `url`, `front`, `back`, `logo`) cada vez que se abre la app; las imágenes no van al PDF.
- **Contenido de la pantalla (🖼):** el icono de imagen abre un popup centrado con FUENTES MULTIMEDIA DE PRUEBA (la primera es fija y va preseleccionada; las otras 5 son editables y se guardan en el navegador), URL propia (YouTube normal, /live/, /shorts/, listas, Vimeo, imagen o vídeo) y subida de archivo.
- **Esquemas de cableado:** propuesta de cableado de señal y eléctrico.
- **PDF:** "PDF pantalla" y "PDF cableado", cada uno en una hoja A4 más la página 2 del esquema cuando hay electrónica o mediaserver.
- **Información (ⓘ):** el icono de la cabecera abre este README en una ventana nueva.
- **Adaptada a PC y móvil:** el panel lateral de entrada va en 2 columnas sin scroll en PC y se ve en grande en móvil.

## Datos

La app obtiene el catálogo en vivo y lo guarda cifrado en el dispositivo; no se expone como tabla ni se puede exportar. No usa datos de muestra salvo como último recurso sin conexión. El catálogo de electrónica y mediaservers está en el propio `index.html` (constantes `ELEC_DEVICES` y `ELEC_MEDIASERVERS`).

## Tecnología y despliegue

Archivo único `index.html` con React 18, Babel Standalone 7.29.0 y Tailwind. No necesita compilación. Los recursos gráficos están en `assets/` y se referencian con rutas relativas, por lo que funciona igual en Netlify y en GitHub Pages.

## Ramas

- `main`: versión oficial y pública, aprobada.
- Dos ramas de versión más recientes (`v4.x`) para pruebas. Las anteriores se eliminan.

## Paleta corporativa

La app usa solo estas cuatro tonalidades de verde (además de blanco, negro, grises y los colores que no son verde):

![Paleta corporativa](assets/paleta.svg)

| Nombre | Código | Uso |
|---|---|---|
| VERDE CLARO | `#73ac44` | acentos secundarios y estado «óptimo» |
| VERDE MEDIO | `#00a792` | botones y elementos activos |
| VERDE OSCURO | `#0f584c` | cabeceras de sección y fondos principales |
| VERDE FLUO | `#ccff00` | resaltes y parpadeos de campos por rellenar |

## Cambios de la versión actual (v4.20)

- **Elevación desde el suelo:** el slider del panel lateral se sustituye por botones ▼ / ▲ (10 cm) junto al texto «Elevación desde el suelo» en la simulación; evita cambios accidentales con el dedo en móvil.
- **Catálogo protegido:** solo se usa el catálogo de modelos; se guarda cifrado en el dispositivo y no se muestra ni exporta.

- **Iconos nuevos** en cabecera (info, descarga, idioma), secciones (tipo de pantalla, pitch, nits, cabinet, tamaño, cosido, resolución), micro y audio, contenido, tarjetas de características y pie. Icono de la app en `assets/` (favicon, icono de instalación).
- **Cabecera** más baja y con tres botones: información, descarga y idioma.
- **Descarga para uso sin conexión:** botón con popup (DESCARGAR APP / CANCELAR). Guarda la app, sus recursos y una copia cifrada del catálogo; funciona sin internet y se actualiza sola al volver a tener conexión. Instalable como aplicación (`manifest.json` y `sw.js`).
- **Idiomas:** popup con banderas (castellano por defecto, inglés, català, galego, euskera y portugués) con la selección guardada. La traducción de los textos de la app queda pendiente.
- **Paleta de 4 verdes** en toda la app y cabeceras de sección unificadas en VERDE OSCURO; los parpadeos usan VERDE FLUO.
- **Petición del cliente:** se elimina el texto de ayuda; en pantalla grande, bocadillos al pasar el ratón sobre el micro («Díctame lo que necesitas») y el audio («Envíame archivo de audio»).
- **Solo una resolución** («pantalla 4K de interior»): calcula la pantalla más pequeña que la alcanza, sin pedir medidas.
- **Prioridad de modelos:** 1.º en stock; INSTALL/INDOOR SMD UfixAvant (o LED protegido: HOB UfixAvant / COB UfixCOB, con pregunta si es espacio público); ESCAPARATE Slimfix; OUTDOOR Jfix (JFIXII y después JFIX-K).
- **Simulación:** vídeos sin subtítulos, cotas más ceñidas, botón SIMULAR CONTENIDO bajo el resumen y menos fondo gris.
- **Características de la pantalla:** el resumen pasa a la cabecera, tarjetas en rejilla 2×3 con iconos nuevos y gráfico de distancia a escala (pantalla, figura de 1,75 m y cuatro pitch con semáforo; el pitch elegido, destacado).
- Licencia GPL-3.0 sin cambios.

## Historial de versiones

- **v4.19:** columna derecha del panel en bloques (Tamaño, Cosido, Resolución) con iconos y regla en las unidades.
- **v4.18:** corrección de filtros INDOOR / OUTDOOR / GOLD en el filtro de resolución, auditoría del catálogo y aviso de modelos sin consumo.
- **v4.17:** panel profesional, dictado y audio a texto, botones 3D, líneas por columnas/filas completas con botones de cosido, una medida + formato, «solo sending» y silueta SVG.
- **v4.16:** figura humana más realista, campos que parpadean al pedir datos y menú lateral compacto.
- **v4.15:** enlaces a la ficha de Charmex en el listado de material.
- **v4.14:** cabinets GOLD en entorno marino, botón REINICIAR en el popup de contenido y fuente de prueba 5 eliminada.
- **v4.13:** el vídeo se estira (deformándose) para rellenar toda la pantalla.
- **v4.12:** popup de contenido con fuentes multimedia de prueba (la primera, la lista del canal, fija), vídeo sin controles y pie siempre al final.
- **v4.11:** icono de información (ⓘ) que abre el README y README completo.
- **v4.10:** elegir electrónica y mediaserver con clic en la burbuja y generar el esquema con ese equipo.
- **v4.9:** cable HDMI PureLink FlexInstall en el material según la distancia de las fuentes.
- **v4.8:** características en rejilla de hasta 3 columnas con iconos, sombras y fondos pastel (solo en pantalla).
- **v4.7:** cuestionario llave en mano (entradas, humedad), esquema de conexiones y material (también página 2 del PDF), tarjetas de características, simulación dinámica y enlaces de búsqueda Charmex.
- **v4.6:** preguntas de electrónica (backup, escalador, conexión) y mediaserver en el cuestionario de texto.
- **v4.5:** selector de unidades m / cm / mm, cuadro 📝 a todo el ancho, columnas y filas, botón ⚙ PANEL en móvil, imágenes y enlaces de electrónica con visor, vídeo del canal y enlaces a GitHub Pages.
- **v4.4:** rutas de `assets/` relativas para funcionar en GitHub Pages.
- **v4.3:** panel de entrada rediseñado con petición en lenguaje natural, modo resumen/manual, pitch y nits con flechas, botones simétricos, y enlace a VJSHOW en el pie.
- **v4.2:** nuevo motor de electrónica basado en especificaciones del fabricante, bloque de mediaserver con filtros, enlaces a producto y PDF compacto.
- **v4.1:** migración a Netlify, filtros INDOOR / OUTDOOR / ESCAPARATE, logo y fondo en `assets/`.

## Licencia

Distribuido bajo la licencia **GNU General Public License v3.0** (GPL-3.0). Consulta el archivo [LICENSE](LICENSE).

## Autoría

Proyecto de [mediaservi.com](https://mediaservi.com). Si te gusta, prueba también [VJSHOW](https://mediaservi.github.io/VJSHOW/) (visuales audio-reactivos).
