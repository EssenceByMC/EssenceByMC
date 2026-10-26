/* =========================================================
   Essence by M&C — Portada + catálogo + pedidos
   - Todas las páginas: botón flotante de WhatsApp y "Mi lista" (favoritos).
   - index.html: contadores, franja de fotos, "Nuestros favoritos".
   - mujer / hombre / unisex.html: muestra solo las fragancias de esa
     colección (según <body data-genero="...">), con búsqueda y filtros.
   ========================================================= */

(function () {
  "use strict";

  // Número de WhatsApp (con código de país, sin + ni espacios)
  const WHATSAPP = "573011754725";

  function waLink(texto) {
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Si en data.js escriben solo "sauvage.jpg", la foto se busca en la carpeta img/
  function rutaImagen(nombre) {
    const n = nombre.trim();
    if (/^(https?:)?\/\//.test(n)) return n;
    // encodeURI deja los espacios y tildes de los nombres de archivo en un formato que el navegador entiende
    return encodeURI(n.includes("/") ? n : "img/" + n);
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

  // ---------- Mi lista (favoritos) ----------
  // Se guarda en el navegador del cliente (localStorage); si no está disponible, solo en memoria.
  const LISTA_KEY = "essence-mc-lista";
  let enMemoria = [];

  function leerLista() {
    try {
      const v = JSON.parse(localStorage.getItem(LISTA_KEY) || "[]");
      if (Array.isArray(v)) return v.filter(id => PERFUMES.some(p => p.id === id));
    } catch (e) { /* sin almacenamiento */ }
    return enMemoria.filter(id => PERFUMES.some(p => p.id === id));
  }
  function guardarLista(ids) {
    enMemoria = ids;
    try { localStorage.setItem(LISTA_KEY, JSON.stringify(ids)); } catch (e) { /* sin almacenamiento */ }
  }

  let lista = leerLista();
  const porId = id => PERFUMES.find(p => p.id === id);
  const enLista = id => lista.includes(id);

  // ---------- Oferta de la semana ----------
  // Cada lunes (hora de Colombia) cambia solo: un perfume de hombre y uno de mujer.
  // El orden es mezclado pero fijo, así recorre todos los perfumes sin repetir hasta pasar por todos.
  const OFERTA = {
    descuentos: [               // % de descuento según el precio del perfume
      { desde: 200000, pct: 10 },
      { desde: 0,      pct: 5 }
    ],
    comboExtra: 5               // % adicional si se llevan los dos juntos (sobre la suma ya con descuento)
  };
  const DIA_MS = 86400000;

  function pesos(n) { return "$ " + n.toLocaleString("es-CO"); }

  // Mezcla repetible: la misma semilla da siempre el mismo orden
  function mezclaFija(arr, semilla) {
    let a = semilla >>> 0;
    const rnd = () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const r = arr.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }

  function descuentoPara(precio) {
    const tramo = OFERTA.descuentos.slice().sort((x, y) => y.desde - x.desde).find(d => precio >= d.desde);
    return tramo ? tramo.pct : 0;
  }

  function ofertaDeSemana() {
    const hoy = Math.floor((Date.now() - 5 * 3600000) / DIA_MS);   // día actual en Colombia (UTC-5)
    const semana = Math.floor((hoy + 3) / 7);                       // las semanas empiezan el lunes
    const domingo = semana * 7 - 3 + 6;

    const elegir = (genero, semilla) => {
      const pool = PERFUMES
        .filter(p => p.genero === genero && !p.sinOferta && typeof p.precio === "number" && p.precio > 0)
        .sort((x, y) => x.id - y.id);
      return pool.length ? mezclaFija(pool, semilla)[semana % pool.length] : null;
    };
    const m = elegir("mujer", 2707), h = elegir("hombre", 1301);
    if (!m || !h) return null;

    const conDescuento = p => {
      const pct = descuentoPara(p.precio);
      return { p, pct, normal: p.precio, oferta: Math.round(p.precio * (1 - pct / 100) / 1000) * 1000 };
    };
    const A = conDescuento(m), B = conDescuento(h);
    const normalTotal = A.normal + B.normal;
    const combo = Math.round((A.oferta + B.oferta) * (1 - OFERTA.comboExtra / 100) / 1000) * 1000;
    const hasta = new Date(domingo * DIA_MS).toLocaleDateString("es-CO", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
    return { mujer: A, hombre: B, normalTotal, combo, ahorro: normalTotal - combo, hasta };
  }

  const oferta = ofertaDeSemana();
  const ofertaDe = id => !oferta ? null : (oferta.mujer.p.id === id ? oferta.mujer : (oferta.hombre.p.id === id ? oferta.hombre : null));

  function textoPedido(p) {
    const ml = p.ml && p.ml.trim() !== "" ? ` (${p.ml.trim()})` : "";
    const of = ofertaDe(p.id);
    if (of) return `Hola Essence by M&C, quiero la oferta de la semana: ${p.nombre} de ${p.marca}${ml} a ${pesos(of.oferta)} (precio normal ${pesos(of.normal)}). ¿Está disponible?`;
    return `Hola Essence by M&C, me interesa ${p.nombre} de ${p.marca}${ml}. ¿Está disponible?`;
  }
  function textoLista() {
    const lineas = lista.map(porId).filter(Boolean).map((p, i) => `${i + 1}. ${p.nombre} — ${p.marca}`);
    return `Hola Essence by M&C, quiero pedir estas fragancias:\n\n${lineas.join("\n")}\n\n¿Me confirman disponibilidad y precio?`;
  }

  // ---------- Dock flotante + panel "Mi lista" ----------
  const ICONO_CORAZON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.5 6.4 4.5c2.1 0 3.7 1.1 5.6 3.3 1.9-2.2 3.5-3.3 5.6-3.3 3.7 0 5.5 3.9 4 7.3C19.5 16.4 12 21 12 21z"/></svg>';
  const ICONO_CHAT = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>';

  let ultimoFoco = null;

  function montarDock() {
    const dock = document.createElement("div");
    dock.className = "dock";
    dock.innerHTML = `
      <button type="button" class="dock-list" id="dockList" aria-haspopup="dialog" aria-controls="drawer" aria-expanded="false">
        ${ICONO_CORAZON}<span>Mi lista</span><span class="dock-count" id="dockCount">0</span>
      </button>
      <a class="dock-wa" href="${waLink("Hola Essence by M&C, quisiera más información.")}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">
        ${ICONO_CHAT}<span>Escríbenos</span>
      </a>
    `;

    const fondo = document.createElement("div");
    fondo.className = "drawer-backdrop";
    fondo.id = "drawerBackdrop";
    fondo.hidden = true;

    const panel = document.createElement("aside");
    panel.className = "drawer";
    panel.id = "drawer";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Mi lista de fragancias");
    panel.hidden = true;
    panel.innerHTML = `
      <div class="drawer-head">
        <h2>Mi lista</h2>
        <button type="button" class="drawer-close" id="drawerClose" aria-label="Cerrar">✕</button>
      </div>
      <ul class="drawer-items" id="drawerItems"></ul>
      <p class="drawer-empty" id="drawerEmpty">Aún no tienes fragancias en tu lista. Toca el corazón en cualquier tarjeta para guardarla y enviarnos todo en un solo mensaje.</p>
      <div class="drawer-foot" id="drawerFoot">
        <a class="btn btn-gold" id="drawerSend" href="#" target="_blank" rel="noopener">Enviar lista por WhatsApp</a>
        <button type="button" class="drawer-clear" id="drawerClear">Vaciar lista</button>
      </div>
    `;

    document.body.append(dock, fondo, panel);

    document.getElementById("dockList").addEventListener("click", abrirPanel);
    document.getElementById("drawerClose").addEventListener("click", cerrarPanel);
    fondo.addEventListener("click", cerrarPanel);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) cerrarPanel(); });

    document.getElementById("drawerClear").addEventListener("click", () => {
      lista = [];
      guardarLista(lista);
      refrescarLista();
    });
    document.getElementById("drawerItems").addEventListener("click", e => {
      const btn = e.target.closest("[data-quitar]");
      if (!btn) return;
      alternarLista(Number(btn.dataset.quitar));
    });

    // Si cambian la lista en otra pestaña, se sincroniza
    window.addEventListener("storage", e => {
      if (e.key !== LISTA_KEY) return;
      lista = leerLista();
      refrescarLista();
    });

    refrescarLista();
  }

  function abrirPanel() {
    ultimoFoco = document.activeElement;
    document.getElementById("drawer").hidden = false;
    document.getElementById("drawerBackdrop").hidden = false;
    document.getElementById("dockList").setAttribute("aria-expanded", "true");
    document.body.classList.add("drawer-open");
    document.getElementById("drawerClose").focus();
  }
  function cerrarPanel() {
    document.getElementById("drawer").hidden = true;
    document.getElementById("drawerBackdrop").hidden = true;
    document.getElementById("dockList").setAttribute("aria-expanded", "false");
    document.body.classList.remove("drawer-open");
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  function alternarLista(id) {
    lista = enLista(id) ? lista.filter(x => x !== id) : [...lista, id];
    guardarLista(lista);
    refrescarLista();
  }

  // Actualiza contador, panel y corazones de las tarjetas visibles
  function refrescarLista() {
    const n = lista.length;
    const contador = document.getElementById("dockCount");
    contador.textContent = n;
    contador.hidden = n === 0;
    document.getElementById("dockList").classList.toggle("tiene-items", n > 0);

    const ul = document.getElementById("drawerItems");
    ul.innerHTML = lista.map(porId).filter(Boolean).map(p => `
      <li>
        <span class="drawer-item-name"><strong>${escapeHTML(p.nombre)}</strong><small>${escapeHTML(p.marca)}</small></span>
        <button type="button" class="drawer-quitar" data-quitar="${p.id}" aria-label="Quitar ${escapeHTML(p.nombre)} de la lista">Quitar</button>
      </li>`).join("");
    document.getElementById("drawerEmpty").hidden = n > 0;
    document.getElementById("drawerFoot").hidden = n === 0;
    if (n > 0) document.getElementById("drawerSend").href = waLink(textoLista());

    document.querySelectorAll(".fav-btn").forEach(b => {
      const activo = enLista(Number(b.dataset.id));
      b.setAttribute("aria-pressed", activo ? "true" : "false");
      b.setAttribute("aria-label", (activo ? "Quitar de mi lista: " : "Agregar a mi lista: ") + b.dataset.nombre);
    });
  }

  montarDock();

  // ---------- Portada ----------
  document.querySelectorAll("[data-count]").forEach(el => {
    const n = PERFUMES.filter(p => p.genero === el.dataset.count).length;
    el.textContent = n + (n === 1 ? " fragancia" : " fragancias");
  });
  document.querySelectorAll("[data-total]").forEach(el => {
    el.textContent = "+" + Math.floor(PERFUMES.length / 10) * 10 + " fragancias";
  });

  // Franja carrusel detrás del nombre.
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

  // "Nuestros favoritos": las fragancias marcadas con destacado: true en data.js
  const favoritosEl = document.getElementById("favoritosGrid");
  if (favoritosEl) {
    const destacados = PERFUMES.filter(p => p.destacado);
    if (destacados.length === 0) {
      const sec = document.getElementById("favoritos");
      if (sec) sec.hidden = true;
    } else {
      favoritosEl.innerHTML = destacados.map(p => `
        <a class="top-card" href="${p.genero}.html?q=${encodeURIComponent(p.nombre)}">
          ${imagenHTML(p)}
          <span class="top-marca">${escapeHTML(p.marca)}</span>
          <span class="top-nombre">${escapeHTML(p.nombre)}</span>
        </a>`).join("");
    }
  }

  // "Oferta de la semana" en la portada
  const ofertaSec = document.getElementById("oferta");
  if (ofertaSec && oferta) {
    const tarjeta = (o, etiqueta) => `
      <div class="top-card oferta-card">
        ${imagenHTML(o.p)}
        <span class="top-marca">${escapeHTML(o.p.marca)} · ${etiqueta}</span>
        <span class="top-nombre">${escapeHTML(o.p.nombre)}</span>
        <span class="oferta-precios">
          <s>${pesos(o.normal)}</s>
          <strong>${pesos(o.oferta)}</strong>
          <em>-${o.pct}%</em>
        </span>
        <a class="btn-pedir" href="${waLink(textoPedido(o.p))}" target="_blank" rel="noopener">Pedir este</a>
      </div>`;
    const textoCombo = `Hola Essence by M&C, quiero el combo de la oferta de la semana: ${oferta.mujer.p.nombre} (${oferta.mujer.p.marca}) + ${oferta.hombre.p.nombre} (${oferta.hombre.p.marca}) por ${pesos(oferta.combo)} (precio normal ${pesos(oferta.normalTotal)}). ¿Están disponibles?`;
    document.getElementById("ofertaGrid").innerHTML = `
      ${tarjeta(oferta.mujer, "Mujer")}
      ${tarjeta(oferta.hombre, "Hombre")}
      <div class="oferta-combo">
        <span class="eyebrow">Combo especial</span>
        <h3>Llévalos juntos</h3>
        <span class="oferta-precios oferta-precios-grande">
          <s>${pesos(oferta.normalTotal)}</s>
          <strong>${pesos(oferta.combo)}</strong>
        </span>
        <p>Ahorras ${pesos(oferta.ahorro)} comprando los dos.</p>
        <a class="btn btn-gold" href="${waLink(textoCombo)}" target="_blank" rel="noopener">Pedir el combo por WhatsApp</a>
      </div>`;
    document.getElementById("ofertaVigencia").textContent = `Válida hasta el ${oferta.hasta}, o hasta agotar existencias.`;
    ofertaSec.hidden = false;
  }

  // ---------- Páginas de colección ----------
  const genero = document.body.dataset.genero;
  if (!genero) return; // estamos en la portada

  const state = { q: "", marca: "", tipo: "", momento: "", nota: "" };
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

    // Tipo (Original, Árabe…): el filtro aparece solo si hay fragancias con el campo "tipo" en data.js
    const tipos = [...new Set(items.map(p => (p.tipo || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    if (tipos.length > 0) {
      const grupo = document.createElement("div");
      grupo.className = "select-group";
      select.parentNode.insertBefore(grupo, select);
      grupo.appendChild(select);

      const selTipo = document.createElement("select");
      selTipo.className = "filter-select";
      selTipo.setAttribute("aria-label", "Filtrar por tipo de producto");
      selTipo.innerHTML = `<option value="">Todos los tipos</option>` + tipos.map(t => `<option value="${escapeHTML(t)}">${escapeHTML(t)}</option>`).join("");
      selTipo.addEventListener("change", () => {
        state.tipo = selTipo.value;
        render();
      });
      grupo.appendChild(selTipo);
    }

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

    // Buscador (también acepta ?q=nombre en la dirección, que usan los enlaces de "Nuestros favoritos")
    const search = filtersEl.querySelector(".search");
    const qInicial = new URLSearchParams(window.location.search).get("q");
    if (qInicial) {
      search.value = qInicial;
      state.q = qInicial.trim().toLowerCase();
    }
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
    const { q, marca, tipo, momento, nota } = state;

    const filtrados = items.filter(p => {
      const matchQ = !q || p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q);
      const matchMarca = !marca || p.marca === marca;
      const matchTipo = !tipo || (p.tipo || "").trim() === tipo;
      const matchMomento = !momento || p.momento === momento;
      const matchNota = !nota || p.notas.includes(nota);
      return matchQ && matchMarca && matchTipo && matchMomento && matchNota;
    });

    grid.innerHTML = filtrados.map(cardHTML).join("");
    emptyState.hidden = filtrados.length > 0;
  }

  // Precio: número (189000 → "$ 189.000"), texto libre, o "Consultar" si está vacío
  function precioHTML(p) {
    const of = ofertaDe(p.id);
    if (of) {
      return `<div class="card-precio en-oferta"><span class="precio-label">Oferta de la semana <em class="oferta-pct">-${of.pct}%</em></span><span class="precio-valor"><s>${pesos(of.normal)}</s> ${pesos(of.oferta)}</span></div>`;
    }
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

  function cardHTML(p) {
    const destacadoClass = p.destacado ? " destacado" : "";
    const momentoLabel = p.momento === "dia" ? "Día" : "Noche";
    const mlHTML = p.ml && p.ml.trim() !== "" ? `<span class="ml-badge">${escapeHTML(p.ml)}</span>` : "";
    const tipoHTML = p.tipo && p.tipo.trim() !== "" ? `<span class="tipo-badge">${escapeHTML(p.tipo.trim())}</span>` : "";
    const metaHTML = mlHTML || tipoHTML ? `<div class="card-meta">${tipoHTML}${mlHTML}</div>` : "";
    const activo = enLista(p.id);

    return `
      <article class="card${destacadoClass}">
        <div class="card-media">
          ${imagenHTML(p)}
          <button type="button" class="fav-btn" data-id="${p.id}" data-nombre="${escapeHTML(p.nombre)}" aria-pressed="${activo}" aria-label="${activo ? "Quitar de mi lista: " : "Agregar a mi lista: "}${escapeHTML(p.nombre)}">${ICONO_CORAZON}</button>
        </div>
        <div class="card-top">
          <span class="card-marca">${escapeHTML(p.marca)}</span>
          <span class="momento-badge ${p.momento}">${momentoLabel}</span>
        </div>
        <h3 class="card-nombre">${escapeHTML(p.nombre)}</h3>
        ${metaHTML}
        <div class="card-notas">
          ${p.notas.map(n => `<span class="nota-tag">${escapeHTML(n)}</span>`).join("")}
        </div>
        ${precioHTML(p)}
        <a class="btn-pedir" href="${waLink(textoPedido(p))}" target="_blank" rel="noopener">Pedir por WhatsApp</a>
      </article>
    `;
  }

  // Corazones: un solo oyente para todas las tarjetas
  grid.addEventListener("click", e => {
    const btn = e.target.closest(".fav-btn");
    if (!btn) return;
    alternarLista(Number(btn.dataset.id));
  });

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
