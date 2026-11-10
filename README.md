<p align="center"><img src="assets/screens-logo.svg" alt="SCREENS" height="56"></p>

# SCREENS

Web app de mediaservi.com para calcular pantallas LED y de proyección, desde una sola pantalla hasta salas inmersivas de 4 paredes y suelo. Se entra directamente a la **consola de SCREENS**, un cuadro de mandos fijo:

- **Arriba, siempre a mano:** el modo (**una o varias** superficies · **LED o proyección**) y la **petición en lenguaje natural** por texto, voz o audio, que sirve para todas las combinaciones.
- **Debajo, la zona de trabajo,** que se adapta a la combinación elegida:
  - **una pantalla LED** → el cálculo de una pantalla (`led.html`, descrito en este README), dentro de la misma consola;
  - **una pantalla de proyección, varias pantallas o salas inmersivas** → `screens/`, con simulación 3D renderizada.

Las dos opciones llevan el mismo logo de SCREENS, con el isotipo del cubo. SCREENS es uno de los apartados de AVHUB, cada uno con su subdominio definitivo: screens.mediaservi.com (con HARDWARE como parte suya en hardware.mediaservi.com), news, vjshow y msgame; avhub.mediaservi.com es la máquina que los reúne. Sin redirecciones: la consola es la propia página de inicio (`index.html`).

## Una pantalla LED

Calculadora web de pantallas LED. A partir de lo que pide el cliente (medidas, uso, distancia de visión, resolución, electrónica) propone el modelo de cabinet, calcula la pantalla y genera un listado completo de proyecto llave en mano, con simulación, electrónica de control, mediaserver, esquema de conexiones y PDF.

**Versión actual: v8.5** (estética AVHUB · consola fija de SCREENS)

Web principal: **https://screens.mediaservi.com** (dirección definitiva; las antiguas dejan de usarse). Con `?led` la consola se abre ya en «Una + LED»; el cálculo de una pantalla LED solo, con su propia cabecera: https://screens.mediaservi.com/led.html

## Para qué sirve

Para pasar de una petición como *"pantalla led para exterior de 6x2 metros que se lea bien a 4 m"* a una propuesta técnica verificable: modelo de cabinet, número de cabinets, resolución, peso, consumo, líneas de señal, electrónica y mediaserver recomendados, todo exportable a PDF en una hoja A4.

## Funciones

- **Petición en lenguaje natural:** se escribe, se dicta o se sube un audio en la barra de la consola y la app propone una pantalla. Abre un solo popup «Datos del proyecto» con todos los datos en botones: lo que viene en el texto sale marcado con ✓, lo que falta lleva un valor por defecto que se cambia con un toque, y un único botón CALCULAR. Solo es obligatoria la medida (en metros), salvo si se pide una resolución. Entiende números dictados en palabras. El dictado no se corta con las pausas: sigue escuchando hasta que se pulsa otra vez el micrófono (o tras 10 s sin oír nada). Se interpreta con reglas locales, sin servicios externos de IA.
- **Preguntas de proyecto llave en mano:** uso (interior, exterior, escaparate), instalación o alquiler, distancia del público, ¿cerca del mar o mucha humedad? (variante tropicalizada con contactos de oro), electrónica sí/no (con o sin backup, con o sin escalador, conexión RJ45 o rack con fibra), mediaserver (marca, Dante), número, tipo y resolución de las fuentes de vídeo y distancia de las fuentes.
- **Panel de entrada manual:** INSTALL / RENTAL, INDOOR / OUTDOOR / ESCAPARATE, pitch y nits (valores de la tabla con flechas ▲▼), COLUMNAS y FILAS, ancho y alto con selector de unidad m / cm / mm (por defecto cm; el PDF sigue la unidad elegida), resolución mínima (HD / FHD / UHD 4K) y altura sobre el suelo. Muestra en vivo medidas, cabinets y resolución.
- **Modo resumen:** si la petición se hizo en texto, el panel solo muestra lo elegido. Con "Editar a mano" se vuelve al panel completo. En móvil, el botón flotante ⚙ PANEL vuelve al panel desde los resultados.
- **Resultados:** características de la pantalla en tarjetas (dimensiones, resolución con niveles HD / FHD / 4K / 8K, distancia de visión mínima y óptima, cabinets, instalación, señal y alimentación), en hasta 3 columnas en PC y apiladas en móvil.
- **Simulación a escala:** figura humana, cotas, cuadros de resolución y resumen, con layout dinámico que aprovecha el espacio sin desbordes en PC y móvil. El vídeo por defecto es https://youtu.be/vKN4AcGz7zs.
- **Electrónica de control:** motor propio basado en especificaciones del fabricante (NovaStar MCTRL, VX Pro, NovaPro, COEX MX y H Series, con tarjetas de salida y de entrada). Admite con o sin backup y conexión directa por RJ45 o rack con fibra y convertidores CVT10 Pro.
- **Mediaserver:** NovaStar (ET) y PixelHue, con filtro por marca, audio Dante y número de entradas, y un resumen de características en cada opción.
- **Elección manual de equipos:** clic en una burbuja de electrónica o de mediaserver para elegirla; otro clic la quita.
- **Esquema de conexiones y material (llave en mano):** diagrama con símbolos AV y colores por señal (vídeo, Ethernet, fibra, alimentación, control, backup) y listado de material, que incluye el cable HDMI PureLink FlexInstall más adecuado a la distancia de las fuentes. Se muestra en resultados y es la página 2 de ambos PDF.
- **Enlaces y fotos de producto:** icono de enlace (a la ficha o a la búsqueda de Charmex por modelo) y la foto real del frontal de cada equipo (electrónica, mediaserver, cabinet y proyector), también en el PDF. Las fotos las busca el propio motor en la sincronización de cada noche y llegan con el catálogo; si un equipo aún no tiene foto, sale un dibujo de su tipo. Al pulsar una foto se abre el visor: la trasera, otras vistas y el frontal en grande, con paginación (flechas, puntos, teclado o deslizando el dedo) y botón de cerrar.
- **Contenido de la pantalla (🖼):** el icono de imagen abre un popup centrado con FUENTES MULTIMEDIA DE PRUEBA (la primera es fija y va preseleccionada; las otras 5 son editables y se guardan en el navegador), URL propia (YouTube normal, /live/, /shorts/, listas, Vimeo, imagen o vídeo) y subida de archivo.
- **Esquemas de cableado:** propuesta de cableado de señal y eléctrico.
- **PDF:** un único PDF de 2 páginas desde el icono de la cabecera, en claro sobre papel blanco y con los mismos bloques que la pantalla (tarjetas con filete de color, icono y título; datos en Share Tech Mono y textos en Inter). Sigue la misma línea de diseño que el PDF de la consola: cabecera en una fila (logo de SCREENS, avhub.mediaservi.com con la fecha debajo y logo de AVHUB), línea de cabecera en violeta suave con la descripción de la pantalla, y en todas las hojas el aviso y el eslogan abajo al centro con el número de hoja abajo a la derecha. La simulación, los displays, el esquema y los cableados salen con menos densidad de tinta. Página 1: título, características de la pantalla en tarjetas, observaciones, características del cabinet en fichas y simulación ajustada al hueco de la hoja. Página 2: electrónica y mediaserver elegidos para el proyecto (en una fila, con la foto de su frontal), esquema de conexiones con su material, propuestas de cableado de señal y eléctrico, y el aviso de cálculo por IA. Si no cabe, el esquema se reduce para mantener las 2 páginas. Los anuncios no salen en el PDF.
- **Información (ⓘ):** el icono de la cabecera (con una pantalla LED) ofrece 2 opciones: **INFORMACIÓN** (este README en una ventana al 80 % que se puede desplazar y cerrar) y **DESCARGAR APP** (uso sin conexión).
- **Logo:** sin enlace; al pulsarlo se reinicia la app para un nuevo cálculo (igual que RESET).
- **Ficha de equipo común:** cabinets, proyectores, electrónicas y mediaservers se muestran con la misma ficha en el cálculo de una pantalla y en el de varias (`comun/ficha.js` y `comun/ficha.css`): foto del fabricante, marca y modelo, especificaciones clave, piezas de los equipos montados por módulos, stock y enlace a la ficha. El motor de electrónica también es común (`comun/electronica.js`).
- **Consola de SCREENS:** la web abre directamente el cuadro de mandos, sin página de selector. El modo se cambia con un toque en la barra de la consola; el botón NUEVO CÁLCULO (casa) y el logo vuelven a los valores por defecto sin salir del modo. El idioma, el PDF y la petición son los mismos para todas las combinaciones. La raíz sin parámetros abre la consola; `?led` abre el cálculo de una pantalla LED solo.
- **Tres zonas en todos los modos (v8.5):** dos columnas de menú fijas —«La pantalla» (Tipo, Tamaño, Luz y Entorno, con CALCULAR al pie) y «El equipo» (Material, Ajuste del equipo y Electrónica, con lo elegido y su FICHA al pie)— y el centro desplazable con la vista, las cifras y el detalle. Los mismos bloques están en el mismo sitio en LED y en proyección, con una o varias pantallas; si falta altura se pliegan solos y en el móvil se apilan.
- **PDF de la consola** (una pantalla de proyección, varias pantallas y salas inmersivas): en claro sobre papel blanco. Cabecera en una fila con tres piezas del mismo alto (logo de SCREENS a la izquierda, avhub.mediaservi.com con la fecha debajo al centro y logo de AVHUB a la derecha) y, debajo, una línea en violeta suave con el tipo de proyecto y sus datos. Siguen la captura 3D (con menos densidad de tinta, para que no quede oscura), los resultados, la electrónica y los equipos, cada uno con su foto. En todas las hojas, el aviso y el eslogan van abajo al centro y el número de hoja (1/2) abajo a la derecha. Todos los PDF de SCREENS siguen esta misma línea de diseño.
- **Folleto del modelo:** desde la tarjeta del cabinet se abre en una pestaña nueva la ficha del modelo en la web del fabricante, buscada por su referencia.
- **Administrador:** acceso solo para el propietario con su cuenta de Google (la comprobación se hace en el servidor). Desde ahí se gestionan los anuncios, las consultas internas y la documentación (DOCS), que ya no es pública.
- **Anuncios (motor AVHUB ADS):** 3 zonas (pie del menú y pie de resultados, izquierda y derecha). Cada zona admite varios anuncios con rotación; cada anuncio tiene formato estándar (horizontal 16:9, vertical 9:16, cuadrado 1:1, retrato 4:5, hero a sangre 21:9, banner 728×90, banner móvil 320×100, rectángulo 300×250, rascacielos 160×600), texto al lado, debajo, encima o sin texto, botón opcional, carrusel de fotos, vídeos y YouTube, fechas de inicio y fin, solo móvil o solo escritorio, y contador de clics. Todo el anuncio abre su enlace en una pestaña nueva (o `ads.json` mientras el panel no responda). Además, el minibanner fijo del configurador oficial de TRAULUX va encima de la zona del menú y se activa desde el panel.
- **AVHUB ADMIN (`admin/anuncios.html`):** panel interno con 4 pestañas (la cuarta, **CATÁLOGO**, prepara el catálogo maestro de modelos y el informe de incoherencias de la web para marketing): **ANUNCIOS** (gestor visual con arrastrar y soltar y previo), **FIRMAS** (firmas de correo visuales con banners estáticos, animados en GIF o en mosaico y contador de clics, listas para pegar en Gmail, Outlook o Apple Mail) y **NEWSLETTER** (editor por bloques con vista escritorio y móvil, exportación HTML y envío desde el panel).
- **Página de configuradores (`configuradores/`):** compara SCREENS y el configurador oficial de TRAULUX y lleva a cada uno (es / en / ca).
- **Gestor de anuncios (`admin/anuncios.html`, pestaña ANUNCIOS):** pantalla visual para arrastrar anuncios entre zonas, arrastrar fotos entre anuncios o desde la biblioteca, subir fotos, elegir formato y ver al lado de cada anuncio el previo real en escritorio o móvil. En el panel de administrador guarda de verdad; abierto desde el repositorio funciona en modo demo (guarda en el navegador) y `index.html?anuncios=demo` muestra esos anuncios de prueba. Como afiliado de Amazon, se obtienen ingresos por las compras adscritas que cumplen los requisitos aplicables.
- **Adaptada a PC y móvil:** el panel lateral de entrada va en 2 columnas sin scroll en PC y se ve en grande en móvil.

