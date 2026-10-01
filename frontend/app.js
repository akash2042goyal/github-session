const products = [
  {
    id: "daybreak-pack",
    name: "Daybreak Pack",
    category: "Packs",
    detail: "18L recycled nylon · Moss",
    price: 88,
    badge: "Best seller",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=82",
    alt: "Olive hiking backpack resting outdoors"
  },
  {
    id: "trail-flask",
    name: "Trail Flask",
    category: "Field gear",
    detail: "750ml stainless steel · Clay",
    price: 34,
    badge: "Made to last",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=82",
    alt: "Reusable water bottle for a day on the trail"
  },
  {
    id: "switchback-fleece",
    name: "Switchback Fleece",
    category: "Apparel",
    detail: "Recycled pile · Fern",
    price: 112,
    badge: "New color",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=82",
    alt: "Warm outdoor jacket in a muted green tone"
  },
  {
    id: "camp-mug",
    name: "Camp Mug Set",
    category: "Field gear",
    detail: "Enamel steel · Set of two",
    price: 28,
    badge: "Good company",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=82",
    alt: "Simple camp cup ready for a fireside coffee"
  },
  {
    id: "ridge-cap",
    name: "Ridge Cap",
    category: "Apparel",
    detail: "Organic cotton · Rust",
    price: 38,
    badge: "Easy favorite",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=82",
    alt: "Everyday cotton cap in a warm earth tone"
  },
  {
    id: "field-blanket",
    name: "Field Blanket",
    category: "Field gear",
    detail: "Recycled wool blend · Check",
    price: 96,
    badge: "A little extra",
    image: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=900&q=82",
    alt: "Folded outdoor blanket for a picnic or campsite"
  },
  {
    id: "sidepath-tote",
    name: "Sidepath Tote",
    category: "Packs",
    detail: "Heavy canvas · Natural",
    price: 42,
    badge: "Everyday carry",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=82",
    alt: "Durable canvas carry bag"
  },
  {
    id: "pocket-light",
    name: "Pocket Light",
    category: "Field gear",
    detail: "USB-C rechargeable · Amber",
    price: 46,
    badge: "Small but mighty",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=82",
    alt: "Compact warm light for evenings outdoors"
  }
];

const FREE_SHIPPING_THRESHOLD = 75;
const CART_STORAGE_KEY = "lowland-cart-v1";
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#product-search");
const sortSelect = document.querySelector("#sort-products");
const emptyResults = document.querySelector("#empty-results");
const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const checkoutDialog = document.querySelector("#checkout-dialog");
const toast = document.querySelector("#toast");

let selectedCategory = "All";
let toastTimer;
let cart = loadCart();

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((item) => products.some((product) => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0);
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = `${product.name} ${product.category} ${product.detail}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (sortSelect.value === "price-low") visibleProducts = visibleProducts.toSorted((a, b) => a.price - b.price);
  if (sortSelect.value === "price-high") visibleProducts = visibleProducts.toSorted((a, b) => b.price - a.price);
  if (sortSelect.value === "name") visibleProducts = visibleProducts.toSorted((a, b) => a.name.localeCompare(b.name));

  productGrid.innerHTML = visibleProducts.map((product, index) => `
    <article class="product-card" style="animation-delay:${Math.min(index * 45, 225)}ms">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy">
        <span class="product-tag">${product.badge}</span>
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">+</button>
      </div>
      <div class="product-info">
        <div><h3 class="product-name">${product.name}</h3><p class="product-detail">${product.detail}</p></div>
        <span class="product-price">${currency.format(product.price)}</span>
      </div>
    </article>
  `).join("");
  document.querySelector("#product-total").textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "piece" : "pieces"}`;
  emptyResults.hidden = visibleProducts.length !== 0;
}

function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return total + product.price * item.quantity;
  }, 0);
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#drawer-count").textContent = `(${count})`;
  document.querySelector("#cart-empty").hidden = count > 0;
  document.querySelector("#cart-footer").hidden = count === 0;
  document.querySelector("#cart-subtotal").textContent = currency.format(subtotal);

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  document.querySelector("#shipping-message").textContent = remaining > 0
    ? `You’re ${currency.format(remaining)} away from free shipping.`
    : "You unlocked free shipping. Nice one.";

  document.querySelector("#cart-items").innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `
      <article class="cart-line">
        <img src="${product.image}" alt="" loading="lazy">
        <div class="cart-line-info">
          <span class="cart-line-name">${product.name}</span>
          <span class="cart-line-detail">${product.detail}</span>
          <div class="quantity-control" aria-label="Quantity for ${product.name}">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div><span class="cart-line-price">${currency.format(product.price * item.quantity)}</span><button class="remove-button" type="button" data-remove="${product.id}">Remove</button></div>
      </article>
    `;
  }).join("");
}

function setCartOpen(open) {
  cartDrawer.classList.toggle("is-open", open);
  cartDrawer.setAttribute("aria-hidden", String(!open));
  cartDrawer.inert = !open;
  drawerBackdrop.hidden = !open;
  document.body.classList.toggle("has-open-drawer", open);
  if (open) document.querySelector("#close-cart").focus();
  else document.querySelector("#open-cart").focus();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2300);
}

function changeQuantity(id, amount) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== id);
  saveCart();
  renderCart();
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const product = products.find((entry) => entry.id === button.dataset.add);
  const item = cart.find((entry) => entry.id === product.id);
  if (item) item.quantity += 1;
  else cart.push({ id: product.id, quantity: 1 });
  saveCart();
  renderCart();
  showToast(`${product.name} added to your bag`);
});

document.querySelector(".category-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  document.querySelectorAll(".category-button").forEach((categoryButton) => {
    categoryButton.classList.toggle("is-active", categoryButton === button);
  });
  renderProducts();
});

document.querySelectorAll("[data-nav-category]").forEach((link) => {
  link.addEventListener("click", () => {
    selectedCategory = link.dataset.navCategory;
    document.querySelectorAll(".category-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.category === selectedCategory);
    });
    renderProducts();
  });
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
document.querySelector("#open-cart").addEventListener("click", () => setCartOpen(true));
document.querySelector("#close-cart").addEventListener("click", () => setCartOpen(false));
drawerBackdrop.addEventListener("click", () => setCartOpen(false));
document.querySelector("#continue-shopping").addEventListener("click", () => setCartOpen(false));
document.querySelector("#continue-shopping-filled").addEventListener("click", () => setCartOpen(false));

document.querySelector("#cart-items").addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQuantity(quantityButton.dataset.quantity, Number(quantityButton.dataset.change));
  if (removeButton) {
    cart = cart.filter((item) => item.id !== removeButton.dataset.remove);
    saveCart();
    renderCart();
  }
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + products.find((product) => product.id === item.id).price * item.quantity, 0);
  document.querySelector("#checkout-summary").innerHTML = `<span>${count} ${count === 1 ? "item" : "items"}</span><strong>${currency.format(subtotal)}</strong>`;
  checkoutDialog.showModal();
});

document.querySelector("#close-checkout").addEventListener("click", () => checkoutDialog.close());
checkoutDialog.addEventListener("click", (event) => {
  if (event.target === checkoutDialog) checkoutDialog.close();
});
document.querySelector("#checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const orderNumber = `LL-${Math.floor(100000 + Math.random() * 900000)}`;
  cart = [];
  saveCart();
  renderCart();
  checkoutDialog.close();
  setCartOpen(false);
  event.currentTarget.reset();
  showToast(`Order ${orderNumber} placed. Thanks for heading out with us.`);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open") && !checkoutDialog.open) setCartOpen(false);
});

renderProducts();
renderCart();