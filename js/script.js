/* =========================================================
   Essence by M&C — Portada + filtros del catálogo
   - En index.html: rellena los contadores de las tres puertas.
   - En mujer.html / hombre.html / unisex.html: muestra solo las
     fragancias de esa colección (según <body data-genero="...">)
     y activa búsqueda y filtros.
   ========================================================= */

(function () {
  "use strict";

  // ---------- Portada: contadores ----------
  document.querySelectorAll("[data-count]").forEach(el => {
    const n = PERFUMES.filter(p => p.genero === el.dataset.count).length;
    el.textContent = n + (n === 1 ? " fragancia" : " fragancias");
  });

  // ---------- Portada: franja carrusel detrás del nombre ----------
  // Con 4 o más fotos (campo "imagen" en data.js) pasan las fotos de las lociones.
  // Mientras no haya fotos, pasan los nombres de las fragancias.
  const strip = document.getElementById("strip");
  const track = document.getElementById("stripTrack");
  if (strip && track) {
    const mezclar = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    const conFoto = PERFUMES.filter(p => p.imagen && p.imagen.trim() !== "");
    const modoFotos = conFoto.length >= 4;
    const base = mezclar(modoFotos ? conFoto : PERFUMES).slice(0, 24);
    const anchoItem = modoFotos ? 184 : 300;       // px aproximados de cada elemento
    const anchoPantalla = Math.max(window.screen.width || 0, window.innerWidth, 1600);

    // Se repite la lista hasta cubrir la pantalla, y luego se duplica para que el bucle no se note
    let secuencia = [];
    while (secuencia.length * anchoItem < anchoPantalla * 1.2) secuencia = secuencia.concat(base);

    const itemHTML = p => modoFotos
      ? `<span class="strip-photo"><img src="${escapeHTML(rutaImagen(p.imagen))}" alt="" loading="lazy"></span>`
      : `<span class="strip-name">${escapeHTML(p.nombre)} <em>${escapeHTML(p.marca)}</em></span><span class="strip-sep">✦</span>`;

    const html = secuencia.map(itemHTML).join("");
    track.innerHTML = html + html;
    strip.classList.add(modoFotos ? "is-photos" : "is-text");
    track.style.animationDuration = Math.round((secuencia.length * anchoItem) / (modoFotos ? 38 : 55)) + "s";
  }

  // ---------- Páginas de colección ----------
  const genero = document.body.dataset.genero;
  if (!genero) return; // estamos en la portada

  const state = { q: "", marca: "", momento: "", nota: "" };
  const items = PERFUMES.filter(p => p.genero === genero);

  const filtersEl = document.querySelector(".filters");
  const grid = document.getElementById("grid");
  const emptyState = document.getElementById("empty");

  function poblarFiltros() {
    // Marcas (orden alfabético, sin duplicados)
    const marcas = [...new Set(items.map(p => p.marca))].sort((a, b) => a.localeCompare(b));
    const select = filtersEl.querySelector('[data-filter="marca"]');
    marcas.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => {
      state.marca = select.value;
      render();
    });

    // Notas / familias olfativas
    const notas = [...new Set(items.flatMap(p => p.notas))].sort((a, b) => a.localeCompare(b));
    const notasGroup = filtersEl.querySelector(".notas-group");
    [["", "Todas las notas"], ...notas.map(n => [n, n])].forEach(([valor, texto], i) => {
      const btn = document.createElement("button");
      btn.className = "chip" + (i === 0 ? " active" : "");
      btn.dataset.value = valor;
      btn.textContent = texto;
      notasGroup.appendChild(btn);
    });
    enlazarChips(notasGroup, "nota");

    // Momento (día / noche)
    enlazarChips(filtersEl.querySelector('[data-filter="momento"]'), "momento");

    // Buscador
    const search = filtersEl.querySelector(".search");
    search.addEventListener("input", () => {
      state.q = search.value.trim().toLowerCase();
      render();
    });
  }

  function enlazarChips(group, clave) {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      group.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      state[clave] = btn.dataset.value;
      render();
    });
  }

  function render() {
    const { q, marca, momento, nota } = state;

    const filtrados = items.filter(p => {
      const matchQ = !q || p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q);
      const matchMarca = !marca || p.marca === marca;
      const matchMomento = !momento || p.momento === momento;
      const matchNota = !nota || p.notas.includes(nota);
      return matchQ && matchMarca && matchMomento && matchNota;
    });

    grid.innerHTML = filtrados.map(cardHTML).join("");
    emptyState.hidden = filtrados.length > 0;
  }

  function cardHTML(p) {
    const destacadoClass = p.destacado ? " destacado" : "";
    const momentoLabel = p.momento === "dia" ? "Día" : "Noche";
    const mlHTML = p.ml && p.ml.trim() !== "" ? `<span class="ml-badge">${escapeHTML(p.ml)}</span>` : "";

    return `
      <article class="card${destacadoClass}">
        ${imagenHTML(p)}
        <div class="card-top">
          <span class="card-marca">${escapeHTML(p.marca)}</span>
          <span class="momento-badge ${p.momento}">${momentoLabel}</span>
        </div>
        <h3 class="card-nombre">${escapeHTML(p.nombre)}</h3>
        ${mlHTML ? `<div class="card-meta">${mlHTML}</div>` : ""}
        <div class="card-notas">
          ${p.notas.map(n => `<span class="nota-tag">${escapeHTML(n)}</span>`).join("")}
        </div>
        ${precioHTML(p)}
      </article>
    `;
  }

  // Precio: número (189000 → "$ 189.000"), texto libre, o "Consultar precio" si está vacío
  function precioHTML(p) {
    let texto = "";
    if (typeof p.precio === "number" && p.precio > 0) {
      texto = "$ " + p.precio.toLocaleString("es-CO");
    } else if (typeof p.precio === "string" && p.precio.trim() !== "") {
      texto = p.precio.trim();
    }
    return texto
      ? `<div class="card-precio"><span class="precio-label">Precio</span><span class="precio-valor">${escapeHTML(texto)}</span></div>`
      : `<div class="card-precio sin-precio"><span class="precio-label">Precio</span><span class="precio-valor">Consultar</span></div>`;
  }

  // Si en data.js escriben solo "sauvage.jpg", la foto se busca en la carpeta img/
  function rutaImagen(nombre) {
    const n = nombre.trim();
    return /^(https?:)?\/\//.test(n) || n.includes("/") ? n : "img/" + n;
  }

  function imagenHTML(p) {
    if (p.imagen && p.imagen.trim() !== "") {
      return `
        <div class="card-img">
          <img src="${escapeHTML(rutaImagen(p.imagen))}" alt="${escapeHTML(p.nombre)} — ${escapeHTML(p.marca)}" loading="lazy">
        </div>
      `;
    }
    // Placeholder: espacio reservado para cuando aún no hay foto
    return `
      <div class="card-img card-img-placeholder">
        <span class="placeholder-icon">✦</span>
        <span class="placeholder-text">Agregar foto</span>
      </div>
    `;
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Colección todavía sin productos
  if (items.length === 0) {
    filtersEl.hidden = true;
    emptyState.textContent = "Muy pronto encontrarás fragancias en esta colección.";
    emptyState.hidden = false;
    return;
  }

  poblarFiltros();
  render();
})();