- **AVHUB:** el logo de AVHUB en la cabecera (entre el logo de SCREENS y los iconos) lleva a https://avhub.mediaservi.com/. AVHUB es la nueva app en preparación que reunirá en un solo sitio SCREENS, el hardware de proyectos AV, novedades y VJSHOW, con el mismo idioma en todas las secciones.

## Datos

La app obtiene el catálogo en vivo y lo guarda cifrado en el dispositivo; no se expone como tabla ni se puede exportar. Nunca usa datos de muestra: sin conexión y sin copia guardada, avisa de que no se ha podido cargar el catálogo. El catálogo de electrónica y mediaservers está en `comun/electronica.js` (constantes `ELEC_DEVICES` y `ELEC_MEDIASERVERS`), común a SCREENS y SCREENS.

## Tecnología y despliegue

Consola (`index.html` + módulos de `screens/`, JavaScript sin compilación y three.js r160). Cálculo de una pantalla LED: archivo único `led.html` con React 18, Babel Standalone 7.29.0 y Tailwind. No necesita compilación. Los recursos gráficos están en `assets/` y se referencian con rutas relativas, por lo que funciona igual en Netlify y en GitHub Pages.

## Ramas

- `main`: versión oficial y pública, aprobada.
- `beta`: última entrega para pruebas; `beta-anterior`: la entrega previa. Solo pasan a `main` cuando se aprueban.

## Estética y paleta corporativa (AVHUB)

Desde la v6.1 la app usa la estética AVHUB: rack digital oscuro en pantalla y la misma composición en claro en el PDF.

| Nombre | Código | Uso |
|---|---|---|
| VERDE ELÉCTRICO | `#00ff04` | lo activado, displays y rejilla de cabinets |
| VIOLETA NEÓN | `#9900ff` | marca, acción principal (PROPONER PANTALLA, CALCULAR) y cabeceras de bloque |
| GRIS NEUTRÓN | `#1a1a1c` · `#262629` | chasis y módulos del rack |
| Acentos | `#00b4ff` azul · `#ffb000` ámbar · `#e100ff` magenta · `#9dff00` lima · `#ff4d5e` rojo | filete de cada bloque de resultados |

Tipografía corporativa, incluida en la app (sin servicios externos): **Inter** (Regular, Bold y ExtraBold) para textos y botones, y **Share Tech Mono** para datos, medidas y displays. Ningún texto toca el filo de su botón o caja: si no cabe, se reduce con un margen de seguridad.

En el PDF las cabeceras de bloque van en violeta claro con texto violeta oscuro, para que se lean bien impresas y no gasten tinta.

La estética clara anterior (verdes `#73ac44`, `#00a792`, `#0f584c` y `#ccff00`) queda solo como reserva con `?tema=clasico`.

## Avisos

- ⚠️ APP experimental con motor IA que puede cometer errores. Verifique los resultados con su método de cálculo habitual.
- *Estas propuestas se calculan automáticamente por IA que puede cometer fallos. Verifique estos cálculos mediante su método habitual o contrastando con un técnico. Algunas electrónicas menos recientes pueden tener limitaciones entre columnas que invalidarían esta propuesta de conectividad.

## HARDWARE · Audio y escenario (beta v0.1)

Primer bloque del apartado **HARDWARE** de AVHUB: una consola de calculadores para profesionales del sonido, la iluminación y el montaje de escenarios. Vive en `hardware/` (página propia, con su cabecera y su número de versión) y usa la misma consola de 3 zonas que SCREENS: los calculadores a la izquierda, los datos en la segunda columna con CALCULAR y RESTABLECER al pie, y el resultado en el centro con cifras, gráficas, tablas y notas. En español, inglés y catalán, sin conexión a ningún servidor: todo se calcula en el navegador.

**Versión actual de HARDWARE: v0.1 (en pruebas).** 26 calculadores en 9 grupos:

- **Acústica:** nivel SPL a distancia (con gráfica), suma de dos niveles por fase, tiempo o distancia (con el filtro de peine dibujado), cobertura de altavoces de techo (con la planta de la sala), absorción del aire según la norma ISO 9613-1, tiempo ↔ distancia y frecuencia ↔ longitud de onda.
- **Arrays:** distancia de transición de un line array, array de subgraves end-fire y línea de subgraves (broadside) con arco electrónico y orientación por retardo. Los dos de subgraves dibujan el diagrama polar, el mapa de cobertura de 50 × 50 m y la respuesta en frecuencia delante, al lado y detrás, y dan la tabla de retardos de cada caja.
- **Electrónica de audio:** dBu ↔ dBV ↔ voltios, factor Q ↔ ancho de banda, umbral y tiempos del limitador y ganancia del amplificador.
- **Cableado:** cable de altavoz en baja impedancia (pérdida, factor de amortiguamiento y comparación de secciones) y en línea de 70 / 100 V.
- **Iluminación y vídeo:** direcciones DMX con sus microinterruptores, color (RGB, RGBW, RGBA, CMY y hexadecimal) y proyector (distancia, brillo y contraste).
- **Electricidad:** ley de Ohm y de Joule, y potencia en kVA, kW y amperios en monofásico y trifásico.
- **Música y grabación:** tempo (BPM ↔ tiempo, con botón TAP), tamaño y tiempo de grabación y nota ↔ frecuencia.
- **Pesos y medidas:** conversor de peso, longitud, superficie, volumen y temperatura.
- **Referencia:** asignación de pines (XLR, jack, speakON, DB25, DMX y RJ45) y patrones polares de micrófonos.

Los cálculos son orientativos: hay que comprobar siempre los datos del fabricante y la normativa antes de montar.

## Cambios de la versión actual (v8.5)

**Consola de 3 zonas** en varias pantallas LED, salas inmersivas y proyección (una o varias), igual que el cálculo de una pantalla LED:

- **Dos columnas de menú que no se mueven nunca** y se ajustan a la altura de la pantalla, y **el centro, que se desplaza** con la vista, las cifras y el detalle.
- **Columna A · La pantalla:** Tipo, Tamaño, Luz y superficie (en proyección) y Entorno, siempre en ese orden. Al pie, **CALCULAR** (lleva a las cifras) y **RESTABLECER** de toda la columna.
- **Columna B · El equipo:** Material (cabinet o proyector y óptica), Ajuste del equipo y Electrónica o Mediaserver. Al pie, **lo elegido** con su botón **FICHA**.
- **Mismo sitio en todos los modos:** al pasar de LED a proyección o de una a varias pantallas, CALCULAR, el material y el tamaño siguen donde estaban; solo cambia lo que hay dentro de cada bloque.
- **Si la altura no da para todo** (portátil, tablet apaisada), los bloques se pliegan solos enseñando su resumen en una línea; quedan abiertos los últimos que se han tocado y un toque abre cualquiera.
- **Cada bloque tiene su RESTABLECER**, que solo devuelve los valores de ese bloque.
- **En el móvil y en vertical** las zonas se apilan: la pantalla, el equipo y el resultado, con todo abierto.
- La ficha del equipo elegido y la lista de superficies pasan al centro, con el resto del detalle.
- Los rótulos largos pasan a dos líneas antes que reducirse hasta no leerse.

