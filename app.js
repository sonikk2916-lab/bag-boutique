'use strict';

const get = id => document.getElementById(id);
const dialog = get('cart');
const form = document.querySelector('form');
const controls = ['search', 'brand', 'category', 'sort'].map(get);
let cart = {};
const favorites = new Set();
let favoritesOnly = false;
let noticeTimer;

function button(label, onClick) {
  const node = document.createElement('button');
  node.type = 'button';
  node.textContent = label;
  node.addEventListener('click', onClick);
  return node;
}

function notify(message) {
  const notice = get('notice');
  notice.textContent = message;
  notice.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { notice.hidden = true; }, 2500);
}

function updateQuantity(id, delta) {
  cart = shop.changeQuantity(cart, id, delta);
  renderCart();
}

const catalog = document.querySelector('#catalog');
const currency = new Intl.NumberFormat('uk-UA');
function showCards(items) {
  catalog.replaceChildren(...items.map(product => {
    const card = document.createElement('article');
    card.className = 'card';
    const image = document.createElement('img');
    image.src = 'images/' + product.photo;
    image.alt = product.name + ' — ' + product.brand;
    const name = document.createElement('h3');
    name.textContent = product.name;
    const category = document.createElement('p');
    category.textContent = product.brand + ' · ' + product.category;
    const description = document.createElement('p');
    description.textContent = product.description;
    const price = document.createElement('strong');
    price.textContent = currency.format(product.price) + ' грн';
    const add = button('До кошика', () => {
      updateQuantity(product.id, 1);
      notify(product.name + ' додано до кошика.');
    });
    const favorite = button(favorites.has(product.id) ? '♥ Обране' : '♡ Обране', () => {
      if (favorites.has(product.id)) favorites.delete(product.id);
      else favorites.add(product.id);
      renderCatalog();
      catalog.querySelector('[data-favorite="' + product.id + '"]')?.focus();
    });
    favorite.dataset.favorite = product.id;
    favorite.setAttribute('aria-pressed', String(favorites.has(product.id)));
    card.append(image, name, category, description, price, add, favorite);
    return card;
  }));
}

function renderCatalog() {
  const [query, brand, category, sort] = controls.map(control => control.value);
  const matches = shop.filterProducts(products, { query, brand, category, sort, favoritesOnly }, favorites);
  showCards(matches);
  get('empty').hidden = matches.length > 0;
  get('favorites').setAttribute('aria-pressed', String(favoritesOnly));
}

function renderCart() {
  const lines = products.filter(product => cart[product.id]).map(product => {
    const line = document.createElement('p');
    const quantity = cart[product.id];
    line.textContent = product.name + ' (' + product.brand + ') × ' + quantity + ' ';
    const minus = button('−', () => updateQuantity(product.id, -1));
    minus.setAttribute('aria-label', 'Зменшити кількість — ' + product.name + ' ' + product.brand);
    const plus = button('+', () => updateQuantity(product.id, 1));
    plus.setAttribute('aria-label', 'Збільшити кількість — ' + product.name + ' ' + product.brand);
    line.append(minus, plus, button('Видалити', () => updateQuantity(product.id, -quantity)));
    return line;
  });
  get('positions').replaceChildren(...lines);
  if (!lines.length) get('positions').textContent = 'Кошик поки порожній.';
  get('count').textContent = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  get('total').textContent = currency.format(shop.cartTotal(cart, products)) + ' грн';
}

controls.forEach(control => control.addEventListener('input', renderCatalog));
get('favorites').addEventListener('click', () => { favoritesOnly = !favoritesOnly; renderCatalog(); });
get('reset').addEventListener('click', () => {
  controls.forEach(control => { control.value = ''; });
  favoritesOnly = false;
  renderCatalog();
});
get('open-cart').addEventListener('click', () => dialog.showModal());
get('close-cart').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
get('to-checkout').addEventListener('click', () => {
  dialog.close();
  form.elements.customer.focus();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const { customer, phone, email } = form.elements;
  const error = shop.validateCheckout({ name: customer.value, phone: phone.value, email: email.value }, Object.keys(cart).length);
  get('message').textContent = error || 'Дякуємо! Ваше замовлення оформлено. Оплата не проводилася.';
  if (error) return;
  cart = {};
  form.reset();
  renderCart();
});
renderCatalog();
renderCart();
