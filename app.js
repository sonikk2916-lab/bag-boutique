'use strict';
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
    card.append(image, name, category, description, price);
    return card;
  }));
}
showCards(products);