El cálculo de una pantalla LED no cambia en esta versión.

## Cambios de la versión v8.4

- **Datos principales de proyección en el orden de los simuladores de Epson y de Vivitek.** En el módulo Espacio van, por este orden:
  - el **tipo de proyección** (mapping, pared o sala inmersiva), que sustituye a «sala / pantallas»;
  - la superficie (ancho, alto y elevación);
  - la **posición del proyector**, que se puede fijar antes de nada: primero la distancia a la fachada o a la pared, con su candado y el rango del zoom, y después el montaje y la altura, también con su candado;
  - el público;
  - el techo (no se pide en mapping).
  - El módulo Proyección queda para el equipo: proyector, óptica, orientación, solape, luz y avanzado.
  - En «varias», mapping y pared son varias superficies sueltas; la sala inmersiva, la sala.
- **Casillas numéricas:** al teclear despacio (sobre todo en el móvil), las cifras ya no se desordenan («35» salía «53»). Era lo que impedía escribir la distancia a la fachada.
- **Petición:** en un mapping, «a 40 m» o «a 40 m de distancia» es la distancia de los proyectores, salvo que hable del público.
- **Escena 3D:**
  - flechas del teclado para desplazarse (con Mayús, girar);
  - + y − para acercar;
  - Inicio o 0 para volver a la vista;
  - botón derecho, Mayús + arrastrar o dos dedos para desplazar;
  - EXTERIOR, DENTRO y PLANTA siempre vuelven a la vista inicial.
- **Fuera de especificación:** el botón activo se resalta en ámbar.
- **Aviso de fase beta:** en varias pantallas, salas inmersivas y proyección, el campo de la petición muestra en letras de LCD ámbar «ESTA SECCIÓN ESTÁ EN PRUEBAS EN FASE BETA» (también en inglés y catalán). Una pantalla LED no lo lleva porque ya está probada. Se quitará cuando esas secciones estén terminadas.

## Cambios de la versión v8.3

- **Vistas técnicas de proyección**, como las del simulador de distancias de Epson, en los resultados de mapping, pared, varias pantallas y sala inmersiva.
  - **Lateral:**
    - la pared con la imagen;
    - el proyector a su distancia y altura (con la torre o la base si va apoyado);
    - el haz, el techo, el público y las cotas.
  - **Frontal:**
    - cada imagen de la rejilla con sus solapes;
    - la superficie y los proyectores;
    - el rango del desplazamiento de la óptica (girado si el proyector va en vertical).
  - **Cenital:**
    - los proyectores de cada columna con sus haces;
    - la distancia y el ancho.
  - **Rango posible** (en azul): dónde puede ir la lente con el zoom y el desplazamiento de la óptica.
  - **Fuera de la superficie** (en rosa): la imagen que sobresale y se enmascara.
  - **Arrastrar el proyector:**
    - en la lateral, cambia la distancia y la altura;
    - en la frontal, la altura;
    - en la cenital, la distancia.
    - Al soltar, los valores quedan fijos con su candado.
  - **Desplazamiento vertical de la óptica** con deslizador y botón de centrar. El horizontal se indica con su rango.
  - **Distribución:** las tres vistas juntas, o una sola en grande. Con varias superficies, se elige cuál se ve.

## Cambios de la versión v8.2

El módulo de proyección se ordena como el simulador de distancias de Epson y AUTO decide según el tipo de proyecto.

- **Tipo de proyección:** mapping, pared o sala inmersiva. AUTO decide según el tipo.
  - **Mapping** (fachada o edificio):
    - los proyectores van lejos (torres, la otra acera, un balcón);
    - AUTO elige los equipos más luminosos y ópticas que llegan a esa distancia;
    - sin distancia, nunca una óptica corta: el proyector queda a unas 2 veces el ancho de la imagen;
    - la luz ambiente pasa a la de exterior de noche (5 lx).
  - **Pared** (auditorio o pared normal): uno o más proyectores en blending, con la óptica que deja el proyector a la distancia del público.
  - **Sala inmersiva:** cubrir las paredes (y el suelo) desde dentro, como hasta ahora.
- **Campos en orden lógico, todos juntos arriba**, y las fichas de los equipos debajo:
  - tipo;
  - proyector y óptica;
  - posición (orientación, montaje y altura, distancia);
  - solape;
  - luz;
  - avanzado.
- **Candados 🔒 en la distancia y en la altura del proyector:**
  - abiertos, la casilla enseña lo que calcula AUTO;
  - cerrados, el valor queda fijo y AUTO lo respeta (por ejemplo, «solo puedo colgarlo a 5 m»);
  - escribir un valor cierra el candado.
- **Deslizador de la distancia** dentro del rango del zoom de la óptica para esa imagen.
- **Uso del espacio** para la luz de la sala: mapping de noche, sala oscura o cine, auditorio, sala de reuniones, aula u oficina, feria o exposición (valores típicos en lx).
- **Modo fuera de especificación** (avanzado) para imágenes algo más grandes que las garantizadas, como en el simulador de Epson y en SCREENBOX:
  - avisa de lo que el fabricante no garantiza;
  - calcula hasta dónde llega cada proyector: en los Epson de alta luminosidad, de 1000" a 1100";
  - avisa si la instalación pasa del máximo garantizado y da una recomendación de uso.
- **La petición entiende** «mapping», «fachada», «edificio» y «auditorio».

## Cambios de la versión v8.1

- **Nuevo editor de anuncios en AVHUB ADMIN (v1.4)**, pensado como un programa de diseño. Es una página fija, sin desplazar la página entera.
  - **Herramientas** a la izquierda, con atajos de teclado:
    - mover (V) y mano (H o barra espaciadora);
    - anuncio nuevo (N), fotos (I) y texto (T);
    - duplicar (Ctrl+D) y eliminar (Supr);
    - zoom (+, −, 0).
  - **En el lienzo, la web real** de SCREENS, en escritorio o en móvil, con las zonas de anuncio marcadas: AD1 pie del menú, AD2 y AD3 en resultados y el minibanner de TRAULUX.
    - Los anuncios se ven en directo mientras se editan.
    - Las zonas vacías salen marcadas.
    - Las zonas que quedan fuera de la vista se avisan en el borde, con un botón para ir a ellas.
  - **Arrastrar y soltar:**
    - un anuncio, de una zona a otra, en el lienzo o en Capas;
    - una foto de la Biblioteca o del ordenador a una zona, para crear un anuncio, o a un anuncio, para añadirla.
  - **Capas:** las zonas con sus anuncios, el orden, el encendido y apagado, la rotación y los borradores.
  - **Propiedades** del anuncio elegido:
    - contenido;
    - fotos y vídeos, con su ajuste, encuadre, oscurecido y cambio de foto;
    - formato y posición del texto;
    - tipografía: fuente, tamaño, grosor, alineación y color;
    - caja y botón: fondo, borde, esquinas, sombra, colores y forma del botón;
    - programación.
  - **Biblioteca** en una tira bajo el lienzo.
  - En pantallas estrechas: herramientas arriba y un panel cada vez, con pestañas.
- **La página guarda y muestra el estilo de cada anuncio** (también en el tema oscuro). Los anuncios sin estilo se ven como siempre.
- **Modo editor** (`?anuncios=editor`): solo lo usa el editor para enseñar la web real con los anuncios que se están editando, sin abrir los enlaces.

## Cambios de la versión v8.0

- **Proyección para mapping y fachadas** (por ejemplo, una fachada de 12 × 19 m con los proyectores en torres al otro lado de la calle):
  - **proyector en vertical (retrato)**, para todos los proyectores salvo las ópticas ultracortas de desplazamiento fijo. En AUTO se usa cuando hace falta menos equipos: la fachada de 12 × 19 m se cubre con un solo proyector;
  - **distancia fija hasta 200 m**: el motor elige la óptica y el zoom que dan la imagen necesaria a esa distancia y, si no llega, añade equipos;
  - **montaje colgado** (techo o truss) **o apoyado** (sobremesa, suelo o torre), con su altura. En AUTO, sin techo, el proyector va en una base o torre a la altura más baja que permite el desplazamiento de la óptica;
  - **rejilla automática de columnas × filas con blending en los dos sentidos**, con la que necesita menos equipos;
  - la imagen puede sobresalir hasta un 20 % de la superficie, que se enmascara.
- **Catálogo de Epson dentro de la app, también sin conexión:** los 13 proyectores de alta luminosidad (series PU1000, PU2000, PQ2000 y XQ2030B) con sus 17 ópticas compatibles, según la guía de ópticas de Epson (08/2026).
  - Cada óptica lleva su relación de proyección y su desplazamiento para cada serie.
  - Los topes de luminosidad: 12.000 lm con la ELPLW05 y 20.000 lm con algunas ópticas en el EB-XQ2030B.
  - Se elige primero el proyector y después la óptica; en AUTO, el motor lo elige todo.
