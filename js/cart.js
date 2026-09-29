const cartItemsElement = document.getElementById("cart-items");
const cartCountElement = document.querySelector(".cart-link span");
const selectedCountElement = document.getElementById("selected-count");
const totalElement = document.getElementById("cart-total");
const whatsappLink = document.getElementById("whatsapp-checkout");
const exampleWhatsappNumber = "5511999999999";
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("atelier-cart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("atelier-cart", JSON.stringify(cart));
}

function renderCart() {
  const cart = readCart()
    .filter((item) => window.atelierProducts[item.id])
    .map((item) => ({
      ...item,
      quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
      selected: item.selected !== false,
    }));
  const selectedItems = cart.filter((item) => item.selected);
  const selectedTotal = selectedItems.reduce((sum, item) => {
    return sum + window.atelierProducts[item.id].priceCents * item.quantity;
  }, 0);
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  saveCart(cart);
  cartCountElement.textContent = totalQuantity;
  cartCountElement
    .closest(".cart-link")
    .setAttribute(
      "aria-label",
      `Carrinho, ${totalQuantity} ${totalQuantity === 1 ? "item" : "itens"}`,
    );
  selectedCountElement.textContent = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  totalElement.textContent = currencyFormatter.format(selectedTotal / 100);

  if (cart.length === 0) {
    cartItemsElement.innerHTML = `
      <div class="cart-empty">
        <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8h5l4 23h22l5-17H13" stroke-linecap="round" stroke-linejoin="round"/><circle cx="19" cy="39" r="2"/><circle cx="35" cy="39" r="2"/></svg>
        <h2>Seu carrinho está vazio</h2>
        <p>Escolha uma peça do atelier para começar.</p>
        <a class="primary-btn" href="../index.html#produtos">VER PRODUTOS</a>
      </div>`;
    whatsappLink.classList.add("is-disabled");
    whatsappLink.setAttribute("aria-disabled", "true");
    whatsappLink.href = "#";
    return;
  }

  cartItemsElement.innerHTML = cart
    .map((item) => {
      const product = window.atelierProducts[item.id];
      const lineTotal = product.priceCents * item.quantity;
      return `
        <article class="cart-item${item.selected ? " is-selected" : ""}" data-item-id="${item.id}">
          <label class="cart-item-select" aria-label="Incluir ${product.name} na compra">
            <input type="checkbox" data-action="select" ${item.selected ? "checked" : ""} />
            <span class="sr-only">Incluir ${product.name} na compra</span>
          </label>
          <div class="cart-item-art" aria-hidden="true"><span>${product.category}</span></div>
          <div class="cart-item-details">
            <p class="eyebrow">${product.category}</p>
            <h3>${product.name}</h3>
            <span class="cart-unit-price">${currencyFormatter.format(product.priceCents / 100)} / unidade</span>
            <div class="cart-item-actions">
              <div class="quantity-control cart-quantity">
                <button type="button" data-action="decrease" aria-label="Diminuir quantidade de ${product.name}">−</button>
                <input type="number" min="1" value="${item.quantity}" inputmode="numeric" aria-label="Quantidade de ${product.name}" data-action="quantity" />
                <button type="button" data-action="increase" aria-label="Aumentar quantidade de ${product.name}">+</button>
              </div>
              <button type="button" class="remove-item" data-action="remove">Remover</button>
            </div>
          </div>
          <strong class="cart-line-total">${currencyFormatter.format(lineTotal / 100)}</strong>
        </article>`;
    })
    .join("");

  const messageLines = selectedItems.map((item) => {
    const product = window.atelierProducts[item.id];
    return `- ${product.name} (${item.quantity}): ${currencyFormatter.format((product.priceCents * item.quantity) / 100)}`;
  });
  const message = [
    "Olá! Quero confirmar estes produtos e combinar o pagamento:",
    ...messageLines,
    `Total demonstrativo: ${currencyFormatter.format(selectedTotal / 100)}`,
    "Sei que os valores são demonstrativos e aguardarei a confirmação.",
  ].join("\n");

  whatsappLink.href = `https://wa.me/${exampleWhatsappNumber}?text=${encodeURIComponent(message)}`;
  whatsappLink.classList.toggle("is-disabled", selectedItems.length === 0);
  whatsappLink.setAttribute(
    "aria-disabled",
    String(selectedItems.length === 0),
  );
}

cartItemsElement.addEventListener("change", (event) => {
  const itemElement = event.target.closest("[data-item-id]");
  if (!itemElement) return;

  const cart = readCart();
  const item = cart.find((entry) => entry.id === itemElement.dataset.itemId);
  if (!item) return;

  if (event.target.dataset.action === "select") {
    item.selected = event.target.checked;
  } else if (event.target.dataset.action === "quantity") {
    item.quantity = Math.max(1, Number.parseInt(event.target.value, 10) || 1);
  }

  saveCart(cart);
  renderCart();
});

cartItemsElement.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  const itemElement = event.target.closest("[data-item-id]");
  if (!button || !itemElement) return;

  const cart = readCart();
  const item = cart.find((entry) => entry.id === itemElement.dataset.itemId);
  if (!item) return;

  if (button.dataset.action === "remove") {
    saveCart(cart.filter((entry) => entry.id !== item.id));
  } else if (button.dataset.action === "increase") {
    item.quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1) + 1;
    saveCart(cart);
  } else if (button.dataset.action === "decrease") {
    item.quantity = Math.max(1, (Number.parseInt(item.quantity, 10) || 1) - 1);
    saveCart(cart);
  } else {
    return;
  }

  renderCart();
});

whatsappLink.addEventListener("click", (event) => {
  if (whatsappLink.getAttribute("aria-disabled") === "true")
    event.preventDefault();
});

renderCart();
