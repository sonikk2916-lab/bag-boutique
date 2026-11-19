const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const shop = require('../logic.js');
const products = vm.runInNewContext(fs.readFileSync(__dirname + '/../catalog.js', 'utf8') + '\nproducts');
const valid = { name: 'Олена Коваль', phone: '+380 67 123 45 67', email: '' };

test('T01 — комбінована фільтрація, сортування та порожній пошук', () => {
  const result = shop.filterProducts(products, { query: ' класика ', category: 'На кожен день', sort: 'asc' });
  assert.equal(result.map(p => p.price).join(','), '88000,270000');
  assert.equal(shop.filterProducts(products, { query: 'немає-такого' }).length, 0);
});
test('T02 — різні ID для двох Класик і коректна сума', () => {
  let cart = shop.changeQuantity({}, 'chanel-classic', 1);
  cart = shop.changeQuantity(cart, 'miumiu-classic', 2);
  assert.equal(shop.cartTotal(cart, products), 446000);
  cart = shop.changeQuantity(cart, 'miumiu-classic', -2);
  assert.equal(cart['miumiu-classic'], undefined);
  assert.equal(shop.cartTotal(cart, products), 270000);
});
test('T03 — невалідний телефон, порожній кошик і коректна форма', () => {
  assert.match(shop.validateCheckout({ ...valid, phone: 'abc' }, 1), /телефон/);
  assert.match(shop.validateCheckout(valid, 0), /кошика/);
  assert.equal(shop.validateCheckout(valid, 1), '');
});
test('T04 — перевірка необов’язкового email і повного імені', () => {
  assert.match(shop.validateCheckout({ ...valid, email: 'bad@' }, 1), /електронну/);
  assert.match(shop.validateCheckout({ ...valid, name: 'Олена' }, 1), /прізвище/);
  assert.equal(shop.validateCheckout({ ...valid, email: 'test@example.com' }, 1), '');
});