- **Desplazamiento de la lente:** la tabla de posición avisa en rojo cuando se necesita más desplazamiento del que da la óptica, con el máximo de la óptica al lado. En vertical cuenta el desplazamiento horizontal de la óptica, que es mucho menor.
- **Resultados, PDF y simulación 3D:**
  - la rejilla («1×3 = 3»), la orientación, la distancia y el montaje salen en la tabla y en la línea de cabecera del PDF;
  - la escena 3D dibuja cada imagen de la rejilla con sus solapes, los proyectores en vertical girados, y las torres;
  - la vista encuadra también los proyectores aunque estén lejos.
- **Petición en lenguaje natural:** entiende «mapping de una fachada de 12 x 19 con proyectores en torres a 25 m», «en vertical», «torre de 6 m», «colgados de un truss a 8 m» o «sobremesa».

## Cambios de la versión v7.9

- **Varias pantallas de medidas distintas** (por ejemplo, un auditorio con una pantalla central grande y dos laterales más pequeñas):
  - en VARIAS → PANTALLAS, desde 3 pantallas, el botón CENTRAL DISTINTA da medidas propias a la central (con un número par, a las dos del medio) y a las laterales;
  - funciona en línea y en arco, con LED y con proyección, y todas apoyan a la misma elevación;
  - la tabla marca la central y la línea de cabecera del PDF dice «1 central de A × B m + 2 laterales de C × D m».
- **La petición lo entiende:** «3 pantallas, una central de 6,6 x 3,712 y dos laterales de 4,2 x 2,362, P1.5 COB, con backup y fibra».
  - Reconoce la central y las laterales (también «verticales»), en cualquier orden o sin nombrarlas («una de… y dos de…»).
  - El pitch pedido (P1.5, «pitch 1,5») elige el modelo de ese pitch; con «COB», uno COB.
  - En inglés entiende «3 LED screens».
- **Una sola electrónica para varias pantallas, con fibra:** cada pantalla lleva sus propios conversores detrás (en el auditorio, 1 + 2 + 1), con todos los procesadores (COEX MX, VX Pro, H Series…). La ficha del procesador indica el reparto.
- **Medidas de una oferta en milímetros:** los cabinets se encajan con 5 mm de tolerancia, así que «3712 mm» da 11 filas de 337,5 mm y no 10.
- **Panel:** «Distancia del público» ya no sale cortada (en arco va en su propia fila).
- **Sin datos de muestra:** sin conexión y sin copia guardada, el cálculo de una pantalla LED avisa de que no se ha podido cargar el catálogo, en los 6 idiomas.

## Cambios de la versión v7.8

- **Fotos reales de los equipos en todas partes**, en pantalla y en el PDF:
  - la electrónica, el mediaserver, el cabinet y el proyector muestran la foto real de su frontal en lugar de un dibujo; el dibujo queda solo para un equipo que aún no tenga foto;
  - las fotos las busca el propio motor de SCREENS en la sincronización de cada noche (a las 4:00) y llegan con el catálogo, sin pasos a mano; la app guarda la última copia en el navegador;
  - el cabinet lleva además la galería de su ficha web;
  - en las burbujas de electrónica y mediaserver, la foto va a la izquierda con el nombre y las primeras líneas a su lado, también en el PDF (en el móvil en vertical, la foto arriba y el texto debajo).
- **Visor de fotos:** al pulsar una foto se abre un popup con la trasera, las otras vistas y el frontal en grande.
  - Paginación con las flechas ‹ ›, los puntos, el teclado (← →) o deslizando el dedo.
  - Se cierra con su botón, con Esc o tocando fuera.
  - En la electrónica y el mediaserver, pulsar la foto no elige el equipo.
- **PDF del cálculo de una pantalla LED:**
  - el resumen (cabinets, pitch, ancho y alto) y la resolución ya no se salen de su caja ni tocan el borde, tampoco al imprimir desde el móvil;
  - las cotas de ancho y alto salen a 12 px, en una línea y con margen, en todos los idiomas (en euskera crecían y se salían);
  - los textos de la simulación ya no se encogen de más al escalarla a la hoja;
  - la electrónica y el mediaserver elegidos salen con su foto.
- **Configuradores:** la tarjeta de SCREENS dice «Una o varias pantallas LED o de proyección, hasta salas inmersivas o mapping».
- **Catálogo (servidor del panel):** el brillo de cada ficha web se lee de su tabla de especificaciones y admite rangos («de 1.000 a 3.500 nits»). Se acaban los falsos avisos de brillo del informe para marketing.

## Cambios de la versión v7.7

- **Todos los PDF siguen la misma línea de diseño.** El PDF del cálculo de una pantalla LED pasa a tener lo mismo que el de la consola:
  - cabecera en una fila: logo de SCREENS, avhub.mediaservi.com con la fecha debajo y logo de AVHUB, del mismo alto;
  - línea de cabecera en violeta suave con la descripción de la pantalla (tipo, modelo y medidas en negrita);
  - en todas las hojas, el aviso y el eslogan abajo al centro y el número de hoja (1/2) abajo a la derecha;
  - los mismos márgenes de hoja (12 mm; abajo, 18 mm para el pie).
- **Gráficos con menos densidad de tinta** en todos los PDF, para que no queden oscuros: el render 3D de la consola y, en el de una pantalla LED, la simulación, la figura, los displays de las tarjetas, el esquema de conexiones y los cableados. Los textos y las tablas siguen al 100 %. Cada hoja gasta alrededor de un 20 % menos de tinta.
- El navegador ya no añade su fecha, su título ni la dirección a las hojas del PDF de una pantalla LED.

## Cambios de la versión v7.6

- **Dictado sin cortes con cualquier número de pausas** (en la v7.5 aguantaba la primera pausa y se cortaba en la segunda), en la consola y en el cálculo de una pantalla LED:
  - en Android cada frase abre una escucha nueva, porque su modo continuo no aguanta bien las pausas;
  - los fallos pasajeros (micrófono aún ocupado, red) se reintentan en vez de parar el dictado;
  - se sigue parando al pulsar otra vez el micrófono, o solo tras 10 s sin oír nada.

## Cambios de la versión v7.5

- **Dictado sin cortes**, en la consola y en el cálculo de una pantalla LED: las pausas a media frase ya no lo cortan.
  - Si el navegador cierra la escucha al acabar una frase o tras un silencio corto, se vuelve a abrir sola y lo dictado se va sumando.
  - Se para al pulsar otra vez el micrófono, o sola tras 10 s sin oír nada.
  - En Android ya no se repiten palabras.
  - El aviso de la consola recuerda que hay que pulsar el micrófono para terminar.

## Cambios de la versión v7.4

- **PDF de la consola rediseñado** (una pantalla de proyección, varias pantallas y salas inmersivas):
  - **cabecera en una fila** con las tres piezas del mismo alto: logo de SCREENS a la izquierda, avhub.mediaservi.com al centro con la fecha debajo (centrada y espaciada) y logo de AVHUB a la derecha, alineados con el ancho útil de la hoja;
  - **línea de cabecera** en violeta suave con el tipo de proyecto y sus datos: medidas, tecnología, superficies o disposición, equipos (cabinets o proyectores), resolución y consumo o brillo;
  - **pie en todas las hojas:** el aviso y el eslogan abajo al centro, y el número de hoja (1/2, 2/2) abajo a la derecha;
  - el navegador ya no añade su fecha, su título ni la dirección en los márgenes, aunque tenga activados los encabezados y pies de página;
  - en los navegadores que aún no dibujan esos márgenes (Safari y Firefox), el pie sale al final del documento, como antes.
- El PDF del cálculo de una pantalla LED no cambia.

## Cambios de la versión v7.3

- **Cada casilla actúa sola**, sin esperar a otro dato. Si un valor choca con otro, se ajusta el que depende de él y se avisa en el propio módulo:
  - un alto de imagen mayor que la pared sube el alto de la sala para que quepa;
  - con la elevación pasa lo mismo cuando hay alto de imagen;
  - si se baja el alto de la sala, baja la imagen o la elevación;
  - una puerta se queda dentro de su pared y un obstáculo dentro de la sala.

## Cambios de la versión v7.2

- **El nombre anterior de la app desaparece de todas partes:** textos, este README (el que abre ⓘ), comentarios del código, nombres internos y el service worker.
- **Preferencias guardadas:** el idioma, el tema, la pared y las fuentes de prueba pasan solas, una sola vez, a las claves nuevas (`screens_*`).
- **Uso sin conexión:** la copia guardada del service worker cambia de nombre y se borran las de versiones anteriores.
- **AVHUB ADMIN v1.3:** solo cambian textos.

## Cambios de la versión v7.1

- **Casillas numéricas con flechas ▲▼** en la consola de SCREENS, como en el cálculo de una pantalla LED. Se aplican a todas:
  - medidas de la sala y de las pantallas;
  - separación, ángulo y distancia del público;
  - alto del techo, puertas y obstáculos;
  - luz de la sala, ganancia y distancia óptica–pared.
- **Cómo funcionan:**
  - cada valor se sigue escribiendo directamente en su casilla;
  - un toque en una flecha sube o baja un paso;
  - si se mantiene pulsada, repite y acelera, y el cálculo se rehace al soltar;
  - con la distancia óptica en AUTO, ▲ parte de la distancia que AUTO estaba usando.
- **Siempre a mano:** la petición en lenguaje natural (texto, voz o audio) sigue en la barra de la consola.
- **AVHUB ADMIN · FIRMAS:** Teams lleva su logo oficial en el tema «Colores originales».

