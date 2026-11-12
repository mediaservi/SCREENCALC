// BLOCKS · idiomas (castellano, inglés y catalán) · mediaservi.com · GPL-3.0
// La interfaz se escribe en castellano. Este módulo traduce lo que se pinta: recorre los textos y los rótulos de ayuda
// (title, aria-label, placeholder) de cada trozo que se añade a la página y los cambia por su equivalente.
// Textos fijos en MAPA (castellano → [inglés, catalán]); los que llevan cifras o nombres, en REGLAS.
// El idioma es el mismo de toda la familia SCREENS (clave «screens_idioma»); la primera vez se toma el del navegador.
export const IDIOMAS = ['es', 'en', 'ca'];
export const NOMBRE = { es: 'Castellano', en: 'English', ca: 'Català' };
let actual = 'es';
export function idiomaInicial() {
  let l = null; try { l = new URLSearchParams(location.search).get('lang') || localStorage.getItem('screens_idioma'); } catch (e) {}
  if (!IDIOMAS.includes(l)) { const n = String(navigator.language || 'es').slice(0, 2).toLowerCase(); l = IDIOMAS.includes(n) ? n : 'es'; }
  actual = l; document.documentElement.lang = l; return l;
}
export const idioma = () => actual;
export function fijaIdioma(l) { if (!IDIOMAS.includes(l)) return; actual = l; try { localStorage.setItem('screens_idioma', l); } catch (e) {} document.documentElement.lang = l; }

