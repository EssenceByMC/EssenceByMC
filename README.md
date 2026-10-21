# Essence by M&C

Catálogo web de perfumería — María Fernanda & Carlos.

## Estructura del proyecto

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

## Cómo agregar las fotos de los perfumes

1. Guarda la foto del frasco dentro de la carpeta **`img/`**. Usa nombres simples y sin espacios ni tildes, por ejemplo: `sauvage.jpg`, `good-girl.jpg`, `212-vip-men.jpg`.
2. Ve al archivo **`js/data.js`** y busca la fragancia correspondiente. Escribe el nombre del archivo en el campo `imagen`:

```js
{ id: 57, nombre: "Sauvage", marca: "Dior", genero: "hombre", momento: "dia", notas: ["Fresco","Amaderado","Especiado"], destacado: true, imagen: "sauvage.jpg" }
```

3. Guarda y listo — la foto aparecerá automáticamente en su tarjeta (el sitio la busca solo en la carpeta `img/`).

Mientras el campo `imagen` esté vacío (`imagen: ""`), la tarjeta muestra un espacio reservado con el texto "Agregar foto".

**Recomendación:** fotos en formato vertical (proporción 4:5, por ejemplo 800×1000 px), fondo neutro o blanco y buena luz.

## Cómo agregar o editar fragancias

Todo el catálogo vive en **`js/data.js`**. Cada fragancia es un bloque así:

```js
{ id: 64, nombre: "Nombre del perfume", marca: "Marca", genero: "mujer", momento: "dia", notas: ["Floral", "Frutal"] }
```

- `genero`: `"mujer"`, `"hombre"` o `"unisex"`. **Cada fragancia aparece solo en la página de su género** (un unisex ya no se repite en Mujer y Hombre). Para mover un perfume de colección, cambia este campo.
- `momento`: `"dia"` o `"noche"`.
- `notas`: lista de familias olfativas — los filtros se generan solos según lo que escribas aquí.
- `destacado: true` (opcional) — le pone una etiqueta "Favorito".
- `ml` (opcional): tipo y contenido, por ejemplo `"Eau de Parfum · 100 ml"`.
- `precio` (opcional): escríbelo como número, sin puntos ni símbolos: `precio: 189000` se muestra como "$ 189.000" al fondo de la tarjeta. También acepta texto (`precio: "Desde $150.000"`). Si lo dejas vacío (`precio: ""`) la tarjeta muestra "Consultar".

No necesitas tocar el HTML ni el CSS para actualizar el catálogo, solo este archivo.

## Cómo cambiar los colores

Los tres temas están al inicio de `css/styles.css`, en los bloques `.theme-mujer`, `.theme-hombre` y `.theme-unisex`. Cambia ahí `--bg`, `--accent` y compañía y se actualiza toda la página de esa colección.

## Cómo publicarlo en GitHub Pages (gratis)

1. Entra al repositorio `essence-by-mc` en GitHub.
2. Sube todos los archivos y carpetas (**Add file → Upload files**), reemplazando los anteriores. Recuerda subir también `mujer.html`, `hombre.html` y `unisex.html` junto a `index.html`.
3. En **Settings → Pages**, verifica que esté en `main` y `/ (root)`.
4. En un par de minutos se actualiza `https://carlos-aristizabal0654.github.io/essence-by-mc/` (el mismo link de Instagram).

## Pendiente

- Rellenar el campo `precio` de cada fragancia en `js/data.js` (mientras esté vacío, la tarjeta dice "Consultar").
- La colección Unisex tiene por ahora 2 fragancias (Khamrah y Arabians Tonka).