## Cambios de la versión v7.0

- **Consola fija de SCREENS:** se entra directamente al cuadro de mandos, sin página de selector ni redirecciones: la consola es la propia página de inicio (`index.html`) y el cálculo de una pantalla LED pasa a `led.html`.
  - **Barra de la consola**, debajo de la cabecera y siempre a la vista:
    - modo: **UNA / VARIAS** y **LED / PROYECCIÓN**, con un toque;
    - **petición en lenguaje natural** para todas las combinaciones: se escribe, se **dicta** con el micrófono o se **sube un audio** (wav, mp3, m4a, ogg…; se transcribe en el propio navegador y no sale del dispositivo), y CALCULAR;
    - lo dictado o transcrito se añade a lo ya escrito;
    - el texto guía elige la versión que cabe entera en la caja.
  - **Qué entiende la petición** (castellano, inglés y catalán): sala inmersiva o N pantallas, medidas «8 × 6 × 3,5», paredes (número o nombres) y suelo, en línea o en arco, distancia del público, luz de la sala en lx («a oscuras» = 10 lx), ganancia, alto del techo, LED o proyección, interior o exterior, alquiler, backup y fibra. Debajo se resume lo entendido, en el idioma de la app.
  - **Una pantalla LED dentro de la consola:** su cálculo completo se carga en la zona de trabajo, sin cabecera, caja de petición ni pie duplicados.
    - La consola le pasa la petición, que abre su popup «Datos del proyecto».
    - También le pasa el PDF de 2 páginas, el idioma, el nuevo cálculo y la información (ⓘ).
  - **Cabecera común:** información (con una pantalla LED), PDF, nuevo cálculo e idioma. El pie lleva el acceso de administración en todas las combinaciones.
  - **Zona de trabajo adaptable:** con una pantalla de proyección, varias pantallas o una sala, el panel de rack, la simulación 3D y los resultados de siempre.
  - **Móvil apaisado:** cabecera y consola compactas; con una pantalla LED, su cálculo ocupa toda la altura.
- **Escena 3D sin fugas:** al cambiar de modo se libera la simulación anterior, sin bucles ni contextos WebGL colgando.
- **Página de configuradores:** las dos cartas tienen el mismo tamaño, con los puntos agrupados en dos columnas. El botón siempre está a la vista en pantallas de escritorio, y junto a cada logo hay una minicaptura de la pantalla inicial de su herramienta.
- **PDF de SCREENS:** nada se sale de la hoja por la derecha (las tablas anchas parten líneas).
- **AVHUB ADMIN v1.2 · FIRMAS:**
  - nueva plantilla **Charmex oficial**, la de cada firma nueva: nombre, cargo en verde, logo de Charmex, email, móvil y teléfono, dirección y web, y los iconos de LinkedIn, WhatsApp, Teams y AVHUB (que lleva a la página de configuradores);
  - el icono de WhatsApp es el original;
  - nuevo tema de iconos **Colores originales** (el de la firma de Charmex): LinkedIn y WhatsApp con sus logos originales y AVHUB a color;
  - icono de móvil nuevo: smartphone con auricular;
  - todas las imágenes van enlazadas como PNG en screens.mediaservi.com, nunca adjuntas.
- **Textos con variables repetidas:** la ayuda de la posición del proyector ya muestra los lx de la sala en los dos sitios donde aparecen.

## Cambios de la versión v6.9

- **Proyección al nivel del calculador oficial de Epson**, que se usa como referencia y doble verificación:
  - **luz de la sala** en lx (140 por defecto) y **ganancia de pantalla** (1,0 por defecto);
  - **brillo:** iluminancia (lúmenes / superficie), luminancia (iluminancia × ganancia / π) y **contraste real** ((iluminancia + luz de la sala) / luz de la sala), con el nivel ANSI/AVIXA que alcanza: 7:1 visión pasiva, 15:1 decisiones básicas, 50:1 analíticas, 80:1 vídeo;
  - **distancia óptica–pared:** AUTO (la mínima del zoom) o fijada a mano, siempre dentro del rango del zoom de la óptica, que se indica;
  - **posición del proyector** por superficie: distancia óptica–pared, rango de zoom, altura suelo–óptica, suelo y techo a la imagen (o cuánto desborda), lens shift vertical, diagonal y medidas de la imagen;
  - **alto del techo** en pantallas sueltas, para colgar el proyector;
  - en la ficha de cada proyector Epson: **manual y especificaciones** en setupnavi, en el idioma de la app, y enlace al **calculador oficial de Epson** para verificar.

## Cambios de la versión v6.8

- **Todo es SCREENS:** desaparecen el nombre y el logo anteriores.
  - SCREENS es la calculadora de pantallas: una pantalla o varias / sala inmersiva, LED o proyección.
  - El logo SCREENS con el isotipo del cubo va en las dos opciones: cabecera, título, pie, PDF (en negro), textos de ayuda, configuradores y app instalable.
  - El repositorio pasa a llamarse **SCREENS**.
- **Icono de la pestaña:** el cubo es más grande, con trazo grueso y menos detalles, para que se lea a 16 y 32 px.
- **Proyección · ningún chasis dentro de otro haz:**
  - si un proyector queda dentro del haz de otra superficie, o mete otro chasis en el suyo, se busca otra ubicación que cumpla lo demás: alejarlo de su pared con el zoom de la óptica, colgarlo más bajo o más alto (sin pasar del techo ni bajar de 2,3 m) o desplazarlo por su pared con el lens shift;
  - los proyectores ya no se cuelgan por encima del techo;
  - **AUTO** elige el modelo que deja la instalación limpia, con menos equipos y más brillo: el mismo modelo para todas las paredes, y el suelo con el mismo u otro;
  - con un modelo elegido a mano que no tiene ubicación limpia, se avisa y se propone el de AUTO.

## Cambios de la versión v6.7

- **PDF de SCREENS con márgenes blancos:** la hoja ya no sale a sangre. Antes, el esquema oscuro de la pantalla pintaba los márgenes de negro; ahora el margen es blanco y de 12 mm.
- **Logo SCREENS en negro en el PDF** (`assets/screens-logo-negro.svg`): el verde lima sobre blanco no se leía.

## Cambios de la versión v6.6

- **SCREENS · puertas y obstáculos** (bloque en ESPACIO, con ＋ PUERTA y ＋ OBSTÁCULO):
  - **Puerta:** pared, posición desde la izquierda, ancho y alto.
    - En LED quita los cabinets del hueco, ajustado a la rejilla, y recalcula cabinets, peso, consumo y líneas.
    - En proyección avisa de que hay que enmascararla en el contenido.
  - **Obstáculo** (columna, caja…): posición, ancho, fondo y alto. Si corta el haz de algún proyector, sale en rojo y con aviso de sombra.
- **SCREENS · contenido propio:**
  - **PROPIO:** se sube un vídeo o una imagen del cliente. Se abre solo en el navegador, no se sube a ningún servidor.
  - **Modos de ajuste:**
    - **continuo**: un ultrapanorámico recorre todas las paredes sin cortes;
    - **estirar** a cada superficie;
    - **rellenar**, que recorta;
    - **encajar**, con bandas;
    - **repetir**;
    - **espejo**.
  - **ASCENSOR:** demostración en movimiento, continua en todas las paredes.
- **Panorama sin cortes:** recorre la sala en orden izquierda → frontal → derecha → trasera, y las esquinas casan.
- **PDF de SCREENS** (icono de la cabecera), en claro para imprimir en blanco:
  - cabecera con los logos de SCREENS y AVHUB, el espacio y la fecha;
  - captura 3D encuadrada;
  - resultados y tabla por superficie;
  - sombras y safety zone;
  - electrónica y mediaserver;
  - fichas de los equipos y aviso de cálculo automático.

## Cambios de la versión v6.5

- **Ficha de equipo común** para todas las pantallas de cálculo (`comun/ficha.js` y `comun/ficha.css`):
  - foto del fabricante, marca y modelo, especificaciones en rejilla, piezas de los equipos montados por módulos, stock y enlace a la ficha;
  - en el cálculo de una pantalla LED sustituye al resumen del cabinet;
  - en SCREENS se usa para el cabinet, el proyector, la electrónica y el mediaserver;
  - si no hay foto, sale un dibujo del tipo de equipo.
- **Motor de electrónica común** (`comun/electronica.js`): el mismo cálculo para una pantalla LED y para varias. Las líneas salen en plural («24 líneas»).
- **SCREENS · electrónica de control LED** para todas las superficies a la vez:
  - con o sin backup, con o sin escalador, RJ45 directo o rack con fibra;
  - propuestas del catálogo, con H Series montada por piezas;
  - reparto de las líneas por superficie (L1–Ln) en la tabla.
- **SCREENS · mediaserver** (LED y proyección): filtro por marca y Dante, salidas 4K necesarias (en proyección, una por proyector).
- **SCREENS · proyección: sombras del público y safety zone**:
  - franja de sombra de cada pared o pantalla (donde una persona de pie corta el haz), rayada en rojo en el suelo;
  - zona segura marcada con una cinta discontinua amarilla y negra y su medida;
  - proyectores que quedan dentro del haz de otra superficie, en rojo y con aviso;
  - cruces de haces entre superficies;
  - en el suelo proyectado, aviso de que el público siempre hace sombra.
