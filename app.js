/*

  CLASES
*/
class Product {
  constructor(id, title, description, price, qty = 1) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.qty = qty;
  }
}

class Order {
  constructor(productsIdList) {
    this.idList = productsIdList;
  }

  get amount() {
    return this.idList.reduce((acc, cur) => acc + products.list[cur].price, 0);
  }

  get productsList() {
    const productsList = [];
    this.idList.forEach((id) => {
      const isInCart = productsList.some((product) => product.id === id);
      if (isInCart) {
        const productIndex = productsList.findIndex(
          (product) => product.id === id
        );
        productsList[productIndex].qty++;
      } else {
        productsList.push(Order.buildProduct(products.getProductById(id)));
      }
    });
    return productsList;
  }

  static buildProduct({ id, title, description, price }) {
    return new Product(id, title, description, price);
  }
}

/* 

  BASE DE DATOS
  Simula ser la API de una base de datos
*/
const products = {
  list: JSON.parse(localStorage.getItem("products-list")) ?? [
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
    const product = this.getProductById(id);
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
  noStock: "No nos queda stock de este producto",
  deliver(amount) {
    return `Son $${amount}, disfrute su comida.
    ${this.dismiss}`;
  },
};

/* 

  ESTADO
*/

const state = {
  cart: new Order(JSON.parse(localStorage.getItem("cart")) ?? []),
};

/* 

  ELEMENTOS DEL DOM
*/
const $modal = document.getElementById("modal");
const $cart = document.getElementById("modal-content");
const $cartBtn = document.getElementById("cart-btn");
const $shop = document.getElementById("shop");

/*

  FUNCIONES DE RENDERIZADO
*/

const renderShop = () => {
  $shop.innerHTML = "";
  products.list.forEach((product) => {
    $shop.appendChild(cardTemplate(product));
  });
};

const cardTemplate = ({ id, title, description, price, stock }) => {
  const card = document.createElement("article");
  card.classList.add("card", "textfield");
  const content = `
  <div class="flex-row-center card-container">
  <div class="card-info">
    <h3>${title}</h3>
    <p>${description}</p>
    <h3 class="price-tag">$ ${price}</h3>
    </div>
    <div class="card-actions">
      <a href="" data-product-id="${id}" class="add-btn btn-primary">Añadir al carrito</a>
      <h5> Stock: ${stock}</h5>
    </div>
  </div>
  `;
  card.innerHTML = content;

  if (!products.checkStock(id)) {
    const anchor = card.getElementsByTagName("a")[0];
    anchor.classList.add("btn-disabled");
    anchor.textContent = "Sin Stock";
  }
  return card;
};

const renderOrder = () => {
  $cart.innerHTML = "";
  $cart.appendChild(orderTemplate(state.cart));
  $cartBtn.textContent = `$ ${state.cart.amount} 🛒`;
};

const orderTemplate = ({ productsList, amount }) => {
  const $orderTemplate = document.createElement("div");
  $orderTemplate.classList.add("order-ticket");
  const content = `
    <h2>Tu pedido:</h2>
    <h2 class="order-price">$ ${amount} </h2>
    <h3>Detalle:</h3>
    <h3 class="empty-msg text-center">${msg.empty}</h3>
    
  `;
  const $detail = detailTemplate(productsList);
  $orderTemplate.innerHTML = content;

  if ($detail) {
    $orderTemplate.replaceChild(
      $detail,
      $orderTemplate.getElementsByClassName("empty-msg")[0]
    );

    const $orderBtns = document.createElement("div");
    $orderBtns.classList.add("order-btns");
    $orderBtns.innerHTML = `
      <a href="" id="buy-btn" class="btn-primary">Pagar💰</a>
      <a href="" id="clear-btn" class="btn-primary order-btn">Limpiar🧹</a>
    `;
    $orderTemplate.appendChild($orderBtns);
  }

  return $orderTemplate;
};

const detailTemplate = (productsList) => {
  const $orderDetail = document.createElement("table");
  if (productsList.length === 0) return;

  $orderDetail.classList.add("detail-table");
  const listHeader = document.createElement("tr");
  listHeader.innerHTML = `
  <th>Producto</th>
  <th>Cantidad</th>
  <th>Unitario</th>
  <th>Total</th>
  <th></th>
  `;
  $orderDetail.appendChild(listHeader);
  productsList.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${product.title}</td>
    <td>${product.qty}</td>
    <td>$ ${product.price}</td>
    <td>$ ${product.price * product.qty}</td>
    <a href="" data-product-id="${product.id}" class="remove-btn">❌</a>
    `;
    $orderDetail.appendChild(row);
  });
  return $orderDetail;
};

/*

  FUNCIONES OPERATIVAS
*/

const addToCart = (id) => {
  if (!products.checkStock(id)) {
    alert(msg.noStock);
    return;
  }
  products.updateStock(id, -1);
  console.log(`Adding: ${products.getProductById(id).title}`);
  updateState([...state.cart.idList, id]);
};

const removeFromCart = (id) => {
  const productsList = state.cart.idList.map((x) => x);
  productsList.splice(productsList.lastIndexOf(id), 1);

  products.updateStock(id, 1);
  console.log(`Removing: ${products.getProductById(id).title}`);
  updateState(productsList);
};

const clearCart = () => {
  let count = 0;
  state.cart.productsList.forEach((product) => {
    products.updateStock(product.id, product.qty);
    count += product.qty;
  });
  console.log(`Clearing cart. Removing ${count} products.`);
  updateState([]);
};

const updateState = (idList) => {
  state.cart = new Order(idList);
  console.log(state.cart.productsList);
  localStorage.setItem("cart", JSON.stringify(state.cart.idList));
  localStorage.setItem("products-list", JSON.stringify(products.list));
  renderShop();
  renderOrder();
};

const deliverOrder = (order) => {
  const amount = order.amount;
  if (amount <= 0) {
    alert(msg.empty);
    return;
  }
  alert(msg.deliver(amount));
  updateState([]);
  $modal.style.display = "none";
};

/* 

  LISTENERS
*/
$cartBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (state.cart.amount === 0) {
    alert(msg.empty);
    return;
  }
  $modal.style.display = "block";
});

$modal.addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    $modal.style.display = "none";
  }
});

$cart.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("remove-btn")) {
    const productId = parseInt(e.target.getAttribute("data-product-id"));
    removeFromCart(productId);
    return;
  }

  if (e.target.id === "buy-btn") {
    deliverOrder(state.cart);
    return;
  }

  if (e.target.id === "clear-btn") {
    clearCart();
    return;
  }
});

$shop.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("add-btn")) {
    const id = parseInt(e.target.getAttribute("data-product-id"));
    addToCart(id);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderShop();
  renderOrder();
});

/*

TESTING
*/

/* 
console.log("---------------------TESTING--------------------");

state.cart = new Order([1, 0, 1]);
console.log(state.cart.idList);
console.log(state.cart.productsList);*/
