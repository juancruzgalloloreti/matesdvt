/* Lógica de la página. Los productos y la configuración están en products.js */
(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const grid = $('#grid'), count = $('#count'), empty = $('#empty');
  const search = $('#q'), chips = $('#chips'), tpl = $('#card-tpl');
  const viewer = $('#viewer'), viewerImg = $('#viewer-img'), viewerCap = $('#viewer-cap');

  const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  // Quita tildes y pasa a minúsculas: "bombillon" encuentra "Bombillón"
  const norm = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const state = { q: '', cat: 'Todos' };

  // Textos de cabecera desde la configuración
  $('#site-name').textContent = SITE.name;
  document.title = `${SITE.name} · ${SITE.tagline}`;
  document.querySelector('.top__tagline').textContent = SITE.tagline;
  if (SITE.updated) { const u = $('#updated'); u.textContent = `Actualizado: ${SITE.updated}`; u.hidden = false; }

  // Sección de contacto (Instagram y WhatsApp)
  const ig = $('#ig-link'), wa = $('#wa-link');
  ig.hidden = !SITE.instagram; wa.hidden = !SITE.whatsapp;
  if (SITE.instagram) { ig.href = `https://instagram.com/${SITE.instagram}`; $('#ig-handle').textContent = `@${SITE.instagram}`; }
  if (SITE.whatsapp) wa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hola! Quería hacer una consulta.')}`;
  $('#contact').hidden = !(SITE.instagram || SITE.whatsapp);

  // Una tarjeta por producto, se crean una sola vez; al filtrar solo se ocultan/muestran
  const items = PRODUCTS.map((p, i) => {
    const el = tpl.content.firstElementChild.cloneNode(true);
    const img = el.querySelector('img'), photo = el.querySelector('.card__photo');

    el.querySelector('.card__name').textContent = p.n;
    el.querySelector('.tag__num').textContent = nf.format(p.price ?? p.p);
    el.classList.toggle('is-out', !!p.sinStock);
    el.querySelector('.card__badge').hidden = !p.sinStock;

    if (p.img) {
      img.src = p.img; img.alt = p.n; img.width = p.w; img.height = p.h;
      img.loading = i < 4 ? 'eager' : 'lazy';
      photo.setAttribute('aria-label', `Ver foto de ${p.n}`);
      photo.addEventListener('click', () => openViewer(p));
    } else {
      img.remove(); photo.disabled = true;
      photo.insertAdjacentHTML('afterbegin', '<span class="card__nophoto">Sin foto</span>');
    }

    if (SITE.whatsapp) {
      const ask = el.querySelector('.card__ask');
      const msg = `Hola! Quería consultar por: ${p.n} ($${nf.format(p.p)})`;
      ask.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
      ask.setAttribute('aria-label', `Consultar por ${p.n} por WhatsApp`);
      ask.hidden = !!p.sinStock;
    }

    grid.appendChild(el);
    return { el, p, hay: norm(p.n) };
  });

  // Filtros por categoría
  ['Todos', ...new Set(PRODUCTS.map((p) => p.cat))].forEach((cat) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = cat;
    b.setAttribute('aria-pressed', String(cat === state.cat));
    b.addEventListener('click', () => {
      state.cat = cat;
      chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      apply();
    });
    chips.appendChild(b);
  });

  function apply() {
    const terms = norm(state.q).split(/\s+/).filter(Boolean);
    let shown = 0;
    items.forEach(({ el, p, hay }) => {
      const ok = (state.cat === 'Todos' || p.cat === state.cat) && terms.every((t) => hay.includes(t));
      el.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown > 0;
    count.textContent = `${shown} ${shown === 1 ? 'artículo' : 'artículos'}`;
  }

  // Visor de foto a pantalla completa
  function openViewer(p) {
    viewerImg.src = p.img; viewerImg.alt = p.n;
    viewerCap.textContent = `${p.n} · $${nf.format(p.p)}${p.sinStock ? ' (sin stock)' : ''}`;
    viewer.showModal();
  }
  viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });

  search.addEventListener('input', (e) => { state.q = e.target.value; apply(); });
  apply();
})();