- **SCREENS · chasis de proyector que no se tocan:**
  - medidas reales de cada modelo (fichas de Epson);
  - holgura de ventilación de 40 cm en horizontal y 20 cm en vertical;
  - si dos chasis chocan, uno se cuelga más alto o más bajo, o se desplaza a lo largo de su pared, y se indica cuánto;
  - aviso de la recomendación de Epson de 150 cm lado a lado sin mampara.
- **SCREENS · paredes con solape excesivo:** como en las pantallas sueltas, se usa un proyector menos con un pequeño recorte vertical (por ejemplo, 1 proyector con un 7 % de recorte en vez de 2 con un 93 % de solape).

## Cambios de la versión v6.4

- **SCREENS es la página de inicio.** La web principal pasa a **screens.mediaservi.com**; las direcciones anteriores dejan de usarse.
  - Al entrar se elige una o varias superficies y LED o proyección. «Una + LED» abre el cálculo de una pantalla LED; el resto, el módulo de varias pantallas.
  - Enlace directo al cálculo de una pantalla LED: `?led`.
- **Cabecera del cálculo de una pantalla LED:** el botón que llevaba a SCREENS pasa a ser **INICIO** (casa) y vuelve al selector.
- **Logo SCREENS:** isotipo CUBO (un cubo montado con paneles LED) y el rótulo con las dos S grandes.
  - Va en la cabecera de SCREENS, que al pulsarlo vuelve al inicio.
  - Icono propio de la página y de la app instalable (SCREENS).
- **Navegación:** el botón Atrás del navegador alterna entre el selector y el cálculo, y al recargar se queda donde estabas. SCREENS también funciona sin conexión con el mismo service worker.
- **Idioma común:** el idioma elegido se comparte entre el cálculo de una pantalla y el de varias.
- **Textos y enlaces:** sin referencias a SCREENBOX en la interfaz, y todos los enlaces, el pie y el PDF apuntan a screens.mediaservi.com.

## Cambios de la versión v6.3

- **Fusión de las calculadoras de pantallas: nuevo módulo SCREENS** (`screens/`, desde un icono de la cabecera). Primer paso para unir el cálculo de LED y el de proyección en una sola interfaz.
  - **Selector inicial:** una o varias superficies, y LED o proyección. Con «una pantalla LED» se abre su cálculo.
  - **Espacio:** sala inmersiva de hasta 4 paredes y suelo (ancho, fondo, alto, alto de imagen y elevación), o varias pantallas en línea o en arco (número, medidas, separación, ángulo y distancia del público).
  - **LED:**
    - catálogo en vivo, el mismo que el cálculo de una pantalla LED, y el mismo cabinet en todas las superficies;
    - pitch automático según la distancia del público y ajuste dentro de la pared o al tamaño más cercano;
    - en las esquinas, las paredes laterales descuentan el fondo del cabinet;
    - resultados por superficie y totales: cabinets, lienzo de contenido en píxeles, peso, consumo, líneas Ethernet y salidas 4K.
  - **Proyección:**
    - motor de SCREENBOX revisado, con blending de solape mínimo elegible (15, 20 o 25 %), tiro con el zoom más corto y aviso si no cabe en la sala;
    - resolución resultante del conjunto y brillo estimado en nits;
    - suelo con rejilla de proyectores cenitales;
    - en pantallas sueltas, si cubrir el alto obliga a un solape excesivo, se usa un proyector menos con recorte vertical.
  - **Simulación 3D renderizada:** vista exterior seccionada, dentro (a la altura de los ojos) y planta; contenido de carta de ajuste, panorámica o apagado; las pantallas LED iluminan la sala; haces de luz de los proyectores; figura de 1,75 m y cotas.
  - Estética AVHUB y textos en español, inglés y catalán.
- **Pendiente:** el catálogo de proyectores es el heredado de SCREENBOX. Hay que pasarlo a la hoja o al panel para que salga en vivo, como el de LED.

## Cambios de la versión v6.2

- **Electrónica H Series (equipo modular):** en el listado de material el equipo sale como titular sin cantidad y, debajo, sus piezas, cada una con su cantidad y alineadas. La burbuja de electrónica las muestra en columnas (cantidad · referencia · descripción).
- **Piezas:**
  - el chasis lleva su referencia comercial (H2-MAINFRAME, H5-MAINFRAME…);
  - se añade siempre la tarjeta base de previo H-OUT2RJ45-1HDMI-MVR (recomendada);
  - si no se indican entradas (o es una sola) o son 4K, la entrada es la tarjeta H-INPC-1XHDMI2.0.
- **Chasis:** se elige según las posiciones de salida y de entrada / previo de las fichas de NovaStar (H2: 2 salidas y 4 entradas; H5: 3 y 10; H9: 5 y 15; H20: 20 y 40; H15: 10 salidas y 30 entradas, pendiente de confirmar en su ficha).
- **Referencias comerciales de Charmex en las tarjetas H Series:**
  - salida H-OUTC-20XRJ45 en conexión directa;
  - salida H-OUTC-16RJ45-2OPT en rack con fibra (2 fibras por tarjeta y 8 puertos por fibra);
  - entradas H-INPC-4XHDMI, H-INPC-2XHDMI2.0 (para 4K), H-INPC-1XDP1.2 y H-INPC-4X3GSDI.
- El enlace de búsqueda de cada pieza ya la encuentra en Charmex.

## Cambios de la versión v6.1

- **Nueva versión pública con la estética AVHUB**, que sustituye a la estética clara anterior en pantalla y en el PDF. Reúne las propuestas v5.0 a v5.3, revisadas y aprobadas:
  - un solo sistema visual de rack digital, con tipografía Inter y Share Tech Mono;
  - simulación realista con paredes a escala real, cotas técnicas y carta de ajuste con la resolución real;
  - panel de tamaño y resolución renovado, con Resolución antes que Cosido de cable;
  - popup «Datos del proyecto» en 3 columnas;
  - PDF en claro con los mismos bloques que la pantalla.
- La estética anterior se puede seguir abriendo con `?tema=clasico`.

## Cambios de la versión v5.3 · propuesta

- **PDF con la estética AVHUB sobre papel blanco:** cabecera en una sola línea (logo, web y fecha, logo AVHUB grande al margen derecho); las características de la pantalla salen en las mismas tarjetas que en pantalla (filete de color, icono y título) con los datos en Share Tech Mono y los textos en Inter, más grandes; cabeceras de bloque en tinte violeta claro con texto violeta oscuro, legibles y sin gastar tinta.
- **Cabinet en fichas de dato:** cada característica con su etiqueta encima del valor, sin huecos entre ambos.
- **Simulación a medida de la hoja:** se escala para ocupar exactamente el hueco que queda en la página 1, sin recortes; cotas recuadradas en azul como en pantalla.
- **Página 2:** electrónica y mediaserver elegidos, esquema, material y cableado con la misma tipografía y bloques; el aviso «Desliza…» ya no se imprime; pie en dos líneas (aviso y lema).
- **Magnetotérmicos sin amontonarse:** el rótulo va una vez y cada línea muestra solo su número, calibre y consumo real (en pantalla y en el PDF).
- **Simulación en pantalla:** mármol en losas de 120 × 60 cm a escala real; en móvil y tablet la franja del suelo coincide con la línea de suelo.
- **Panel manual:** Resolución va antes que Cosido de cable, en el orden lógico de los pasos.
- El PDF clásico se mantiene con `?tema=clasico`.

## Cambios de la versión v5.2 · propuesta

- **Simulación más real:** la pared lleva textura a escala real (hormigón, madera, ladrillo claro, rojo u oscuro y mármol); el suelo es siempre el gris oscuro uniforme y la pared empieza a ras de suelo. La pared se elige en «Simular contenido» o con los minibotones de muestra de la franja del suelo.
- **Figura y cotas:** la figura es gris claro sobre paredes oscuras; su altura aparece como texto horizontal junto a sus pies; las cotas de ancho y alto se apoyan por fuera de su línea y quedan pegadas a la pantalla; el control de elevación queda siempre bajo la línea de suelo.
- **Carta de ajuste:** muestra la resolución, la clase (HD, FHD, 4K…) y el formato reales de la pantalla configurada; en pantallas estrechas pasa a varias líneas.
- **Numeración de cabinets legible:** si las celdas son demasiado pequeñas se numera cada 2, 3… para que los números no se pisen.
- **Total de cabinets:** en grande en el resumen de la simulación (en móvil, junto a la resolución) y entre columnas y filas en «Tamaño de pantalla», donde las casillas muestran ya las medidas reales.
- **Resolución:** botones AUTO / HD / FHD / UHD y casillas H × V para una resolución a medida. Con solo el ancho o solo el alto, el otro se calcula por la proporción de la resolución; sin medidas, se propone la pantalla más pequeña que la alcanza.
- **Rigor visual:** tipografía coherente por tipo de campo (datos y medidas en Share Tech Mono); ningún texto llega al filo de su botón o caja: si no cabe, se reduce con margen de seguridad.

## Cambios de la versión v5.1 · propuesta

- **Petición más fiable:** «externa», «le da el sol directo», «terraza», «azotea»… se entienden como exterior; «cerca de un río», lago, embalse, piscina, puerto… como entorno húmedo (marino / tropical). «Sol directo» ya no se confunde con «conexión directa»: la electrónica y la conexión solo se marcan como «de tu petición» si se piden.
- **Popup «Datos del proyecto» compacto:** 3 columnas en PC (sin desplazamiento a partir de 1000 × 600 px), 2 en tablet y móvil horizontal, 1 en móvil vertical; cada grupo (pantalla y sitio · electrónica · mediaserver y fuentes) queda en su columna.
- **Modo manual con resolución mínima y sin medidas:** CALCULAR propone la pantalla más pequeña que alcanza HD / FHD / 4K con el cabinet elegido; después se amplía con + / −.
- **Tipografía corporativa:** solo dos familias y cuatro variantes: Inter Regular, Bold y ExtraBold, y Share Tech Mono para datos técnicos y displays.

