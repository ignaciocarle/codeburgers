/*

  CLASES
*/
class Product {
  constructor(id, title, description, price, qty = 0) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.qty = qty;
  }
}

class Order {
  constructor(productsIdList) {
    this.productsIdList = productsIdList;
    this.productsList = this.productsIdList.map(this.getProductById);
    this.amount = this.sumAmount();
  }

  getProductById(id) {
    return products.list.find((product) => product.id === id);
  }

  sumAmount() {
    return this.productsIdList.reduce(
      (acc, cur) => acc + products.list[cur].price,
      0
    );
  }
}

/* 

  BASE DE DATOS
  Simula ser la API de una base de datos
*/
const products = {
  list: [
    {
      id: 0,
      title: "Hamburguesa Basic Simple",
      description: "Una carne, doble cheddar y salsa",
      price: 500,
      stock: 50,
    },
    {
      id: 1,
      title: "Hamburguesa Basic Doble",
      description: "Dos carnes, cuadruple cheddar y salsa",
      price: 700,
      stock: 50,
    },
    {
      id: 2,
      title: "Hamburguesa Absolute Doble",
      description:
        "Dos carnes, cuadruple cheddar, bacon, cebolla crispy y salsa",
      price: 850,
      stock: 1,
    },
    {
      id: 3,
      title: "Hamburguesa Absolute Cerdo",
      description:
        "Dos carnes de cerdo, cuadruple cheddar, bacon, cebolla crispy y salsa",
      price: 800,
      stock: 0,
    },
  ],
  checkStock(id) {
    return this.list[id].stock >= 1;
  },
  updateStock(id, value) {
    const product = this.list.find((ele) => ele.id === id);
    product.stock += value;
  },
  getProductById(id) {
    return this.list.find((product) => product.id === id);
  },
};

const msg = {
  welcome: "Bienvenide a Codeburguers, deseas hacer un pedido?",
  dismiss: "Muchas gracias, vuelva prontos!",
  bounce: "Otra vez será, vuelva prontos!",
  invalidInput: "Entrada incorrecta por favor intenta de nuevo",
  addMore: "Desea añadir otro producto?",
  empty: "Tu pedido está vacío.",
  noStock: "No tenemos stock de este producto",
};

/* 

  VARIABLES GLOBALES
*/
const nl = `
`;

/* 

  ESTADO
*/

const state = {
  cart: new Order([]),
};
const cart = {
  products: [],
  total: 0,
};

/* 

  ELEMENTOS DEL DOM
*/
const $shop = document.getElementById("shop");
const $orderTicket = document.getElementById("order-ticket");
const $cartBtn = document.getElementById("cart-btn");

/*

  FUNCIONES DE RENDERIZADO
*/

const renderShop = () => {
  products.list.forEach((product) => {
    $shop.appendChild(cardTemplate(product));
  });
};

const cardTemplate = ({ id, title, description, price }) => {
  const card = document.createElement("article");
  card.classList.add("card", "textfield");
  const elements = `
  <div class="flex-col-center">
    <h3>${title}</h3>
    <p>${description}</p>
    <h4>$ ${price}</h4>
    <a href="" id="${id}" class="add-btn btn-primary">Añadir al carrito</a>
  </div>
  `;
  card.innerHTML = elements;
  return card;
};

const renderOrder = (order) => {
  $orderTicket.innerHTML = "";
  $orderTicket.appendChild(orderTemplate(order));
  $orderTicket.classList.remove("hidden");
  $cartBtn.textContent = `$ ${order.amount} 🛒`;
};

const orderTemplate = ({ productsList, amount }) => {
  const ticket = document.createElement("div");
  const detail = detailTemplate(productsList);
  const content = `
    <h2>Tu pedido:</h2>
    <h2>$ ${amount} </h2>
    <hr>
    <h3>Detalle:</h3>
  `;
  ticket.innerHTML = content;
  ticket.appendChild(detail);
  return ticket;
};

const detailTemplate = (productsList) => {
  const list = document.createElement("table");
  list.classList.add("detail-table");
  const listHeader = document.createElement("tr");
  listHeader.innerHTML = `
  <th>#</th>
  <th>Producto</th>
  <th>Precio</th>
  <th></th>
  `;
  list.appendChild(listHeader);
  productsList.forEach((product, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${index + 1}</td>
    <td>${product.title}</td>
    <td>$ ${product.price}</td
    <td><a href="" class="remove-cart-btn" data-row="${index}">❌</td
    `;
    list.appendChild(row);
  });
  return list;
};

/*

  FUNCIONES OPERATIVAS
*/

const addToCart = (id) => {
  if (!products.checkStock(id)) {
    alert(msg.noStock);
    return;
  }
  const newOrder = new Order([...state.cart.productsIdList, id]);
  products.updateStock(id, -1);
  updateCart(newOrder);
  console.log(`Añadido al carrito: ${products.getProductById(id).title}`);
};

const removeFromCart = (row) => {
  const idList = state.cart.productsIdList.map((e) => e);
  const id = idList[row];
  if (idList[row] === undefined) return;

  idList.splice(row, 1);
  const newOrder = new Order(idList);
  products.updateStock(id, 1);
  updateCart(newOrder);
  console.log(`Eliminado del carrito: ${products.getProductById(id).title}`);
};

const updateCart = (order) => {
  state.cart = order;
  renderOrder(order);
};

/* 

  LISTENERS
*/
$shop.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("add-btn")) {
    const id = parseInt(e.target.getAttribute("id"));
    addToCart(id);
  }
});

$orderTicket.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("remove-cart-btn")) {
    const rowId = parseInt(e.target.getAttribute("data-row"));
    removeFromCart(rowId);
  }
});

$cartBtn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log(state.cart);
});

/* 

  ZONA DE EJECUCIÓN INICIAL
*/

renderShop();

/*

TESTING
*/

console.log("---------------------TESTING--------------------");
/* 
const testOrder = new Order([0, 2, 1, 2]);
console.log(testOrder);


const testStock = () => {
  products.updStock(1, -1);
  console.log(products.list[1].stock);
};
*/
