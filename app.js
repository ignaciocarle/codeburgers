/*
_______________________________________________________________________________
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
_______________________________________________________________________________
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
  const productList = localStorage.getItem("products-list");
  if (productList) {
    products.list = JSON.parse(productList);
    return;
  }

  const resp = await fetch("./db.json");
  const db = await resp.json();
  products.list = db.products;
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
_______________________________________________________________________________
  ESTADO
*/

const state = {
  cart: new Cart(JSON.parse(localStorage.getItem("cart")) ?? []),
};

/* 
_______________________________________________________________________________
  ELEMENTOS DEL DOM
*/
const $modal = document.getElementById("modal");
const $cart = document.getElementById("cart");
const $cartBtn = document.getElementById("cart-btn");
const $shop = document.getElementById("shop");

/* 
_______________________________________________________________________________
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
      deliverOrder();
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
_______________________________________________________________________________
  FUNCIONES DE RENDERIZADO
*/

/**
 * Render the price tag on the header's cart button.
 */
function updateCartBtn() {
  $cartBtn.textContent = `$ ${state.cart.amount} 🛒`;
}

/**
 * Render the shop div iterating through the DB's products list.
 */
function renderShop() {
  $shop.innerHTML = "";
  products.list.forEach((product) => {
    $shop.appendChild(cardTemplate(product));
  });
}

/**
 * @param product - A product form the DB.
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
 */
function renderCart() {
  $cart.innerHTML = "";
  $cart.appendChild(cartTemplate(state.cart));
}

/**
 * Create a template for the order section of the page.
 * @param cart - A Cart class instance.
 * @returns A div element with the order details and actions.
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

/**
 * @param productsList - An array of Products.
 * @returns A table with the products in the order.
 */
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

/**
 * Create a toast notification using Toastify.
 * @param text - The text to be displayed in the toast.
 * @param className - The class name of the toast.
 * @param duration - The duration of the toast in milliseconds.
 */
function alertToast(text, className, duration) {
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
    duration: duration ?? 3000,
  };

  Toastify(config).showToast();
}

/*
_______________________________________________________________________________
  FUNCIONES OPERATIVAS
*/

/**
 * Update the state of the cart, update Local Storage, then update UI elements.
 * @param idList - An array of product ids.
 */
function updateState(idList) {
  state.cart = new Cart(idList);
  console.log(state.cart.productsList);
  localStorage.setItem("cart", JSON.stringify(state.cart.idList));
  localStorage.setItem("products-list", JSON.stringify(products.list));
  updateCartBtn();
  renderShop();
  renderCart();
}

/**
 * If the product is in stock, add it to the cart and update the stock.
 * @param id - The id of the product to be added to the cart.
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

/**
 * Remove a product from the cart and update stock.
 * @param id - The id of the product to be removed from the cart.
 */
function removeFromCart(id) {
  const productsList = state.cart.idList.map((x) => x);
  const productName = products.getProductById(id).title;

  productsList.splice(productsList.lastIndexOf(id), 1);
  products.updateStock(id, 1);
  console.log(`Removing: ${productName}`);
  updateState(productsList);
  alertToast(msg.productRemoved(productName), "toast-warning");
}

/**
 * Clear the cart and return items to stock.
 */
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

/**
 * If the cart is empty, show a warning message,
 * otherwise show a success message and update the state.
 */
function deliverOrder() {
  const cart = state.cart;
  const amount = cart.amount;
  if (cart.idList === []) {
    alertToast(msg.empty, "toast-warning");
    return;
  }
  alertToast(msg.deliver(amount), "toast-success", 5000);
  updateState([]);
  $modal.style.display = "none";
}

/*
_______________________________________________________________________________
  EJECUCIÓN INICAL
*/

document.addEventListener("DOMContentLoaded", () => {
  getProductsFromDb().then(() => {
    updateCartBtn();
    renderShop();
    renderCart();
    loadEventListeners();
  });
});
