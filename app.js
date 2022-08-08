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

class Cart {
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
        productsList.push(Cart.buildProduct(products.getProductById(id)));
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
  list: [],

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

async function getProductsFromDb() {
  const resp = await fetch("./db.json");
  const db = await resp.json();
  const productsList = db.products;
  products.list =
    JSON.parse(localStorage.getItem("products-list")) ?? productsList;
}

const msg = {
  dismiss: "Muchas gracias, vuelva prontos!",
  empty: "Tu pedido está vacío.",
  noStock: "No nos queda stock de este producto.",
  cartCleared: `Has vaciado el carrito.`,
  deliver(amount) {
    return `Son $${amount}, disfrute su comida.
    ${this.dismiss}`;
  },
  productAdded(productName) {
    return `Has añadido:
    1 x ${productName} al carrito.`;
  },
  productRemoved(productName) {
    return `Has quitado:
    1 x ${productName} del carrito.`;
  },
};

/* 

  ESTADO
*/

const state = {
  cart: new Cart(JSON.parse(localStorage.getItem("cart")) ?? []),
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

function renderXChar(length, char) {
  return new Array(length).fill(char).join("");
}

/**
 * For each product in the products array, append a card to the shop div.
 */
function renderShop() {
  $shop.innerHTML = "";
  products.list.forEach((product) => {
    $shop.appendChild(cardTemplate(product));
  });
}

/**
 * @param product a product form the DB.
 * @returns A card element with the product information.
 */
function cardTemplate({ id, title, description, price, stock }) {
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
}

/**
 * Render the cart template on a modal element
 * and the price tag on the header's cart button
 */
function renderCart() {
  $cart.innerHTML = "";
  $cart.appendChild(cartTemplate(state.cart));
  $cartBtn.textContent = `$ ${state.cart.amount} 🛒`;
}

/**
 * Creates a template for the order section of the page.
 * @returns A div element with the class order-ticket.
 */
function cartTemplate({ productsList, amount }) {
  const $cartTemplate = document.createElement("div");
  $cartTemplate.classList.add("order-ticket");
  const content = `
    <h2>Tu pedido:</h2>
    <h2 class="order-price">$ ${amount} </h2>
    <h3>Detalle:</h3>
    <h3 class="empty-msg text-center">${msg.empty}</h3>
  `;
  const $detail = detailTemplate(productsList);
  $cartTemplate.innerHTML = content;

  if ($detail) {
    $cartTemplate.replaceChild(
      $detail,
      $cartTemplate.getElementsByClassName("empty-msg")[0]
    );

    const $cartBtns = document.createElement("div");
    $cartBtns.classList.add("cart-btns");
    $cartBtns.innerHTML = `
      <a href="" id="buy-btn" class="btn-primary">Pagar💰</a>
      <a href="" id="clear-btn" class="btn-primary order-btn">Limpiar🧹</a>
    `;
    $cartTemplate.appendChild($cartBtns);
  }

  return $cartTemplate;
}

function detailTemplate(productsList) {
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
}

function orderTemplate() {} //aca poner algo para que se muestre al final del pedido

function alertToast(text, className) {
  const config = {
    text: text,
    className: className,
    style: {
      maxWidth: "17%",
      background: "var(--primary-700)",
      borderRadius: "1rem",
    },
    offset: {
      y: "25vh",
    },
  };

  Toastify(config).showToast();
}

/*

  FUNCIONES OPERATIVAS
*/

function addToCart(id) {
  if (!products.checkStock(id)) {
    alertToast(msg.noStock, "toast-warning");
    return;
  }
  const productsList = state.cart.idList.map((x) => x);
  const productName = products.getProductById(id).title;

  products.updateStock(id, -1);
  console.log(`Adding: ${productName}`);
  updateState([...productsList, id]);
  alertToast(msg.productAdded(productName));
}

function removeFromCart(id) {
  const productsList = state.cart.idList.map((x) => x);
  const productName = products.getProductById(id).title;

  productsList.splice(productsList.lastIndexOf(id), 1);
  products.updateStock(id, 1);
  console.log(`Removing: ${productName}`);
  updateState(productsList);
  alertToast(msg.productRemoved(productName), "toast-warning");
}

function clearCart() {
  let count = 0;
  state.cart.productsList.forEach((product) => {
    products.updateStock(product.id, product.qty);
    count += product.qty;
  });
  console.log(`Clearing cart. Removing ${count} products.`);
  updateState([]);
  alertToast(msg.cartCleared, "toast-warning");
}

function updateState(idList) {
  state.cart = new Cart(idList);
  console.log(state.cart.productsList);
  localStorage.setItem("cart", JSON.stringify(state.cart.idList));
  localStorage.setItem("products-list", JSON.stringify(products.list));
  renderShop();
  renderCart();
}

function deliverOrder(cart) {
  const amount = cart.amount;
  if (amount <= 0) {
    alertToast(msg.empty, "toast-warning");
    return;
  }
  alertToast(msg.deliver(amount));
  updateState([]);
  $modal.style.display = "none";
}

/* 

  LISTENERS
*/

function loadEventListeners() {
  $cartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (state.cart.amount === 0) {
      alertToast(msg.empty, "toast-warning");
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
}

/*

EJECUCIÓN INICAL
*/

document.addEventListener("DOMContentLoaded", () => {
  getProductsFromDb().then(() => {
    renderShop();
    renderCart();
    loadEventListeners();
  });
});

/*

TESTING
*/

/* 
console.log("---------------------TESTING--------------------");

const $testBtn = document.getElementById("toast");

$testBtn.addEventListener("click", () => {
  alertToast("Hola manola", "toast-warning");
});
*/
