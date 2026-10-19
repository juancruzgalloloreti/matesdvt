/* Lógica de la página. Configuración y productos en products.js */
(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const grid = $('#grid'), count = $('#count'), empty = $('#empty');
  const search = $('#q'), chips = $('#chips'), tpl = $('#card-tpl');
  const viewer = $('#viewer'), viewerImg = $('#viewer-img'), viewerCap = $('#viewer-cap');
  const cartDrawer = $('#cart-drawer'), cartList = $('#cart-list');
  const cartFab = $('#cart-fab'), cartFabBadge = $('#cart-fab-badge');
  const cartTotal = $('#cart-total'), cartFoot = $('#cart-foot');
  const cartWa = $('#cart-wa'), cartClear = $('#cart-clear');

  const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const norm = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const state = { q: '', cat: 'Todos' };
  const cart = {};

  /* ──────────── Cabecera ──────────── */
  $('#site-name').textContent = SITE.name;
  document.title = `${SITE.name} · ${SITE.tagline}`;
  document.querySelector('.top__tagline').textContent = SITE.tagline;
  if (SITE.updated) { const u = $('#updated'); u.textContent = `Actualizado: ${SITE.updated}`; u.hidden = false; }

  /* ──────────── Contacto ──────────── */
  const ig = $('#ig-link'), wa = $('#wa-link');
  ig.hidden = !SITE.instagram; wa.hidden = !SITE.whatsapp;
  if (SITE.instagram) { ig.href = `https://instagram.com/${SITE.instagram}`; $('#ig-handle').textContent = `@${SITE.instagram}`; }
  if (SITE.whatsapp) wa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hola! Quería hacer una consulta.')}`;
  $('#contact').hidden = !(SITE.instagram || SITE.whatsapp);
  if (!SITE.whatsapp) cartWa.hidden = true;

  /* ══════════════════════════════════════════════════════════════════
     PARSEO DE CSV (para Google Sheets)
  ══════════════════════════════════════════════════════════════════ */
  function parseCSVLine(line) {
    const result = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { result.push(cur); cur = ''; }
      else { cur += ch; }
    }
    result.push(cur);
    return result.map(v => v.trim().replace(/^"|"$/g, ''));
  }

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    return lines.slice(1).filter(l => l.trim()).map(line => {
      const vals = parseCSVLine(line);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
      return obj;
    });
  }

  function csvRowToProduct(row) {
    // Columnas esperadas: nombre, precio, categoria, imagen, sinStock
    const imgRaw = (row.imagen || '').trim();
    const img = imgRaw
      ? (imgRaw.startsWith('http') ? imgRaw : `img/productos/${imgRaw}`)
      : undefined;
    const sinStock = ['si', 'sí', '1', 'true', 'yes'].includes((row.sinstock || '').toLowerCase());
    return {
      n: row.nombre || '',
      p: Number((row.precio || '0').replace(/\D/g, '')) || 0,
      cat: row.categoria || 'General',
      img,
      sinStock: sinStock || undefined,
    };
  }

  /* ──────────── Estado de carga ──────────── */
  function showLoading() {
    grid.innerHTML = `
      <li class="card-skeleton"></li><li class="card-skeleton"></li>
      <li class="card-skeleton"></li><li class="card-skeleton"></li>`;
  }
  function hideLoading() { grid.innerHTML = ''; }

  /* ══════════════════════════════════════════════════════════════════
     INICIO: carga desde Sheet o desde PRODUCTS local
  ══════════════════════════════════════════════════════════════════ */
  async function init() {
    let products = PRODUCTS;

    if (SITE.sheetCSV) {
      showLoading();
      try {
        // Usamos un proxy de CORS para evitar bloqueos en algunos hostings
        const res = await fetch(SITE.sheetCSV);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const rows = parseCSV(text).filter(r => r.nombre && r.precio);
        if (rows.length) {
          products = rows.map(csvRowToProduct);
        } else {
          console.warn('El Sheet no devolvió filas válidas, usando productos locales.');
        }
      } catch (err) {
        console.error('No se pudo cargar el Sheet:', err);
        // Fallback silencioso a PRODUCTS local
      }
      hideLoading();
    }

    buildUI(products);
  }

  /* ══════════════════════════════════════════════════════════════════
     CONSTRUCCIÓN DE LA UI
  ══════════════════════════════════════════════════════════════════ */
  function buildUI(products) {
    const items = products.map((p, i) => {
      const el = tpl.content.firstElementChild.cloneNode(true);
      const img = el.querySelector('img'), photo = el.querySelector('.card__photo');
      const addBtn = el.querySelector('.card__add');
      const qtyBox = el.querySelector('.card__qty');
      const qtyNum = el.querySelector('.card__qty-num');
      const qtyMinus = el.querySelector('.card__qty-minus');
      const qtyPlus = el.querySelector('.card__qty-plus');

      el.querySelector('.card__name').textContent = p.n;
      el.querySelector('.tag__num').textContent = nf.format(p.p);
      el.classList.toggle('is-out', !!p.sinStock);
      el.querySelector('.card__badge').hidden = !p.sinStock;

      if (p.img) {
        img.src = p.img; img.alt = p.n;
        img.loading = i < 4 ? 'eager' : 'lazy';
        photo.setAttribute('aria-label', `Ver foto de ${p.n}`);
        photo.addEventListener('click', () => openViewer(p));
      } else {
        img.remove(); photo.disabled = true;
        photo.insertAdjacentHTML('afterbegin', '<span class="card__nophoto">Sin foto</span>');
      }

      if (p.sinStock) {
        addBtn.disabled = true;
        addBtn.innerHTML = 'Sin stock';
        addBtn.style.cssText = 'opacity:.5;cursor:default';
      } else {
        addBtn.addEventListener('click', () => changeQty(i, 1, products, items));
        qtyMinus.addEventListener('click', () => changeQty(i, -1, products, items));
        qtyPlus.addEventListener('click', () => changeQty(i, 1, products, items));
      }

      function updateCardUI() {
        const qty = cart[i] || 0;
        addBtn.hidden = qty > 0;
        qtyBox.hidden = qty === 0;
        if (qty > 0) qtyNum.textContent = qty;
      }

      grid.appendChild(el);
      return { el, p, hay: norm(p.n), updateCardUI };
    });

    /* ──── Filtros por categoría ──── */
    chips.innerHTML = '';
    ['Todos', ...new Set(products.map(p => p.cat))].forEach(cat => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = cat;
      b.setAttribute('aria-pressed', String(cat === state.cat));
      b.addEventListener('click', () => {
        state.cat = cat;
        chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === b)));
        apply(items);
      });
      chips.appendChild(b);
    });

    search.addEventListener('input', (e) => { state.q = e.target.value; apply(items); });

    /* ──── Carrito ──── */
    cartFab.addEventListener('click', openCart);
    $('#cart-close').addEventListener('click', closeCart);
    $('#cart-backdrop').addEventListener('click', closeCart);
    cartClear.addEventListener('click', () => {
      Object.keys(cart).forEach(k => { delete cart[k]; items[Number(k)]?.updateCardUI(); });
      renderCart(products);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && cartDrawer.classList.contains('is-open')) closeCart();
    });

    renderCart(products);
    apply(items);
  }

  /* ──────────── Filtrado ──────────── */
  function apply(items) {
    const terms = norm(state.q).split(/\s+/).filter(Boolean);
    let shown = 0;
    items.forEach(({ el, p, hay }) => {
      const ok = (state.cat === 'Todos' || p.cat === state.cat) && terms.every(t => hay.includes(t));
      el.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown > 0;
    count.textContent = `${shown} ${shown === 1 ? 'artículo' : 'artículos'}`;
  }

  /* ──────────── Carrito ──────────── */
  function changeQty(idx, delta, products, items) {
    const next = Math.max(0, (cart[idx] || 0) + delta);
    if (next === 0) delete cart[idx]; else cart[idx] = next;
    items[idx].updateCardUI();
    renderCart(products);
    if (delta > 0) animateFab();
  }

  function animateFab() {
    cartFab.classList.remove('pop');
    void cartFab.offsetWidth;
    cartFab.classList.add('pop');
    cartFab.addEventListener('animationend', () => cartFab.classList.remove('pop'), { once: true });
  }

  function renderCart(products) {
    const keys = Object.keys(cart).filter(k => cart[k] > 0);
    const totalUnits = keys.reduce((a, k) => a + cart[k], 0);
    const totalPrice = keys.reduce((a, k) => a + cart[k] * products[k].p, 0);

    cartFab.dataset.count = totalUnits;
    cartFab.hidden = totalUnits === 0;
    cartFabBadge.textContent = totalUnits;
    cartFoot.hidden = keys.length === 0;
    cartTotal.textContent = `$${nf.format(totalPrice)}`;

    cartList.innerHTML = '';

    if (keys.length === 0) {
      cartList.insertAdjacentHTML('beforeend', `
        <div class="cart-drawer__empty">
          <span class="cart-drawer__empty-icon">🧉</span>
          <p>Tu carrito está vacío.<br>Agregá productos para armar tu pedido.</p>
        </div>`);
      return;
    }

    keys.forEach(k => {
      const idx = Number(k);
      const p = products[idx];
      const qty = cart[idx];
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        ${p.img
          ? `<img class="cart-item__img" src="${p.img}" alt="${p.n}" loading="lazy">`
          : `<div class="cart-item__img-placeholder">🧉</div>`}
        <div class="cart-item__info">
          <div class="cart-item__name" title="${p.n}">${p.n}</div>
          <div class="cart-item__price">$${nf.format(p.p)} c/u</div>
        </div>
        <div class="cart-item__controls">
          <div class="cart-item__qty">
            <button type="button" class="cart-item__btn cart-item__minus" aria-label="Quitar uno">−</button>
            <span class="cart-item__count">${qty}</span>
            <button type="button" class="cart-item__btn cart-item__plus" aria-label="Agregar uno">+</button>
          </div>
          <button type="button" class="cart-item__remove" aria-label="Eliminar">🗑</button>
        </div>`;
      div.querySelector('.cart-item__minus').addEventListener('click', () => { const it = buildItemsRef(); changeQty(idx, -1, products, it); });
      div.querySelector('.cart-item__plus').addEventListener('click', () => { const it = buildItemsRef(); changeQty(idx, 1, products, it); });
      div.querySelector('.cart-item__remove').addEventListener('click', () => {
        delete cart[idx];
        renderCart(products);
      });
      cartList.appendChild(div);
    });

    // Mensaje de WhatsApp con el pedido completo
    if (SITE.whatsapp) {
      const lines = keys.map(k => `• ${products[k].n} x${cart[k]} = $${nf.format(products[k].p * cart[k])}`);
      const msg = `Hola! Quería hacer el siguiente pedido:\n\n${lines.join('\n')}\n\nTotal estimado: $${nf.format(totalPrice)}`;
      cartWa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
    }
  }

  // Referencia lazy a los items del grid para usar en renderCart
  function buildItemsRef() {
    return [...grid.querySelectorAll('.card')].map((el, i) => ({
      el, updateCardUI() {
        const qty = cart[i] || 0;
        const add = el.querySelector('.card__add');
        const box = el.querySelector('.card__qty');
        const num = el.querySelector('.card__qty-num');
        if (add) add.hidden = qty > 0;
        if (box) box.hidden = qty === 0;
        if (num && qty > 0) num.textContent = qty;
      }
    }));
  }

  /* ──────────── Drawer ──────────── */
  function openCart() {
    cartDrawer.classList.remove('cart-drawer--hidden');
    requestAnimationFrame(() => cartDrawer.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer.classList.remove('is-open');
    document.body.style.overflow = '';
    cartDrawer.addEventListener('transitionend', () => cartDrawer.classList.add('cart-drawer--hidden'), { once: true });
  }

  /* ──────────── Visor de foto ──────────── */
  function openViewer(p) {
    viewerImg.src = p.img; viewerImg.alt = p.n;
    viewerCap.textContent = `${p.n} · $${nf.format(p.p)}${p.sinStock ? ' (sin stock)' : ''}`;
    viewer.showModal();
  }
  viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });

  /* ──────────── Arrancar ──────────── */
  init();
})();
