/* Lógica de la página. Los productos y la configuración están en products.js */
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

  // Carrito: { [productIndex]: cantidad }
  const cart = {};

  /* ──────────── Textos de cabecera desde la configuración ──────────── */
  $('#site-name').textContent = SITE.name;
  document.title = `${SITE.name} · ${SITE.tagline}`;
  document.querySelector('.top__tagline').textContent = SITE.tagline;
  if (SITE.updated) { const u = $('#updated'); u.textContent = `Actualizado: ${SITE.updated}`; u.hidden = false; }

  /* ──────────── Sección de contacto ──────────── */
  const ig = $('#ig-link'), wa = $('#wa-link');
  ig.hidden = !SITE.instagram; wa.hidden = !SITE.whatsapp;
  if (SITE.instagram) { ig.href = `https://instagram.com/${SITE.instagram}`; $('#ig-handle').textContent = `@${SITE.instagram}`; }
  if (SITE.whatsapp) wa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hola! Quería hacer una consulta.')}`;
  $('#contact').hidden = !(SITE.instagram || SITE.whatsapp);

  /* ──────────── Tarjetas de productos ──────────── */
  const items = PRODUCTS.map((p, i) => {
    const el = tpl.content.firstElementChild.cloneNode(true);
    const img = el.querySelector('img'), photo = el.querySelector('.card__photo');
    const addBtn = el.querySelector('.card__add');
    const qtyBox = el.querySelector('.card__qty');
    const qtyNum = el.querySelector('.card__qty-num');
    const qtyMinus = el.querySelector('.card__qty-minus');
    const qtyPlus = el.querySelector('.card__qty-plus');

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

    // Sin stock: deshabilitar botón
    if (p.sinStock) {
      addBtn.disabled = true;
      addBtn.textContent = 'Sin stock';
      addBtn.style.opacity = '.5';
      addBtn.style.cursor = 'default';
    } else {
      addBtn.addEventListener('click', () => changeQty(i, 1));
      qtyMinus.addEventListener('click', () => changeQty(i, -1));
      qtyPlus.addEventListener('click', () => changeQty(i, 1));
    }

    function updateCardUI() {
      const qty = cart[i] || 0;
      if (qty > 0) {
        addBtn.hidden = true;
        qtyBox.hidden = false;
        qtyNum.textContent = qty;
      } else {
        addBtn.hidden = false;
        qtyBox.hidden = true;
      }
    }

    grid.appendChild(el);
    return { el, p, hay: norm(p.n), updateCardUI };
  });

  /* ──────────── Lógica del carrito ──────────── */
  function changeQty(idx, delta) {
    const prev = cart[idx] || 0;
    const next = Math.max(0, prev + delta);
    if (next === 0) {
      delete cart[idx];
    } else {
      cart[idx] = next;
    }
    items[idx].updateCardUI();
    renderCart();
    if (delta > 0) animateFab();
  }

  function animateFab() {
    cartFab.classList.remove('pop');
    // fuerza reflow para reiniciar la animación
    void cartFab.offsetWidth;
    cartFab.classList.add('pop');
    cartFab.addEventListener('animationend', () => cartFab.classList.remove('pop'), { once: true });
  }

  function renderCart() {
    const keys = Object.keys(cart).filter(k => cart[k] > 0);
    const totalUnits = keys.reduce((a, k) => a + cart[k], 0);
    const totalPrice = keys.reduce((a, k) => a + cart[k] * PRODUCTS[k].p, 0);

    // FAB
    cartFab.dataset.count = totalUnits;
    cartFab.hidden = totalUnits === 0;
    cartFabBadge.textContent = totalUnits;

    // Footer del drawer
    cartFoot.hidden = keys.length === 0;
    cartTotal.textContent = `$${nf.format(totalPrice)}`;

    // Lista del drawer
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
      const p = PRODUCTS[idx];
      const qty = cart[idx];
      const li = document.createElement('div');
      li.className = 'cart-item';
      li.innerHTML = `
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
          <button type="button" class="cart-item__remove" aria-label="Eliminar ${p.n}">🗑</button>
        </div>`;
      li.querySelector('.cart-item__minus').addEventListener('click', () => changeQty(idx, -1));
      li.querySelector('.cart-item__plus').addEventListener('click', () => changeQty(idx, 1));
      li.querySelector('.cart-item__remove').addEventListener('click', () => {
        delete cart[idx];
        items[idx].updateCardUI();
        renderCart();
      });
      cartList.appendChild(li);
    });

    // Generar link de WhatsApp con el resumen del pedido
    if (SITE.whatsapp) {
      const lines = keys.map(k => {
        const p = PRODUCTS[k];
        return `• ${p.n} x${cart[k]} = $${nf.format(p.p * cart[k])}`;
      });
      const total = `\nTotal estimado: $${nf.format(totalPrice)}`;
      const msg = `Hola! Quería hacer el siguiente pedido:\n\n${lines.join('\n')}${total}`;
      cartWa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
    }
  }

  /* ──────────── Abrir/cerrar drawer ──────────── */
  function openCart() {
    cartDrawer.classList.remove('cart-drawer--hidden');
    // pequeño delay para que la transición funcione
    requestAnimationFrame(() => cartDrawer.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('is-open');
    document.body.style.overflow = '';
    cartDrawer.addEventListener('transitionend', () => {
      cartDrawer.classList.add('cart-drawer--hidden');
    }, { once: true });
  }

  cartFab.addEventListener('click', openCart);
  $('#cart-close').addEventListener('click', closeCart);
  $('#cart-backdrop').addEventListener('click', closeCart);
  cartClear.addEventListener('click', () => {
    Object.keys(cart).forEach(k => { delete cart[k]; items[Number(k)].updateCardUI(); });
    renderCart();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer.classList.contains('is-open')) closeCart();
  });

  // Ocultar botón de WA de carrito si no hay número configurado
  if (!SITE.whatsapp) cartWa.hidden = true;

  /* ──────────── Filtros por categoría ──────────── */
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

  /* ──────────── Visor de foto ──────────── */
  function openViewer(p) {
    viewerImg.src = p.img; viewerImg.alt = p.n;
    viewerCap.textContent = `${p.n} · $${nf.format(p.p)}${p.sinStock ? ' (sin stock)' : ''}`;
    viewer.showModal();
  }
  viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });

  search.addEventListener('input', (e) => { state.q = e.target.value; apply(); });

  // Inicializar
  renderCart();
  apply();
})();
