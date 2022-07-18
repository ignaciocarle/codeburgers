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
  updateStock(id, value) {
    const product = this.list.find((ele) => ele.id === id);
    product.stock += value;
  },
};

const msg = {
  welcome: "Bienvenide a Codeburguers, deseas hacer un pedido?",
  dismiss: "Muchas gracias, vuelva prontos!",
  bounce: "Otra vez será, vuelva prontos!",
  invalidInput: "Entrada incorrecta por favor intenta de nuevo",
  addMore: "Desea añadir otro producto?",
  empty: "Tu pedido está vacío.",
  addProduct() {
    let memo = nl + nl;
    stock.map(({ id, title, price }) => {
      const line = "  " + (id + 1) + " - " + title + "$ " + price + nl;
      memo += line;
    });
    const msg = `Ingresá el número para agregar un producto:${memo}`;
    return msg;
  },
};

/* 

  ESTADO
*/
const cart = {
  products: [],
  total: 0,
};

/* 

  ELEMENTOS DEL DOM
*/
const $shop = document.getElementById("shop");
const $orderTicket = document.getElementById("order-ticket");

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
    return stock.find((product) => product.id === id);
  }

  sumAmount() {
    return this.productsIdList.reduce((acc, cur) => acc + stock[cur].price, 0);
  }
}

/* 

  VARIABLES GLOBALES
*/
const nl = `
`;
let stock = [];

/*

  FUNCIONES DE RENDERIZADO
*/
const renderShop = () => {
  stock.forEach((product) => {
    $shop.appendChild(cardTemplate(product));
  });
};

const cardTemplate = ({ title, description, price }) => {
  const card = document.createElement("article");
  card.classList.add("card", "textfield");
  const elements = `
  <div class="flex-col-center">
    <h3>${title}</h3>
    <p>${description}</p>
    <h4>$ ${price}</h4>
  </div>
    `;
  //<button>Añadir al carrito</button>
  card.innerHTML = elements;
  return card;
};

const printTicket = (order) => {
  $orderTicket.innerHTML = "";
  $orderTicket.appendChild(ticketTemplate(order));
  $orderTicket.classList.remove("hidden");
};

const ticketTemplate = ({ productsList, amount }) => {
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
  <th>Producto</th>
  <th>Precio</th>
  `;
  list.appendChild(listHeader);
  productsList.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${product.title}</td>
    <td>$ ${product.price}</td
    `;
    list.appendChild(row);
  });
  return list;
};

/*

  FUNCIONES OPERATIVAS
*/
const syncStock = () => {
  stock = products.list
    .filter((product) => product.stock >= 1)
    .map(
      ({ id, title, description, price }) =>
        new Product(id, title, description, price)
    );
};

const init = () => {
  console.log("Inicializado");
  if (!confirm(msg.welcome)) {
    console.log("Rebotado");
    alert(msg.bounce);
    return;
  }

  const order = takeOrder();
  if (order.productsIdList.length <= 0) {
    alert(msg.empty);
    return;
  }
  printTicket(order);
  alert(msg.dismiss);
};

const takeOrder = () => {
  console.log("Tomando pedido");
  const productsIdList = [];

  do {
    const newProduct = addProduct();
    if (newProduct !== undefined) productsIdList.push(newProduct);
    console.log(`productIdList actualizado:`);
    console.log(productsIdList);
  } while (confirm(msg.addMore));

  const newOrder = new Order(productsIdList);
  console.log("Nueva orden creada:");
  console.log(newOrder);
  return newOrder;
};

/* addProduct devuelve un Id de producto del stock o pide input,
con cancel se devuelve el control a la función de mayor orden
*/
const addProduct = () => {
  const userInput = prompt(msg.addProduct());

  if (userInput === null) return;

  const newProduct = stock.find(
    (product) => product.id + 1 === parseInt(userInput)
  );

  if (!newProduct) {
    alert(msg.invalidInput);
    return addProduct();
  }

  console.log(`Producto elegido: ${newProduct.id + 1}`);
  return newProduct.id;
};

/* 

  ZONA DE EJECUCIÓN INICIAL
*/

syncStock();
renderShop();

/*

TESTING
*/

/* 
console.log("---------------------TESTING--------------------");
const testOrder = new Order([0, 2, 1, 2]);
console.log(testOrder);


const testStock = () => {
  products.updStock(1, -1);
  console.log(products.list[1].stock);
};
*/