const MAPA = {
  // cabeceras y botones generales
  'Qué es esto y cómo se usa': ['What this is and how to use it', 'Què és això i com es fa servir'],
  'PDF y versión clásica': ['PDF and classic version', 'PDF i versió clàssica'],
  'Nuevo cálculo: lo deja todo como al empezar': ['New calculation: resets everything', 'Nou càlcul: ho deixa tot com al principi'],
  'SCREENS · nuevo cálculo': ['SCREENS · new calculation', 'SCREENS · nou càlcul'],
  'Cambiar entre gris oscuro y gris claro': ['Switch between dark grey and light grey', 'Canvia entre gris fosc i gris clar'],
  'Idioma: castellano': ['Language: English', 'Idioma: català'],
  'Idioma: castellano · toca para cambiar a inglés o catalán': ['Language: English · tap to switch to Catalan or Spanish', 'Idioma: català · toca per canviar a castellà o anglès'],
  'Familia AVHUB': ['AVHUB family', 'Família AVHUB'],
  'Una': ['One', 'Una'], 'Varias': ['Several', 'Diverses'], 'LED': ['LED', 'LED'], 'Proyección': ['Projection', 'Projecció'],
  'Varias pantallas: en la versión clásica': ['Several screens: in the classic version', 'Diverses pantalles: a la versió clàssica'],
  'Proyección: en la versión clásica': ['Projection: in the classic version', 'Projecció: a la versió clàssica'],
  'Escríbela: «pantalla de 3 x 4 para exterior 3.9p a 8 m»': ['Type it: “3 x 4 screen for outdoor 3.9p at 8 m”', 'Escriu-la: «pantalla de 3 x 4 per a exterior 3.9p a 8 m»'],
  'Describe la pantalla': ['Describe the screen', 'Descriu la pantalla'],
  'Pegar una petición copiada': ['Paste a copied request', 'Enganxa una petició copiada'],
  'Copiar el texto de la casilla (la petición o el resultado)': ['Copy the text in the box (the request or the result)', 'Copia el text de la casella (la petició o el resultat)'],
  'Resultado del cálculo. Toca para escribir otra petición': ['Calculation result. Tap to type another request', 'Resultat del càlcul. Toca per escriure una altra petició'],
  'Dictar la petición con el micrófono': ['Dictate the request with the microphone', 'Dicta la petició amb el micròfon'],
  'Pasar a texto una nota de voz (archivo de audio)': ['Turn a voice note (audio file) into text', 'Passa a text una nota de veu (arxiu d’àudio)'],
  'CALCULAR →': ['CALCULATE →', 'CALCULA →'],
  'Cálculo automático por IA: verifícalo antes de presupuestar.': ['Automatic AI calculation: check it before quoting.', 'Càlcul automàtic per IA: verifica’l abans de pressupostar.'],
  '· 2026 · es un proyecto hecho con ♥ by mediaservi.com ·': ['· 2026 · is a project made with ♥ by mediaservi.com ·', '· 2026 · és un projecte fet amb ♥ by mediaservi.com ·'],
  'Aviso legal': ['Legal notice', 'Avís legal'],
  'Avisar de un fallo': ['Report a bug', 'Avisa d’un error'], 'Instalar': ['Install', 'Instal·la'],
  'Instala esta app en tu dispositivo y úsala también sin conexión.': ['Install this app on your device and use it offline too.', 'Instal·la aquesta app al teu dispositiu i fes-la servir també sense connexió.'],
  'Cerrar': ['Close', 'Tanca'], 'Anterior': ['Previous', 'Anterior'], 'Siguiente': ['Next', 'Següent'], 'Ver en grande': ['Open large', 'Obre en gran'],
  // entorno y uso
  'Entorno y uso': ['Environment and use', 'Entorn i ús'], 'Interior': ['Indoor', 'Interior'], 'Exterior': ['Outdoor', 'Exterior'], 'Escaparate': ['Window', 'Aparador'],
  'Fija': ['Fixed', 'Fixa'], 'Alquiler': ['Rental', 'Lloguer'], 'Marino / tropical': ['Marine / tropical', 'Marí / tropical'], 'Alcance público': ['Within reach', 'A l’abast'],
  'Cerca del mar o con mucha humedad: cabinets tropicalizados con contactos de oro': ['Near the sea or very humid: tropicalised cabinets with gold contacts', 'A prop del mar o amb molta humitat: cabinets tropicalitzats amb contactes d’or'],
  'Al alcance del público: LED protegido contra golpes y contacto': ['Within reach of the public: LED protected against knocks and touch', 'A l’abast del públic: LED protegit contra cops i contacte'],
  'Nits mín.': ['Min. nits', 'Nits mín.'], 'Menos brillo mínimo': ['Lower minimum brightness', 'Menys brillantor mínima'], 'Más brillo mínimo': ['Higher minimum brightness', 'Més brillantor mínima'],
  'No hay cabinets tropicalizados (GOLD) para este entorno: se muestran los normales.': ['No tropicalised (GOLD) cabinets for this environment: showing the standard ones.', 'No hi ha cabinets tropicalitzats (GOLD) per a aquest entorn: es mostren els normals.'],
  'No hay modelos de alquiler para este entorno: se muestran todos.': ['No rental models for this environment: showing all.', 'No hi ha models de lloguer per a aquest entorn: es mostren tots.'],
  'No hay modelos de instalación fija para este entorno: se muestran todos.': ['No fixed-installation models for this environment: showing all.', 'No hi ha models d’instal·lació fixa per a aquest entorn: es mostren tots.'],
  // dimensiones
  'Dimensiones': ['Dimensions', 'Dimensions'], 'Ancho': ['Width', 'Amplada'], 'Alto': ['Height', 'Alçada'], 'Unidad de las medidas': ['Measurement unit', 'Unitat de les mides'],
  'Subir Ancho': ['Increase width', 'Puja l’amplada'], 'Bajar Ancho': ['Decrease width', 'Baixa l’amplada'], 'Subir Alto': ['Increase height', 'Puja l’alçada'], 'Bajar Alto': ['Decrease height', 'Baixa l’alçada'],
  'Subir Público a': ['Increase audience distance', 'Puja la distància del públic'], 'Bajar Público a': ['Decrease audience distance', 'Baixa la distància del públic'],
  'Ajustar el alto a un formato': ['Set the height to an aspect ratio', 'Ajusta l’alçada a un format'], 'Cómo se ajusta a cabinets enteros': ['How it rounds to whole cabinets', 'Com s’ajusta a cabinets sencers'],
  'Que quepa': ['Must fit', 'Que hi càpiga'], 'Lo más cercano': ['Closest', 'El més proper'],
  'Cabinets enteros sin pasarse de la medida': ['Whole cabinets without exceeding the size', 'Cabinets sencers sense passar-se de la mida'],
  'Cabinets enteros lo más cerca posible de la medida, aunque se pase': ['Whole cabinets as close as possible to the size, even if larger', 'Cabinets sencers tan a prop com es pugui de la mida, encara que es passi'],
  'Medida real con cabinets enteros': ['Actual size with whole cabinets', 'Mida real amb cabinets sencers'],
  'Diagonal': ['Diagonal', 'Diagonal'], 'Formato': ['Aspect', 'Format'], 'Superficie': ['Area', 'Superfície'], 'Fondo': ['Depth', 'Fons'],
  // resolución y pitch
  'Resolución': ['Resolution', 'Resolució'], 'mm pitch': ['mm pitch', 'mm pitch'], 'Pitch más fino': ['Finer pitch', 'Pitch més fi'], 'Pitch más grueso': ['Coarser pitch', 'Pitch més gruixut'],
  'Público a': ['Audience at', 'Públic a'], 'Resolución de la pantalla': ['Screen resolution', 'Resolució de la pantalla'], 'Mínima': ['Minimum', 'Mínima'], 'Sin resolución mínima': ['No minimum resolution', 'Sense resolució mínima'],
  'Píxeles': ['Pixels', 'Píxels'], 'Por cabinet': ['Per cabinet', 'Per cabinet'], 'Refresco': ['Refresh', 'Refresc'],
  'Pedido': ['Asked', 'Demanat'], 'Automático': ['Automatic', 'Automàtic'], 'Por distancia': ['By distance', 'Per distància'], 'A mano': ['Manual', 'A mà'],
  'Pitch pedido por ti': ['Pitch you asked for', 'Pitch que has demanat'], 'Automático: el más fino': ['Automatic: the finest', 'Automàtic: el més fi'], 'Elegido a mano': ['Chosen by hand', 'Triat a mà'],
  // cabinet
  'Cabinet': ['Cabinet', 'Cabinet'], 'Modelo de cabinet': ['Cabinet model', 'Model de cabinet'], 'Brillo': ['Brightness', 'Brillantor'], 'sin foto': ['no photo', 'sense foto'],
  'En stock': ['In stock', 'En estoc'], 'Bajo pedido': ['To order', 'Sota comanda'],
  'Girar el cabinet 90°: se monta tumbado o de pie': ['Rotate the cabinet 90°: mounted landscape or portrait', 'Gira el cabinet 90°: es munta estirat o dret'],
  'Este cabinet es cuadrado: girarlo no cambia nada': ['This cabinet is square: rotating it changes nothing', 'Aquest cabinet és quadrat: girar-lo no canvia res'],
  'Ver la ficha completa del cabinet': ['See the full cabinet sheet', 'Mostra la fitxa completa del cabinet'],
  // simulación
  'Simulación a escala': ['Scale simulation', 'Simulació a escala'], 'Fondo de la pared': ['Wall background', 'Fons de la paret'], 'Altura': ['Height', 'Alçada'],
  'Altura del borde inferior de la pantalla sobre el suelo': ['Height of the bottom edge of the screen above the floor', 'Alçada de la vora inferior de la pantalla sobre el terra'],
  'Bajar la pantalla 10 cm': ['Lower the screen 10 cm', 'Baixa la pantalla 10 cm'], 'Subir la pantalla 10 cm': ['Raise the screen 10 cm', 'Puja la pantalla 10 cm'],
  'Simular contenido: fuentes de prueba, un enlace o un archivo tuyo': ['Simulate content: test sources, a link or your own file', 'Simula contingut: fonts de prova, un enllaç o un arxiu teu'],
  'Volver a la carta de ajuste': ['Back to the test chart', 'Torna a la carta d’ajust'], 'Copiar una captura de esta pantalla': ['Copy a capture of this view', 'Copia una captura d’aquesta pantalla'],
  'Simulación de la pantalla a escala con una persona de 1,75 m': ['Scale simulation of the screen with a 1.75 m person', 'Simulació de la pantalla a escala amb una persona d’1,75 m'],
  'Fondo hormigon': ['Concrete wall', 'Fons formigó'], 'Fondo madera': ['Wood wall', 'Fons fusta'], 'Fondo marmol': ['Marble wall', 'Fons marbre'], 'Fondo ladrillo rojo': ['Red brick wall', 'Fons maó vermell'], 'Fondo ladrillo oscuro': ['Dark brick wall', 'Fons maó fosc'], 'Fondo ladrillo claro': ['Light brick wall', 'Fons maó clar'],
  'hormigon': ['concrete', 'formigó'], 'madera': ['wood', 'fusta'], 'marmol': ['marble', 'marbre'], 'ladrillo rojo': ['red brick', 'maó vermell'], 'ladrillo oscuro': ['dark brick', 'maó fosc'], 'ladrillo claro': ['light brick', 'maó clar'],
  // cableado
  'Cableado de señal': ['Signal cabling', 'Cablejat de senyal'], 'Cableado eléctrico': ['Power cabling', 'Cablejat elèctric'], 'Distancia de visionado': ['Viewing distance', 'Distància de visionat'],
  'Señal': ['Signal', 'Senyal'], 'Eléctrico': ['Power', 'Elèctric'], 'Distancia': ['Distance', 'Distància'], 'Qué se ve en esta pantalla': ['What this view shows', 'Què es veu en aquesta pantalla'],
  'Cosido': ['Routing', 'Cosit'], 'Cosido del cableado': ['Cable routing', 'Cosit del cablejat'], 'Auto': ['Auto', 'Auto'], 'Vertical': ['Vertical', 'Vertical'], 'Horizontal': ['Horizontal', 'Horitzontal'],
  '→ vertical': ['→ vertical', '→ vertical'], '→ horizontal': ['→ horizontal', '→ horitzontal'], '→ serpentina': ['→ serpentine', '→ serpentina'],
  'No cabe así: vertical': ['Does not fit: vertical', 'No hi cap així: vertical'], 'No cabe así: horizontal': ['Does not fit: horizontal', 'No hi cap així: horitzontal'], 'No cabe así: serpentina': ['Does not fit: serpentine', 'No hi cap així: serpentina'],
  'vertical (auto)': ['vertical (auto)', 'vertical (auto)'], 'horizontal (auto)': ['horizontal (auto)', 'horitzontal (auto)'], 'serpentina (auto)': ['serpentine (auto)', 'serpentina (auto)'], 'horizontal': ['horizontal', 'horitzontal'], 'serpentina': ['serpentine', 'serpentina'],
  'Reparto de cabinets por puerto de datos': ['Cabinets per data port', 'Repartiment de cabinets per port de dades'], 'Reparto de cabinets por línea eléctrica': ['Cabinets per power line', 'Repartiment de cabinets per línia elèctrica'],
  'Distancias de visionado': ['Viewing distances', 'Distàncies de visionat'], 'CERCA': ['CLOSE', 'A PROP'], 'ACEPTABLE': ['ACCEPTABLE', 'ACCEPTABLE'], 'ÓPTIMA': ['OPTIMAL', 'ÒPTIMA'],
  'Regla práctica: 1 m por cada mm de pitch como mínimo; lo óptimo, desde el triple.': ['Rule of thumb: at least 1 m per mm of pitch; optimal from three times that.', 'Regla pràctica: 1 m per cada mm de pitch com a mínim; l’òptim, des del triple.'],
  // cifras
  'Cabinets': ['Cabinets', 'Cabinets'], 'ud': ['pcs', 'ut'], 'Col.': ['Col.', 'Col.'], 'Fil.': ['Row', 'Fil.'], 'Peso': ['Weight', 'Pes'],
  'Una columna menos': ['One column fewer', 'Una columna menys'], 'Una columna más': ['One more column', 'Una columna més'], 'Una fila menos': ['One row fewer', 'Una fila menys'], 'Una fila más': ['One more row', 'Una fila més'],
  'Alimentación': ['Power', 'Alimentació'], 'kW máx.': ['kW max.', 'kW màx.'], 'Corriente': ['Current', 'Corrent'], 'Líneas de 16 A': ['16 A lines', 'Línies de 16 A'], 'Ver el reparto eléctrico': ['See the power layout', 'Mostra el repartiment elèctric'],
  'línea Ethernet': ['Ethernet line', 'línia Ethernet'], 'líneas Ethernet': ['Ethernet lines', 'línies Ethernet'], 'Backup': ['Backup', 'Backup'], 'Con': ['On', 'Amb'], 'Sin': ['Off', 'Sense'],
  'Conexión': ['Connection', 'Connexió'], 'Fibra': ['Fibre', 'Fibra'], 'Salidas 4K': ['4K outputs', 'Sortides 4K'], 'Ver el cableado de señal': ['See the signal cabling', 'Mostra el cablejat de senyal'],
  'Del procesador a los cabinets por cable de red': ['From the processor to the cabinets over network cable', 'Del processador als cabinets per cable de xarxa'],
  'Del procesador a los cabinets por fibra óptica': ['From the processor to the cabinets over optical fibre', 'Del processador als cabinets per fibra òptica'],
  'Electrónica': ['Electronics', 'Electrònica'], 'Procesador': ['Processor', 'Processador'], 'Puertos': ['Ports', 'Ports'], 'Escalador': ['Scaler', 'Escalador'], 'Igual': ['Either', 'Igual'],
  'Mediaserver': ['Media server', 'Mediaserver'], 'Sí': ['Yes', 'Sí'], 'No': ['No', 'No'], 'Modelo': ['Model', 'Model'],
  'Elegir otro procesador de los que valen para este proyecto': ['Choose another processor that suits this project', 'Tria un altre processador dels que serveixen per a aquest projecte'],
  'Da igual que el procesador lleve escalador o no': ['It does not matter whether the processor has a scaler', 'Tant és que el processador porti escalador o no'],
  'Añadir un servidor de contenidos': ['Add a content server', 'Afegeix un servidor de continguts'], 'Ver la electrónica completa': ['See all the electronics', 'Mostra tota l’electrònica'],
  'Sin procesador que cubra este proyecto con estas opciones: cambia el backup, la conexión o el escalador.': ['No processor covers this project with these options: change the backup, the connection or the scaler.', 'Cap processador cobreix aquest projecte amb aquestes opcions: canvia el backup, la connexió o l’escalador.'],
  // mediaserver
  'Añadir': ['Add', 'Afegeix'], 'Marca': ['Brand', 'Marca'], 'Todas': ['All', 'Totes'], 'Nova': ['Nova', 'Nova'], 'Pixel': ['Pixel', 'Pixel'], 'Audio Dante': ['Dante audio', 'Àudio Dante'],
  'Solo servidores con audio por red Dante': ['Only servers with Dante network audio', 'Només servidors amb àudio per xarxa Dante'],
  'Elegir otro mediaserver de los que valen para este proyecto': ['Choose another media server that suits this project', 'Tria un altre mediaserver dels que serveixen per a aquest projecte'],
  'Ningún mediaserver cubre este proyecto con esta marca y estas opciones.': ['No media server covers this project with this brand and these options.', 'Cap mediaserver cobreix aquest projecte amb aquesta marca i aquestes opcions.'],
  'Servidor de contenidos para la pantalla. Actívalo si el proyecto lo lleva.': ['Content server for the screen. Turn it on if the project includes one.', 'Servidor de continguts per a la pantalla. Activa’l si el projecte en porta.'],
  'Ver la ficha del mediaserver': ['See the media server sheet', 'Mostra la fitxa del mediaserver'],
  // sin catálogo
  'Cargando el catálogo…': ['Loading the catalogue…', 'Carregant el catàleg…'],
  'No se ha podido leer el catálogo. Comprueba la conexión y vuelve a cargar.': ['The catalogue could not be read. Check your connection and reload.', 'No s’ha pogut llegir el catàleg. Comprova la connexió i torna a carregar.'],
  'No hay modelos en el catálogo para este entorno.': ['There are no models in the catalogue for this environment.', 'No hi ha models al catàleg per a aquest entorn.'],
  // fichas de equipos
  'Equipos del proyecto': ['Project equipment', 'Equips del projecte'], 'Cabinet LED': ['LED cabinet', 'Cabinet LED'], 'Procesador recomendado': ['Recommended processor', 'Processador recomanat'], 'Procesador alternativo': ['Alternative processor', 'Processador alternatiu'],
  'Consumo máx.': ['Max. power', 'Consum màx.'], 'Tecnología': ['Technology', 'Tecnologia'], 'Capacidad': ['Capacity', 'Capacitat'], 'Tarjeta': ['Card', 'Targeta'], 'Ficha del fabricante ↗': ['Manufacturer sheet ↗', 'Fitxa del fabricant ↗'], 'STOCK': ['STOCK', 'ESTOC'], 'PEDIDO': ['TO ORDER', 'COMANDA'],
  // contenido de la pantalla
  'Contenido de la pantalla': ['Screen content', 'Contingut de la pantalla'], 'Fuentes multimedia de prueba': ['Test media sources', 'Fonts multimèdia de prova'], 'Elegir esta fuente': ['Choose this source', 'Tria aquesta font'],
  'Vacía · pega aquí un enlace': ['Empty · paste a link here', 'Buida · enganxa aquí un enllaç'],
  'Las fuentes 2 a 6 se pueden editar; la primera es fija. Se guardan en este navegador, las mismas que en la versión clásica.': ['Sources 2 to 6 can be edited; the first one is fixed. They are saved in this browser, the same as in the classic version.', 'Les fonts 2 a 6 es poden editar; la primera és fixa. Es desen en aquest navegador, les mateixes que a la versió clàssica.'],
  'O usa tu propio contenido': ['Or use your own content', 'O fes servir el teu contingut'], 'Pega un enlace de YouTube, Vimeo, imagen o vídeo': ['Paste a YouTube, Vimeo, image or video link', 'Enganxa un enllaç de YouTube, Vimeo, imatge o vídeo'],
  'Enlace de tu contenido': ['Link to your content', 'Enllaç del teu contingut'], 'Subir imagen / vídeo': ['Upload image / video', 'Puja imatge / vídeo'], 'APLICAR': ['APPLY', 'APLICA'], 'Reiniciar': ['Reset', 'Reinicia'],
  'Volver a la carta de ajuste inicial': ['Back to the initial test chart', 'Torna a la carta d’ajust inicial'],
  // información
  'Información': ['Information', 'Informació'], 'SCREENS · una pantalla LED': ['SCREENS · one LED screen', 'SCREENS · una pantalla LED'], 'Ver la guía rápida': ['See the quick guide', 'Mostra la guia ràpida'],
  'Cómo se usa.': ['How to use it.', 'Com es fa servir.'], 'Las dos pantallas.': ['The two views.', 'Les dues pantalles.'], 'Cada opción en su bloque.': ['Each option in its block.', 'Cada opció al seu bloc.'],
  'Escribe o dicta arriba la pantalla que necesitas («3 x 4 para exterior 3.9p a 8 m») y pulsa CALCULAR, o rellena los bloques de la izquierda: entorno y uso, dimensiones, cabinet y resolución. Todo se recalcula al momento.': ['Type or dictate at the top the screen you need (“3 x 4 for outdoor 3.9p at 8 m”) and press CALCULATE, or fill in the blocks on the left: environment and use, dimensions, cabinet and resolution. Everything recalculates instantly.', 'Escriu o dicta a dalt la pantalla que necessites («3 x 4 per a exterior 3.9p a 8 m») i prem CALCULA, o omple els blocs de l’esquerra: entorn i ús, dimensions, cabinet i resolució. Tot es recalcula a l’instant.'],
  'A la izquierda, la simulación a escala: puedes cambiar la pared, simular contenido (fuentes de prueba, un enlace de YouTube o Vimeo, o una imagen o vídeo tuyos), copiar una captura y abrirla en grande con el ojo. A la derecha, el cableado de señal, el eléctrico y la distancia de visionado.': ['On the left, the scale simulation: you can change the wall, simulate content (test sources, a YouTube or Vimeo link, or your own image or video), copy a capture and open it large with the eye. On the right, the signal cabling, the power cabling and the viewing distance.', 'A l’esquerra, la simulació a escala: pots canviar la paret, simular contingut (fonts de prova, un enllaç de YouTube o Vimeo, o una imatge o vídeo teus), copiar una captura i obrir-la en gran amb l’ull. A la dreta, el cablejat de senyal, l’elèctric i la distància de visionat.'],
  'Las unidades, los formatos y el ajuste a la medida están en Dimensiones; marino, alcance del público y nits mínimos en Entorno; el pitch, la distancia del público y la resolución mínima en Resolución; columnas y filas en Cabinets; el giro de 90° en Cabinet; la altura sobre el suelo en la simulación; el cosido en el cableado de señal; backup y conexión en Señal; el escalador y el procesador en Electrónica; marca, Dante y modelo en Mediaserver. El icono de reinicio de arriba, o un toque en el logo de SCREENS, empieza un cálculo nuevo.': ['Units, aspect ratios and size rounding are in Dimensions; marine, public reach and minimum nits in Environment; pitch, audience distance and minimum resolution in Resolution; columns and rows in Cabinets; the 90° rotation in Cabinet; the height above the floor in the simulation; the routing in the signal cabling; backup and connection in Signal; scaler and processor in Electronics; brand, Dante and model in Media server. The reset icon at the top, or a tap on the SCREENS logo, starts a new calculation.', 'Les unitats, els formats i l’ajust a la mida són a Dimensions; marí, abast del públic i nits mínims a Entorn; el pitch, la distància del públic i la resolució mínima a Resolució; columnes i files a Cabinets; el gir de 90° a Cabinet; l’alçada sobre el terra a la simulació; el cosit al cablejat de senyal; backup i connexió a Senyal; l’escalador i el processador a Electrònica; marca, Dante i model a Mediaserver. La icona de reinici de dalt, o un toc al logo de SCREENS, comença un càlcul nou.'],
  'El PDF, la sala inmersiva y la proyección siguen en la versión clásica (botón del documento). Cálculo automático que puede contener errores: verifícalo antes de presupuestar o instalar.': ['The PDF, the immersive room and projection are still in the classic version (document button). Automatic calculation that may contain errors: check it before quoting or installing.', 'El PDF, la sala immersiva i la projecció continuen a la versió clàssica (botó del document). Càlcul automàtic que pot contenir errors: verifica’l abans de pressupostar o instal·lar.'],
  // guía rápida
  'Guía rápida': ['Quick guide', 'Guia ràpida'], 'Hola 👋': ['Hi 👋', 'Hola 👋'],
  'Hay dos formas de calcular una pantalla LED. Te las enseño en tres pasos.': ['There are two ways to calculate an LED screen. Here they are in three steps.', 'Hi ha dues maneres de calcular una pantalla LED. Te les ensenyo en tres passos.'],
  '1 · Dímelo': ['1 · Tell me', '1 · Digues-m’ho'], 'Escribe, dicta o suelta un audio con lo que necesitas y pulsa CALCULAR.': ['Type, dictate or drop an audio with what you need and press CALCULATE.', 'Escriu, dicta o deixa anar un àudio amb el que necessites i prem CALCULA.'],
  '2 · O elige con los botones': ['2 · Or pick with the buttons', '2 · O tria amb els botons'], 'Entorno, medidas, cabinet y resolución. Se calcula al momento.': ['Environment, size, cabinet and resolution. It calculates instantly.', 'Entorn, mides, cabinet i resolució. Es calcula a l’instant.'],
  '3 · Y retócalo': ['3 · And fine-tune it', '3 · I retoca-ho'], 'Lo que salga se puede cambiar desde los mismos botones: todo se recalcula solo.': ['Whatever comes out can be changed with the same buttons: everything recalculates by itself.', 'El que surti es pot canviar des dels mateixos botons: tot es recalcula sol.'],
  'Cerrar guía': ['Close guide', 'Tanca la guia'], 'Siguiente →': ['Next →', 'Següent →'], 'Empezar': ['Start', 'Comença'],
  // avisos
  'Audio pasado a texto: revísalo y pulsa CALCULAR.': ['Audio turned into text: check it and press CALCULATE.', 'Àudio passat a text: revisa’l i prem CALCULA.'],
  'Captura copiada: pégala donde quieras (Ctrl+V).': ['Capture copied: paste it anywhere (Ctrl+V).', 'Captura copiada: enganxa-la on vulguis (Ctrl+V).'],
  'Contenido aplicado a la pantalla.': ['Content applied to the screen.', 'Contingut aplicat a la pantalla.'],
  'Contenido puesto en la pantalla. La flecha circular vuelve a la carta de ajuste.': ['Content placed on the screen. The circular arrow goes back to the test chart.', 'Contingut posat a la pantalla. La fletxa circular torna a la carta d’ajust.'],
  'Dictado listo: pulsa CALCULAR.': ['Dictation ready: press CALCULATE.', 'Dictat a punt: prem CALCULA.'],
  'Esa fuente está vacía: se queda la carta de ajuste.': ['That source is empty: keeping the test chart.', 'Aquesta font és buida: es queda la carta d’ajust.'],
  'Este navegador no deja copiar desde aquí.': ['This browser does not allow copying from here.', 'Aquest navegador no deixa copiar des d’aquí.'],
  'Este navegador no deja copiar imágenes: la captura se ha descargado.': ['This browser does not allow copying images: the capture has been downloaded.', 'Aquest navegador no deixa copiar imatges: la captura s’ha descarregat.'],
  'Este navegador no deja pegar con el botón: usa Ctrl+V en la casilla.': ['This browser does not allow pasting with the button: use Ctrl+V in the box.', 'Aquest navegador no deixa enganxar amb el botó: fes servir Ctrl+V a la casella.'],
  'Este navegador no tiene dictado por voz.': ['This browser has no voice dictation.', 'Aquest navegador no té dictat per veu.'],
  'La casilla está vacía: no hay nada que copiar.': ['The box is empty: nothing to copy.', 'La casella és buida: no hi ha res a copiar.'],
  'No hay texto copiado que pegar.': ['There is no copied text to paste.', 'No hi ha text copiat per enganxar.'],
  'No he entendido la petición: prueba con «3 x 2 interior» o usa los botones.': ['I did not understand the request: try “3 x 2 indoor” or use the buttons.', 'No he entès la petició: prova amb «3 x 2 interior» o fes servir els botons.'],
  'No se ha entendido nada en ese audio.': ['Nothing could be understood in that audio.', 'No s’ha entès res en aquest àudio.'],
  'No se ha podido hacer la captura.': ['The capture could not be made.', 'No s’ha pogut fer la captura.'], 'No se ha podido leer ese audio.': ['That audio could not be read.', 'No s’ha pogut llegir aquest àudio.'],
  'Nuevo cálculo: todo vuelve a como al empezar.': ['New calculation: everything is back to the start.', 'Nou càlcul: tot torna a com al principi.'],
  'Pantalla reiniciada: vuelve la carta de ajuste.': ['Screen reset: the test chart is back.', 'Pantalla reiniciada: torna la carta d’ajust.'],
  'Pasando el audio a texto… la primera vez tarda un poco.': ['Turning the audio into text… the first time takes a while.', 'Passant l’àudio a text… la primera vegada triga una mica.'],
  'Petición copiada.': ['Request copied.', 'Petició copiada.'], 'Petición pegada: pulsa CALCULAR.': ['Request pasted: press CALCULATE.', 'Petició enganxada: prem CALCULA.'],
  'Resultado copiado: pégalo en WhatsApp o donde quieras.': ['Result copied: paste it into WhatsApp or anywhere.', 'Resultat copiat: enganxa’l a WhatsApp o on vulguis.'],
  'Te escucho: di la pantalla que necesitas y pulsa otra vez el micrófono al acabar.': ['Listening: say the screen you need and press the microphone again when done.', 'T’escolto: digues la pantalla que necessites i torna a prémer el micròfon en acabar.'],
  'SCREENS necesita JavaScript.': ['SCREENS needs JavaScript.', 'SCREENS necessita JavaScript.']
};
const k = (l) => (l === 'en' ? 0 : 1);
// textos con cifras o nombres: [expresión, (trozos, idioma) => texto]
const REGLAS = [
  [/^PANTALLA LED (.+?) · (.+ cm · .+″ · .+ = \d+) cabinets · (.+ px)(?: · (.+ kg · .+ kW) · (\d+) líneas?)?$/, (m, l) => `${['LED SCREEN', 'PANTALLA LED'][k(l)]} ${m[1]} · ${m[2]} cabinets · ${m[3]}` + (m[4] ? ` · ${m[4]} · ${m[5]} ${[+m[5] > 1 ? 'lines' : 'line', +m[5] > 1 ? 'línies' : 'línia'][k(l)]}` : '')],
  [/^Con (.+)p se ve bien desde (.+) \(óptimo desde (.+)\)\.$/, (m, l) => [`With ${m[1]}p it looks good from ${m[2]} (optimal from ${m[3]}).`, `Amb ${m[1]}p es veu bé des de ${m[2]} (òptim des de ${m[3]}).`][k(l)]],
  [/^ANCHO (.+)$/, (m, l) => ['WIDE ', 'AMPLE '][k(l)] + m[1]], [/^ALTO (.+)$/, (m, l) => ['TALL ', 'ALT '][k(l)] + m[1]],
  [/^cm · medida exacta$/, (m, l) => ['cm · exact size', 'cm · mida exacta'][k(l)]],
  [/^cm · (sobran|faltan) (.+)$/, (m, l) => 'cm · ' + [m[1] === 'sobran' ? 'spare ' : 'short ', m[1] === 'sobran' ? 'sobren ' : 'falten '][k(l)] + m[2]],
  [/^px · 8K$/, () => 'px · 8K'],
  [/^Cercano a (.+)$/, (m, l) => ['Closest to ', 'Proper a '][k(l)] + m[1]], [/^Por (HD|FHD|4K)$/, (m, l) => ['For ', 'Per '][k(l)] + m[1]], [/^No llega a (.+)$/, (m, l) => ['Short of ', 'No arriba a '][k(l)] + m[1]],
  [/^El más cercano al (.+) que pediste$/, (m, l) => [`The closest to the ${m[1]} you asked for`, `El més proper al ${m[1]} que has demanat`][k(l)]],
  [/^Elegido por la distancia del público: (.+)$/, (m, l) => ['Chosen by the audience distance: ', 'Triat per la distància del públic: '][k(l)] + m[1]],
  [/^Elegido para llegar a (.+)$/, (m, l) => ['Chosen to reach ', 'Triat per arribar a '][k(l)] + m[1]],
  [/^Ningún pitch llega a (.+) con esta medida: el más fino$/, (m, l) => [`No pitch reaches ${m[1]} at this size: the finest`, `Cap pitch arriba a ${m[1]} amb aquesta mida: el més fi`][k(l)]],
  [/^Pitch (\d+) de (\d+) disponibles$/, (m, l) => [`Pitch ${m[1]} of ${m[2]} available`, `Pitch ${m[1]} de ${m[2]} disponibles`][k(l)]],
  [/^Pone el alto que corresponde a (.+) con este ancho$/, (m, l) => [`Sets the height for ${m[1]} at this width`, `Posa l’alçada que correspon a ${m[1]} amb aquesta amplada`][k(l)]],
  [/^Esta pantalla (no )?llega a (.+)\. Pulsa para elegir el pitch que llegue al menos a (.+)$/, (m, l) => [`This screen ${m[1] ? 'does not reach' : 'reaches'} ${m[2]}. Press to pick the pitch that reaches at least ${m[3]}`, `Aquesta pantalla ${m[1] ? 'no ' : ''}arriba a ${m[2]}. Prem per triar el pitch que arribi almenys a ${m[3]}`][k(l)]],
  [/^Duplica las líneas de datos: \+ (\d+) de reserva$/, (m, l) => [`Duplicates the data lines: + ${m[1]} spare`, `Duplica les línies de dades: + ${m[1]} de reserva`][k(l)]],
  [/^(.+) · (con|sin) escalador$/, (m, l) => m[1] + ' · ' + [m[2] === 'con' ? 'with scaler' : 'no scaler', m[2] === 'con' ? 'amb escalador' : 'sense escalador'][k(l)]],
  [/^(\d+) líneas? \+ (\d+) backup \(de (.+)\)$/, (m, l) => [`${m[1]} line${+m[1] > 1 ? 's' : ''} + ${m[2]} backup (of ${m[3]})`, `${m[1]} líni${+m[1] > 1 ? 'es' : 'a'} + ${m[2]} backup (de ${m[3]})`][k(l)]],
  [/^(\d+) líneas? \(de (.+)\)$/, (m, l) => [`${m[1]} line${+m[1] > 1 ? 's' : ''} (of ${m[2]})`, `${m[1]} líni${+m[1] > 1 ? 'es' : 'a'} (de ${m[2]})`][k(l)]],
  [/^(\d+) fibras? (.*)\(de (.+)\)$/, (m, l) => [`${m[1]} fibre${+m[1] > 1 ? 's' : ''} ${m[2]}(of ${m[3]})`, `${m[1]} fibr${+m[1] > 1 ? 'es' : 'a'} ${m[2]}(de ${m[3]})`][k(l)]],
  [/^(.+) · (\d+) salidas? 4K \(hacen falta (\d+)\)$/, (m, l) => [`${m[1]} · ${m[2]} 4K output${+m[2] > 1 ? 's' : ''} (${m[3]} needed)`, `${m[1]} · ${m[2]} sortid${+m[2] > 1 ? 'es' : 'a'} 4K (en calen ${m[3]})`][k(l)]],
  [/^(.+) · stock$/, (m, l) => m[1] + [' · stock', ' · estoc'][k(l)]], [/^(.+) · recomendado$/, (m, l) => m[1] + [' · recommended', ' · recomanat'][k(l)]],
  [/^mínima (.+)$/, (m, l) => ['minimum ', 'mínima '][k(l)] + m[1]], [/^óptima desde (.+)$/, (m, l) => ['optimal from ', 'òptima des de '][k(l)] + m[1]], [/^tu público · (.+)$/, (m, l) => ['your audience · ', 'el teu públic · '][k(l)] + m[1]],
  [/^… y (\d+) más$/, (m, l) => [`… and ${m[1]} more`, `… i ${m[1]} més`][k(l)]],
  [/^Enlace de la fuente (\d+)$/, (m, l) => ['Link for source ', 'Enllaç de la font '][k(l)] + m[1]],
  [/^es la nueva interfaz de AVHUB: la pantalla no se desplaza y cada dato tiene siempre su sitio\. Esta es una beta de prueba \((.+)\)\.$/, (m, l) => [`is the new AVHUB interface: the page does not scroll and every figure always has its place. This is a test beta (${m[1]}).`, `és la nova interfície d’AVHUB: la pantalla no es desplaça i cada dada té sempre el seu lloc. Aquesta és una beta de prova (${m[1]}).`][k(l)]],
  [/^SCREENS (v[\d.]+) · 2026 · es un proyecto hecho con ♥ by mediaservi\.com ·$/, (m, l) => [`SCREENS ${m[1]} · 2026 · is a project made with ♥ by mediaservi.com ·`, `SCREENS ${m[1]} · 2026 · és un projecte fet amb ♥ by mediaservi.com ·`][k(l)]]
];
/* traduce un texto suelto (para lo que no pasa por la página, como lo que se copia) */
export function tr(es) {
  if (actual === 'es' || es == null) return es;
  const t = String(es), c = t.replace(/\s+/g, ' ').trim(); if (!c) return es;
  const d = MAPA[c]; if (d) return t.replace(t.trim(), d[k(actual)]);
  for (const [re, f] of REGLAS) { const m = c.match(re); if (m) return t.replace(t.trim(), f(m, actual)); }
  return es;
}
const ATR = ['title', 'aria-label', 'placeholder'];
function pasa(nodo) {
  if (nodo.nodeType === 3) { const p = nodo.parentNode; if (p && !p.closest('script, style, input, textarea, [data-crudo]')) { const n = tr(nodo.nodeValue); if (n !== nodo.nodeValue) nodo.nodeValue = n; } return; }
  if (nodo.nodeType !== 1) return;
  const w = document.createTreeWalker(nodo, NodeFilter.SHOW_TEXT); let x; const ts = []; while ((x = w.nextNode())) ts.push(x); ts.forEach(pasa);
  [nodo, ...nodo.querySelectorAll('[title], [aria-label], [placeholder]')].forEach((e) => { if (e.getAttribute) ATR.forEach((a) => { const v = e.getAttribute(a); if (v) { const n = tr(v); if (n !== v) e.setAttribute(a, n); } }); });
}
/* se queda mirando la página y traduce cada trozo nuevo que se pinta */
export function vigila() {
  if (actual === 'es') return;
  pasa(document.body);
  new MutationObserver((ms) => { ms.forEach((m) => { if (m.type === 'childList') m.addedNodes.forEach(pasa); else if (m.type === 'characterData') pasa(m.target); else if (m.type === 'attributes') { const v = m.target.getAttribute(m.attributeName); if (v) { const n = tr(v); if (n !== v) m.target.setAttribute(m.attributeName, n); } } }); })
    .observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATR });
}
