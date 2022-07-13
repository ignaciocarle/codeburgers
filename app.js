/*

*/

class Product {
  constructor(title, description, price) {
    this.title = title;
    this.description = description;
    this.price = price;
  }
}

const cart = {
  products: [],
  total: 0,
};

/* 
Simula ser el array de objetos devueltos por una base de datos
*/
const productsList = [
  {
    id: 0,
    title: "Hamburguesa Basic Simple",
    description: "Una carne, doble cheddar y salsa",
    price: 500,
    stock: true,
  },
  {
    id: 1,
    title: "Hamburguesa Basic Doble",
    description: "Dos carnes, cuadruple cheddar y salsa",
    price: 700,
    stock: true,
  },
  {
    id: 2,
    title: "Hamburguesa Absolute Doble",
    description: "Dos carnes, cuadruple cheddar, bacon, cebolla crispy y salsa",
    price: 850,
    stock: true,
  },
  {
    id: 3,
    title: "Hamburguesa Absolute Cerdo",
    description:
      "Dos carnes de cerdo, cuadruple cheddar, bacon, cebolla crispy y salsa",
    price: 800,
    stock: false,
  },
];

const stock = productsList
  .filter((e) => e.stock === true)
  .map(({ title, description, price }) => {
    return new Product(title, description, price);
  });

const shop = document.querySelector("#shop");

const cardTemplate = ({ title, description, price }) => {
  return (
    `<h3>${title}</h3> ` +
    `<p>${description}</p> ` +
    `<h4>$ ${price}</h4> ` +
    `<button>Añadir al carrito</button> `
  );
};

const testCard = document.createElement("div");
testCard.classList.add("card", "tb1");

const renderProductList = (stock) => {
  stock.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("card", "tb1");
    card.innerHTML = cardTemplate(product);
    shop.appendChild(card);
  });
};

renderProductList(stock);