## Cambios de la versión v5.0 · propuesta

- **Estética AVHUB en toda la app:** un solo sistema visual en lugar de estilos sueltos. Chasis gris neutrón, verde eléctrico para lo que está activado, violeta de marca para la acción principal (PROPONER PANTALLA, CALCULAR), tipografía Inter y displays en Share Tech Mono, incluidas en la propia app (sin servicios externos).
- **Cabecera:** botones metálicos redondos con iluminación verde al pasar el ratón.
- **Panel de control:** módulos de rack oscuros; interruptores con estado inequívoco (apagado en metal, encendido en verde con brillo); pitch y nits en display LED; regla de unidades con marcas verdes; desplegable de modelos oscuro con los de stock en azul.
- **Resultados:** simulación sobre rejilla técnica; tarjetas de características oscuras con filete de color por sección; cabeceras de bloque en violeta; burbujas de electrónica y mediaserver con la elegida en verde; esquema de conexiones y material en plano oscuro con los colores de señal intactos; gráfico de distancia de visionado adaptado.
- **Popups** (Información, Idioma, README, Descargar, Contenido, Datos del proyecto) con cabecera violeta y botones del mismo sistema.
- **PDF sin cambios:** la impresión conserva su diseño claro.
- **Móvil y tablet:** el margen inferior del panel va dentro de la zona desplazable (ya no queda una franja vacía abajo).
- **Tablet horizontal y portátiles pequeños (1024–1279 px):** el panel va en una columna con desplazamiento y los resultados quedan siempre a la vista (antes, a 1024 px, el panel tapaba los resultados).
- **Móvil:** el esquema de conexiones se desplaza en horizontal para leerse a tamaño real; los botones táctiles no se quedan iluminados tras pulsarlos; el idioma se elige en dos columnas en horizontal.
- **Petición en inglés:** «2 HDMI inputs» se entiende como 2 fuentes.
- **Comparar:** `?tema=clasico` muestra la estética anterior (se recuerda en el navegador) y `?tema=avhub` vuelve a la nueva.

## Cambios de la versión v4.15

- **Módulo de petición:** sin título ni etiqueta «Entrada principal» (el texto guía ya lo explica) y con más alto para el texto. Los avisos del dictado y del audio aparecen como una capa flotante sobre el texto, destellan y se desvanecen solos (o al tocarlos). El bocadillo de ayuda del micrófono sale debajo y ya no tapa PROPONER PANTALLA.
- **Popup «Datos del proyecto»:** cada dato en una tarjeta con fondo pastel según su sección (pantalla, sitio, electrónica, mediaserver, fuentes de vídeo), icono propio junto al título y botones más claros con el color de la sección.

## Cambios de la versión v4.14

- **Entorno:** el popup «Datos del proyecto» tiene siempre la fila ENTORNO (Estándar · Marino / tropical · Al alcance del público); cada opción lleva a otros tipos de cabinet (GOLD tropicalizado / LED protegido) y se activa o desactiva por separado. También están como botones en el panel manual (TIPO DE PANTALLA) y como etiquetas en el resumen.
- **✎ EDITAR:** en «Solicitud aplicada» reabre el popup con lo elegido, para corregir cualquier dato que se haya interpretado mal y volver a calcular.

## Cambios de la versión v4.13

- **Petición:** entiende frases dictadas como «se vea bien a una distancia de unos 6 metros» o «la pared de ancho son 12 metros»; «público» ya no se toma como LED protegido salvo si se dice espacio o lugar público.
- **Popup «Datos del proyecto»:** nueva fila «Resolución mínima» (Full HD, 4K…) editable; la distancia del público también aparece cuando se pide una resolución; valores por defecto: interior, instalación fija, sin LED protegido, electrónica con backup, escalador y conexión RJ45, sin mediaserver, 1 fuente HDMI; en pantallas anchas se muestra a dos columnas.
- **Dictado:** el micrófono se apaga solo tras 3 s de silencio y el botón PROPONER PANTALLA se ilumina con un halo para pulsarlo (también al terminar de transcribir un audio).

## Cambios de la versión v4.12

