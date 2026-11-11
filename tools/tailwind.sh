#!/bin/sh
# SCREENS · regenera assets/tailwind.css a partir de las clases que usa led.html. Ejecutar desde la raíz del repositorio tras añadir clases nuevas.
# Se quitan del análisis las líneas gigantes (librerías incrustadas), que no llevan clases y lo hacen eterno.
set -e
awk 'length($0) < 50000' led.html > tools/.tw-contenido.html
npx --yes tailwindcss@3.4.17 -c tools/tailwind.config.js -i tools/tailwind.in.css -o assets/tailwind.css --minify
rm -f tools/.tw-contenido.html
