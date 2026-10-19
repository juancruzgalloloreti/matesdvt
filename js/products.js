/* =====================================================================
   DATOS DE LA PÁGINA — acá se editan precios, productos y contacto.
   - n: nombre | p: precio en pesos | cat: Mates, Bombillas o Accesorios
   - img: ruta de la foto (carpeta img/productos) | sinStock: true si no hay
   ===================================================================== */
const SITE = {
  name: "Lista de precios",
  tagline: "Mates, bombillas y accesorios",
  updated: "",   // Ej.: "octubre 2026". Si lo dejás vacío no se muestra.
  whatsapp: "5491158266373",  // Con código de país, sin + ni espacios. Vacío = sin botones de WhatsApp.
  instagram: "matesdvt",      // Usuario de Instagram, sin @. Vacío = sin botón.
};

const PRODUCTS = [
  { n: "Torpedo crudo alpaca cincelada premium", p: 50000, cat: "Mates", img: "img/productos/torpedo-crudo-alpaca-cincelada-premium.webp", w: 600, h: 800 },
  { n: "Torpedo crudo con base y anillos", p: 48000, cat: "Mates", img: "img/productos/torpedo-crudo-con-base-y-anillos.webp", w: 600, h: 800 },
  { n: "Imperial alpaca con base premium", p: 50000, cat: "Mates", img: "img/productos/imperial-alpaca-con-base-premium.webp", w: 600, h: 800 },
  { n: "Imperial térmico", p: 28000, cat: "Mates", img: "img/productos/imperial-termico.webp", w: 600, h: 800 },
  { n: "Imperial económico", p: 27000, cat: "Mates", img: "img/productos/imperial-economico.webp", w: 600, h: 800 },
  { n: "Mate galleta", p: 20000, cat: "Mates", img: "img/productos/mate-galleta.webp", w: 600, h: 800 },
  { n: "Torpedo bronce premium con bolitas", p: 45000, cat: "Mates", img: "img/productos/torpedo-bronce-premium-con-bolitas.webp", w: 594, h: 800 },
  { n: "Torpedo bronce premium con bolitas repujado", p: 47000, cat: "Mates", img: "img/productos/torpedo-bronce-premium-con-bolitas-repujado.webp", w: 600, h: 800, sinStock: true },
  { n: "Torpedo alpaca cincelada", p: 35000, cat: "Mates", img: "img/productos/torpedo-alpaca-cincelada.webp", w: 600, h: 800 },
  { n: "Camionero criollo", p: 17000, cat: "Mates", img: "img/productos/camionero-criollo.webp", w: 600, h: 800 },
  { n: "Mate ranchero", p: 28000, cat: "Mates", img: "img/productos/mate-ranchero.webp", w: 600, h: 800 },
  { n: "Imperial algarrobo", p: 20000, cat: "Mates", img: "img/productos/imperial-algarrobo.webp", w: 600, h: 800 },
  { n: "Bombilla pico loro acero", p: 7000, cat: "Bombillas", img: "img/productos/bombilla-pico-loro-acero.webp", w: 600, h: 800 },
  { n: "Bombilla pico loro acero cincelada", p: 9000, cat: "Bombillas", img: "img/productos/bombilla-pico-loro-acero-cincelada.webp", w: 600, h: 800 },
  { n: "Matera", p: 20000, cat: "Accesorios", img: "img/productos/matera.webp", w: 446, h: 800 },
  { n: "Yerbera gamuzada", p: 10000, cat: "Accesorios", img: "img/productos/yerbera-gamuzada.webp", w: 594, h: 800 },
  { n: "Porta mate cuero", p: 7600, cat: "Accesorios", img: "img/productos/porta-mate-cuero.webp", w: 459, h: 800 },
  { n: "Mate acero", p: 12000, cat: "Mates", img: "img/productos/mate-acero.webp", w: 594, h: 800 },
  { n: "Torpedo cuero crudo B.A", p: 60000, cat: "Mates", img: "img/productos/torpedo-cuero-crudo-b-a.webp", w: 594, h: 800 },
  { n: "Bombilla rosca", p: 7000, cat: "Bombillas", img: "img/productos/bombilla-rosca.webp", w: 449, h: 800 },
  { n: "Termo pico system", p: 40000, cat: "Accesorios", img: "img/productos/termo-pico-system.webp", w: 594, h: 800 },
  { n: "Bolso cartera", p: 25000, cat: "Accesorios", img: "img/productos/bolso-cartera.webp", w: 367, h: 800 },
  { n: "Bombillón lacrado", p: 28000, cat: "Bombillas" },
  { n: "Torpedo premium croco", p: 50000, cat: "Mates", img: "img/productos/torpedo-premium-croco.webp", w: 699, h: 800, sinStock: true },
  { n: "Bombillón recto cincelado", p: 18000, cat: "Bombillas", img: "img/productos/bombillon-recto-cincelado.webp", w: 600, h: 800 },
  { n: "Camionero de calabaza", p: 18000, cat: "Mates", img: "img/productos/camionero-de-calabaza.webp", w: 446, h: 800 }
];
