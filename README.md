Essence by M&C
Catálogo web de perfumería — María Fernanda & Carlos.
Estructura del proyecto
```
essence-mc/
├── index.html          → portada con las tres puertas (Mujer, Hombre, Unisex)
├── mujer.html          → colección femenina
├── hombre.html         → colección masculina
├── unisex.html         → colección unisex
├── css/styles.css      → estilos (colores, tipografía, layout)
├── img/                → aquí van las fotos de cada perfume
├── js/data.js          → catálogo de fragancias (edítalo para agregar/quitar productos)
├── js/script.js        → contadores de la portada, filtros y renderizado
└── README.md
```
Cada botón de la portada abre su propia página (no hace scroll dentro de la misma). Las tres páginas de colección usan el mismo código; solo cambian el título, el color y el atributo `data-genero` del `<body>`.
Cómo agregar las fotos de los perfumes
Guarda la foto del frasco dentro de la carpeta `img/`. Usa nombres simples y sin espacios ni tildes, por ejemplo: `sauvage.jpg`, `good-girl.jpg`, `212-vip-men.jpg`.
Ve al archivo `js/data.js` y busca la fragancia correspondiente. Escribe el nombre del archivo en el campo `imagen`:
```js
{ id: 57, nombre: "Sauvage", marca: "Dior", genero: "hombre", momento: "dia", notas: ["Fresco","Amaderado","Especiado"], destacado: true, imagen: "sauvage.jpg" }
```
Guarda y listo — la foto aparecerá automáticamente en su tarjeta (el sitio la busca solo en la carpeta `img/`).
Mientras el campo `imagen` esté vacío (`imagen: ""`), la tarjeta muestra un espacio reservado con el texto "Agregar foto".
Recomendación: fotos en formato vertical (proporción 4:5, por ejemplo 800×1000 px), fondo neutro o blanco y buena luz.
Cómo agregar o editar fragancias
Todo el catálogo vive en `js/data.js`. Cada fragancia es un bloque así:
```js
{ id: 64, nombre: "Nombre del perfume", marca: "Marca", genero: "mujer", momento: "dia", notas: ["Floral", "Frutal"] }
```
`genero`: `"mujer"`, `"hombre"` o `"unisex"`. Cada fragancia aparece solo en la página de su género (un unisex ya no se repite en Mujer y Hombre). Para mover un perfume de colección, cambia este campo.
`momento`: `"dia"` o `"noche"`.
`notas`: lista de familias olfativas — los filtros se generan solos según lo que escribas aquí.
`destacado: true` (opcional) — le pone una etiqueta "Favorito".
`ml` (opcional): tipo y contenido, por ejemplo `"Eau de Parfum · 100 ml"`.
`tipo` (opcional): el tipo de producto, por ejemplo `tipo: "Original"` o `tipo: "Árabe"` (escribe la palabra que quieras). Aparece como etiqueta en la tarjeta y, en cuanto una fragancia de la colección tenga tipo, aparece solo el filtro "Todos los tipos". Si lo dejas sin escribir, no se muestra nada.
`precio` (opcional): escríbelo como número, sin puntos ni símbolos: `precio: 189000` se muestra como "$ 189.000" al fondo de la tarjeta. También acepta texto (`precio: "Desde $150.000"`). Si lo dejas vacío (`precio: ""`) la tarjeta muestra "Consultar".
No necesitas tocar el HTML ni el CSS para actualizar el catálogo, solo este archivo.
Pedidos por WhatsApp y "Mi lista"
Cada tarjeta tiene el botón Pedir por WhatsApp: abre el chat con el mensaje ya escrito con el nombre del perfume.
El corazón de cada tarjeta lo guarda en Mi lista. El cliente puede armar su lista (se conserva en su navegador, entre páginas) y enviarla completa por WhatsApp.
Abajo a la derecha hay un botón flotante de WhatsApp y el de Mi lista, visibles en todas las páginas.
El número de WhatsApp está en `js/script.js` (constante `WHATSAPP`, al inicio) y también en los enlaces de contacto de los 4 `.html`.
Portada: confianza, favoritos y preguntas
Franja de confianza y Preguntas frecuentes: el texto está en `index.html` (busca `trust-list` y `faq-list`). Edítalo si cambian los tiempos o las formas de pago.
Nuestros favoritos: se llena solo con las fragancias que tengan `destacado: true` en `data.js`.
Vista previa al compartir el link
Al compartir la página en WhatsApp o Instagram se muestra la imagen `img/og-portada.png`. Las etiquetas `og:image` de los 4 `.html` apuntan a `https://essencebymc.github.io/EssenceByMC/img/og-portada.png`. Cuando cambien al dominio propio, hay que actualizar esa dirección en los 4 `.html`.
Buscador y SEO
Buscador de la portada: busca en todo el catálogo (nombre o marca, sin importar tildes) y lleva a la colección con la fragancia ya buscada. Todo sale de `js/data.js`, no hay que configurar nada.
Datos estructurados: cada página de colección agrega sola, para Google, el nombre, marca, notas, foto y precio de cada perfume. La portada tiene los datos de la tienda (nombre, Instagram y WhatsApp).
`sitemap.xml` y `robots.txt`: están en la carpeta principal. Cuando cambien al dominio propio, hay que cambiar `essencebymc.github.io/EssenceByMC` por el dominio nuevo en `sitemap.xml`, `robots.txt`, la etiqueta `og:image` de los 4 `.html` y el dato `url`/`logo` de `index.html`.
Oferta de la semana
En la portada hay una sección que cambia sola cada lunes (hora de Colombia): un perfume de mujer y uno de hombre con descuento, más un precio de combo si se llevan los dos. La oferta vale hasta el domingo.
Elige entre los perfumes de mujer y de hombre que tengan `precio` numérico. El orden es mezclado pero fijo: recorre todos sin repetir hasta pasar por todos.
Descuentos: 5 % para perfumes de menos de $200.000 y 10 % para los de $200.000 o más. Combo: 5 % adicional sobre la suma de los dos ya con descuento. Se cambian en `js/script.js`, en el bloque `OFERTA` (busca `descuentos` y `comboExtra`).
Para excluir un perfume del sorteo (por ejemplo, si se agotó), agrega `sinOferta: true` en su línea de `js/data.js`.
En las páginas de colección, el perfume en oferta muestra el precio con descuento y su botón de WhatsApp pide el precio de la oferta.
Si agregas o quitas perfumes de `data.js`, el orden de la rotación se vuelve a mezclar.
Franja de fotos de la portada
La franja que se mueve detrás del nombre se llena sola con las fotos de `js/data.js` (las fragancias que tengan el campo `imagen`). Con 4 o más fotos pasan las fotos; mientras tanto pasan los nombres de las fragancias. No hay que configurar nada.
Cómo cambiar los colores
Los tres temas están al inicio de `css/styles.css`, en los bloques `.theme-mujer`, `.theme-hombre` y `.theme-unisex`. Cambia ahí `--bg`, `--accent` y compañía y se actualiza toda la página de esa colección.
Cómo publicarlo en GitHub Pages (gratis)
Entra al repositorio `essence-by-mc` en GitHub.
Sube todos los archivos y carpetas (Add file → Upload files), reemplazando los anteriores. Recuerda subir también `mujer.html`, `hombre.html` y `unisex.html` junto a `index.html`.
En Settings → Pages, verifica que esté en `main` y `/ (root)`.
En un par de minutos se actualiza `https://carlos-aristizabal0654.github.io/essence-by-mc/` (el mismo link de Instagram).
Pendiente
Rellenar el campo `precio` de cada fragancia en `js/data.js` (mientras esté vacío, la tarjeta dice "Consultar").
La colección Unisex tiene por ahora 2 fragancias (Khamrah y Arabians Tonka).
