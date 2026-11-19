'use strict';

const shop = (() => {
  const normalize = text => text.trim().toLowerCase();

  function filterProducts(items, filters = {}, favorites = new Set()) {
    const query = normalize(filters.query || '');
    const matching = items.filter(product =>
      normalize(product.name + ' ' + product.brand).includes(query) &&
      (!filters.brand || filters.brand === product.brand) &&
      (!filters.category || filters.category === product.category) &&
      (!filters.favoritesOnly || favorites.has(product.id))
    );
    if (filters.sort === 'asc') matching.sort((a, b) => a.price - b.price);
    if (filters.sort === 'desc') matching.sort((a, b) => b.price - a.price);
    return matching;
  }

  function changeQuantity(cart, productId, delta) {
    if (!Number.isInteger(delta)) return cart;
    const quantity = Math.max(0, (cart[productId] || 0) + delta);
    const updated = { ...cart };
    if (quantity === 0) delete updated[productId];
    else updated[productId] = quantity;
    return updated;
  }

  function cartTotal(cart, items) {
    return items.reduce((total, product) => total + product.price * (cart[product.id] || 0), 0);
  }

  function validateCheckout(data, count) {
    if (count < 1) return 'Спочатку додайте товар до кошика.';
    if (data.name.trim().split(/\s+/).length < 2) return 'Укажіть ім’я та прізвище.';
    if (!/^\+?[0-9 ()-]+$/.test(data.phone.trim()) || !/^[0-9]{10,15}$/.test(data.phone.replace(/[^0-9]/g, ''))) {
      return 'Укажіть номер телефону з 10–15 цифрами.';
    }
    if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      return 'Укажіть коректну електронну адресу.';
    }
    return '';
  }


  const storageKey = 'bag-boutique:v1';

  function loadState(storage, items) {
    try {
      const state = JSON.parse(storage.getItem(storageKey));
      const ids = new Set(items.map(product => product.id));
      const cart = Object.fromEntries(Object.entries(state?.cart || {}).filter(
        ([id, quantity]) => ids.has(id) && Number.isSafeInteger(quantity) && quantity > 0
      ));
      const favorites = new Set(Array.isArray(state?.favorites) ? state.favorites.filter(id => ids.has(id)) : []);
      return { cart, favorites };
    } catch {
      return { cart: {}, favorites: new Set() };
    }
  }

  function saveState(storage, cart, favorites) {
    try { storage.setItem(storageKey, JSON.stringify({ cart, favorites: [...favorites] })); }
    catch { /* The shop remains usable in memory. */ }
  }

  return { filterProducts, changeQuantity, cartTotal, validateCheckout, loadState, saveState };
})();
if (typeof module !== 'undefined') module.exports = shop;
