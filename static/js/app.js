const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose = document.getElementById("cartClose");
const cartItemsEl = document.getElementById("cartItems");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const clearBtn = document.getElementById("clearBtn");
const toastLayer = document.getElementById("toastLayer");

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastLayer.appendChild(toast);
  setTimeout(() => toast.remove(), 1900);
}

function money(n) {
  return `Rs ${n.toLocaleString("en-LK")}`;
}

async function refreshCart() {
  const res = await fetch("/api/cart");
  const data = await res.json();

  cartCountEl.textContent = data.count;
  cartTotalEl.textContent = money(data.total);

  cartItemsEl.innerHTML = "";
  if (data.items.length === 0) {
    cartItemsEl.appendChild(cartEmptyEl);
    return;
  }

  data.items.forEach((item) => {
    const line = document.createElement("div");
    line.className = "cart-line";
    line.innerHTML = `
      <div>
        <div>${item.name}</div>
        <div class="cart-line-meta">Qty ${item.qty} · ${money(item.price)} each</div>
      </div>
      <div>${money(item.line_total)}</div>
    `;
    cartItemsEl.appendChild(line);
  });
}

function openCart() {
  cartDrawer.classList.add("show");
  cartOverlay.classList.add("show");
  refreshCart();
}
function closeCart() {
  cartDrawer.classList.remove("show");
  cartOverlay.classList.remove("show");
}

cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.querySelectorAll(".add-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const card = btn.closest(".product-card");
    const productId = card.dataset.productId;
    const name = card.querySelector(".product-name").textContent;

    btn.classList.add("added");
    btn.textContent = "Added";
    setTimeout(() => {
      btn.classList.remove("added");
      btn.textContent = "Add to bag";
    }, 900);

    const res = await fetch(`/api/cart/add/${productId}`, { method: "POST" });
    const data = await res.json();

    cartCountEl.textContent = data.count;
    showToast(`${name} added to bag`);
  });
});

clearBtn.addEventListener("click", async () => {
  await fetch("/api/cart/clear", { method: "POST" });
  refreshCart();
});

// ---------- Product photo dots (swap images) ----------
document.querySelectorAll(".product-media").forEach((media) => {
  const dots = media.querySelectorAll(".dot");
  const photos = media.querySelectorAll(".product-photo");
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = dot.dataset.index;
      photos.forEach((p) => p.classList.toggle("is-active", p.dataset.index === idx));
      dots.forEach((d) => d.classList.toggle("is-active", d.dataset.index === idx));
    });
  });
});

// ---------- Filters ----------
let activeCategory = "all";
let activeGender = "all";

function applyFilters() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const matchCategory = activeCategory === "all" || card.dataset.category === activeCategory;
    const matchGender = activeGender === "all" || card.dataset.gender === activeGender;
    card.classList.toggle("is-hidden", !(matchCategory && matchGender));
  });
}

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.filterType;
    const value = btn.dataset.value;

    document
      .querySelectorAll(`.filter-btn[data-filter-type="${type}"]`)
      .forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    if (type === "category") activeCategory = value;
    if (type === "gender") activeGender = value;

    applyFilters();
  });
});