- **Petición en lenguaje natural:** un solo popup «Datos del proyecto» sustituye a la cadena de preguntas. Todas las opciones a la vista con botones; lo detectado en la petición va marcado (✓ de tu petición / ✓ deducido), lo que falta lleva un valor por defecto y se cambia con un toque; las opciones de electrónica y de fuentes solo aparecen si se activa la electrónica o el mediaserver.
- **Dictado:** entiende números en palabras («3 metros de alto por seis de ancho», «tres metros y medio», «sis metres d'amplada»), y si se pide cerca del mar propone exterior.

## Cambios de la versión v4.11

- **Minibanner de TRAULUX:** ahora dice «PRUEBA EL NUEVO CONFIGURADOR DE PANTALLAS LED DE TRAULUX» (traducido en cada idioma).

## Cambios de la versión v4.10

- **Distancia de visionado:** una sola figura, en la distancia del pitch elegido, con cota desde la pantalla y etiqueta de pitch y distancia; las zonas CERCA / ACEPTABLE / ÓPTIMA van rotuladas dentro del suelo; los demás pitch disponibles aparecen en una regla técnica con etiquetas inclinadas que no se solapan.
- **Anuncios de resultados:** cada zona se limita a su ancho de 600 px y se centra, así se ve igual que en la vista previa del panel aunque la otra zona esté vacía.
- **Configuradores:** la tarjeta de TRAULUX se etiqueta «CALCULADORA DE PANTALLA LED».

## Cambios de la versión v4.9

- **Prioridad y uso de cada modelo:** en la pestaña CATÁLOGO del panel, la casilla «Cálculos» decide qué modelos usa la app, y ▲▼ fija el orden entre modelos del mismo pitch (por ejemplo, que para P1.8 salga antes el modelo B que el C en la configuración recomendada).
- **Informe para marketing más completo:** la sincronización del catálogo compara también cada ficha web con su ficha técnica PDF (brillo, refresco, peso, fondo, consumos, tamaño y resolución del cabinet) y detecta la tabla que corta la primera cifra del refresco.

## Cambios de la v4.8

- **Une las dos líneas de trabajo:** la v4.7 publicada (minibanner y X de TRAULUX, Información breve, configuradores con logos reales) con el motor de anuncios y el catálogo maestro que estaban en pruebas.
- **Catálogo maestro:** la app lee los modelos del catálogo que se gestiona en el panel (pestaña CATÁLOGO): se importa una vez, se completa y contrasta automáticamente con las fichas de la web de producto, y se edita a mano lo que falte. Solo se envían los datos técnicos, nunca precios.
- Si el panel no responde, la app usa el último catálogo guardado en el dispositivo o la consulta anterior como respaldo.

- **Nuevo motor de anuncios AVHUB ADS**, el mismo que usará toda AVHUB: 9 formatos estándar, posición del texto (al lado, debajo, encima con contraste automático o sin texto), botón opcional, carrusel de fotos y vídeos, varios anuncios por zona (siempre el primero, rotar en orden, uno al azar por visita o rotar al azar), programación por fechas, solo móvil o solo escritorio y contador de clics.
- **Gestor visual de anuncios:** arrastrar y soltar anuncios y fotos, biblioteca de media con subida de fotos, deshacer, y previo real de cada anuncio en escritorio y en móvil.
- **Compatible** con la configuración de anuncios anterior: se convierte sola al nuevo formato.

## Cambios de la v4.7

- **Información:** la ventana de la app muestra solo un resumen breve de para qué sirve la web; el detalle técnico y los cambios quedan en este README.
- **Cabecera:** la X de TRAULUX va sin fondo negro y pasa a ser el último icono, a la derecha.

## Cambios de la v4.6

- **Minibanner del configurador oficial de TRAULUX:** fijo en la posición del AD1 (pie del menú), siempre arriba; si hay otro AD1 activo, va debajo. Fondo negro, logo de la X de TRAULUX y el texto «PRUEBA EL NUEVO CONFIGURADOR OFICIAL DE TRAULUX», sin indicador de publicidad. Se activa o desactiva desde el panel de administrador (tarjeta «TRAULUX · configurador oficial»). Como el AD1, no aparece en móvil.
- **Cabecera:** la X de TRAULUX sustituye al icono de descarga y abre la página de configuradores. «Descargar app» sigue en Información.
- **Información:** empieza con la nota de que la app se basa en las especificaciones de los productos LED de TRAULUX, el enlace a su configurador oficial y que la app es una alternativa que calcula el proyecto completo.
- **Página de configuradores:** logos reales de AVHUB, de la app y de TRAULUX, y textos nuevos.

## Cambios de la v4.5

- **Eslogan de AVHUB:** pasa a ser «TOOLS FOR AV PEOPLE» en el pie de los configuradores (todos los idiomas).

## Cambios de la v4.4

- **Numeración:** las versiones usan 2 cifras (v4.4, v4.5 … hasta v99.99).
- **PDF en 2 páginas** con el orden fijo: página 1 (características pantalla, observaciones, características del cabinet, simulación) y página 2 (electrónica y mediaserver elegidos en una fila, esquema, cableado de señal, cableado eléctrico y aviso IA). El esquema se encoge lo necesario para no pasar de 2 páginas. Logo de AVHUB enlazado arriba a la derecha de la página 1.
- **Anuncios auto-expandibles:** la altura la marca la foto o el vídeo, así caben fotos verticales más grandes. Admiten vídeos de YouTube (normales y Shorts en vertical), en silencio y en bucle; tocar el vídeo también abre el enlace del anuncio.
- **Móvil:** solo se muestran AD2 y AD3, uno debajo del otro al final. AD1 (pie del menú) solo en pantallas grandes.
- **PDF sin anuncios.**

## Cambios de la v4.3.2

- **Anuncios en 3 formatos:**
  - **AD1 · pie del menú** (punto `panel`): foto o vídeo a la izquierda y texto a la derecha.
  - **AD2 · pie de resultados, hero** (punto `hero`, nuevo): foto o vídeo a sangre de fondo con el texto encima. El color del texto se elige solo según el fondo: oscuro sobre fondo claro, blanco sobre fondo oscuro, y blanco con filete negro cuando no se puede medir (vídeos o imágenes de otros dominios). Si hay varias fotos, pasan cada 4 s.
  - **AD3 · pie de resultados, final** (punto `resultados`): foto izquierda, foto derecha y texto.
  - AD2 y AD3 van lado a lado en pantalla ancha y uno debajo del otro en móvil. Todo el anuncio abre su enlace en una pestaña nueva.

## Cambios de la v4.3.1

- **Banner de anuncio:** admite varias fotos o vídeos (una URL por línea o separadas por comas) y un texto amplio con viñetas (una viñeta por línea). Todo el banner es un único enlace: tocar el texto, una foto o un vídeo abre la página en una pestaña nueva.

## Cambios de la v4.3

- **PDF único:** un solo botón PDF, en forma de icono en la cabecera. Genera un PDF con resultados, simulación, cosidos, cabinet/electrónica y esquema de conexiones en páginas continuas, sin bloques cortados ni grandes espacios en blanco. Se eliminan los botones inferiores PDF PANTALLA y PDF CABLEADO.
- **DOCS:** el botón deja de ser público; el enlace pasa al panel de administrador.
- **AVHUB:** logo de AVHUB en la cabecera, entre el logo y los iconos, con el aviso «Nueva app en preparación» al pasar el ratón. Se elimina del pie el anuncio de VJSHOW (y su texto).
- **Versión:** se redondea la numeración a v4.3 e integra en `main` todo lo de las betas 1-4 (v4.25-v4.28).

## Cambios de la v4.28

- **Carta de ajuste:** nueva carta 4K (3840×2160) con el logo AVHUB sobre la luna, marcos de relación de aspecto (2.39:1, 1.85:1, 4:3, 1:1, 9:16), retícula, barras de color y grises; sustituye a la anterior como fondo de la pantalla simulada y del PDF.

## Cambios de la v4.27

- **Administrador:** el botón del pie y la lectura de anuncios apuntan al nuevo panel de administrador.

## Cambios de la v4.26

- **Administrador:** el panel de administrador ya está publicado; el botón del pie lo abre (acceso solo para el propietario con su cuenta de Google) y los anuncios se configuran desde él, con `ads.json` como respaldo.

## Cambios de la v4.25

- **Cabecera:** el logo deja de llevar enlace y, al pulsarlo, reinicia la app para el siguiente cálculo (como RESET). Nuevo acceso a SCREENBOX con su isotipo.
- **Información (ⓘ):** 2 opciones: INFORMACIÓN (README en ventana al 80 %, con scroll y cierre) y DESCARGAR APP.
- **Tamaño pantalla:** resumen destacado en 3 líneas justo bajo el título (medidas, cabinets y píxeles); ANCHO y ALTO arriba con la unidad completa (p. ej. «Ancho (centímetros)»), COLUMNAS y FILAS abajo, y campos más bajos.
- **Bloque cabinet:** se elimina el teclado de código de precios; stock en verde fluo y bajo pedido en naranja en el propio icono, sobre botón claro con sombra; el folleto se abre desde la web del fabricante.
- **Electrónica COEX MX2000 Pro / MX6000 Pro:** como solo son chasis, se añade el despiece: tarjetas de entrada, tarjetas de salida MX 4×OPT multimodo, módulos SFP+ 10G multimodo para sus puertos y conversores CVT10-M (que ya traen sus módulos SFP+).
- **Petición con varios pixel pitch:** se reconocen todos los pitch del texto; se usa el primero y se avisa para poder elegir otro.
- **Anuncios y administrador:** puntos de inserción activables y acceso de administrador en el pie.
- **Avisos:** el aviso «APP experimental…» pasa del pie de la pantalla a este README (en el PDF se mantiene).
- **URL principal:** la web propia de la app, con copias en GitHub Pages y Netlify.

## Cambios de la v4.24

- **PDF:** logotipo más grande y legible en la cabecera.
- **Cabecera:** logotipo en verde lima corporativo (`#ccff00`) sobre el verde oscuro.
- **Petición del cliente:** los botones de micrófono y audio pasan junto al botón PROPONER PANTALLA (más corto) y ya no tapan el texto.

## Cambios de la v4.23

- **Nueva identidad:** logotipo en SVG (`assets/logo.svg`, versión blanca para la cabecera y `assets/logo-verde.svg` para el PDF) e isotipo como favicon e icono de la app (`assets/favicon.svg` y PNG de instalación). Se eliminan el logo y el título anteriores.

## Cambios de la v4.22

- **Idiomas nativos:** toda la interfaz (menús, preguntas del asistente, resultados, esquema de conexiones, avisos y PDF) se muestra en castellano, inglés, català, galego, euskara y português según el idioma elegido, que se recuerda.
- **Petición en cualquier idioma:** el texto escrito o dictado se entiende en los seis idiomas (tipo de pantalla, medidas, pitch, alquiler/instalación, electrónica, mediaserver, etc.); el micrófono y la transcripción de audio usan el idioma elegido.
- Nota: las descripciones técnicas que vienen del catálogo (notas de producto) se traducen en las frases habituales; textos nuevos del catálogo pueden aparecer en castellano.

## Cambios de la v4.21

- **«Figura ref. 175 cm»** sobre la línea de suelo, pegada a la izquierda del monigote.
- **Distancia de visionado** en 3 líneas (título, mínima, óptima) bajo SIMULAR CONTENIDO.
- **Tarjeta de cabinet más compacta:** en una sola fila, giro 90°, icono de stock (verde) o bajo pedido (naranja) y brochure.
- **Popup de descarga:** texto simplificado.

## Cambios de la v4.20

- **Elevación desde el suelo:** el slider del panel lateral se sustituye por botones ▼ / ▲ (10 cm) junto al texto «Elevación desde el suelo» en la simulación; evita cambios accidentales con el dedo en móvil.
- **Catálogo protegido:** solo se usa el catálogo de modelos; se guarda cifrado en el dispositivo y no se muestra ni exporta.

- **Iconos nuevos** en cabecera (info, descarga, idioma), secciones (tipo de pantalla, pitch, nits, cabinet, tamaño, cosido, resolución), micro y audio, contenido, tarjetas de características y pie. Icono de la app en `assets/` (favicon, icono de instalación).
- **Cabecera** más baja y con tres botones: información, descarga y idioma.
- **Descarga para uso sin conexión:** botón con popup (DESCARGAR APP / CANCELAR). Guarda la app, sus recursos y una copia cifrada del catálogo; funciona sin internet y se actualiza sola al volver a tener conexión. Instalable como aplicación (`manifest.json` y `sw.js`).
- **Idiomas:** popup con banderas (castellano por defecto, inglés, català, galego, euskera y portugués) con la selección guardada. 
- **Paleta de 4 verdes** en toda la app y cabeceras de sección unificadas en VERDE OSCURO; los parpadeos usan VERDE FLUO.
- **Petición del cliente:** se elimina el texto de ayuda; en pantalla grande, bocadillos al pasar el ratón sobre el micro («Díctame lo que necesitas») y el audio («Envíame archivo de audio»).
- **Solo una resolución** («pantalla 4K de interior»): calcula la pantalla más pequeña que la alcanza, sin pedir medidas.
- **Prioridad de modelos:** 1.º en stock; INSTALL/INDOOR SMD UfixAvant (o LED protegido: HOB UfixAvant / COB UfixCOB, con pregunta si es espacio público); ESCAPARATE Slimfix; OUTDOOR Jfix (JFIXII y después JFIX-K).
- **Simulación:** vídeos sin subtítulos, cotas más ceñidas, botón SIMULAR CONTENIDO bajo el resumen y menos fondo gris.
- **Características de la pantalla:** el resumen pasa a la cabecera, tarjetas en rejilla 2×3 con iconos nuevos y gráfico de distancia a escala (pantalla, figura de 1,75 m y cuatro pitch con semáforo; el pitch elegido, destacado).
- Licencia GPL-3.0 sin cambios.

## Historial de versiones

- **v4.24.1:** el anuncio del pie pasa de VJSHOW a AVHUB (sustituido en v4.3 por el logo en la cabecera).
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

Tipografías incluidas en `assets/fonts/`: Inter y Share Tech Mono, bajo la SIL Open Font License 1.1 (textos de licencia en la misma carpeta).

## Autoría

Proyecto de [mediaservi.com](https://mediaservi.com). Si te gusta, prueba también [AVHUB](https://avhub.mediaservi.com/).
