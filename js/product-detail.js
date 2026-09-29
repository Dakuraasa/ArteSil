const productCatalog = window.atelierProducts;

const productId = new URLSearchParams(window.location.search).get("id");
const product = productCatalog[productId];
const content = document.getElementById("product-content");
const cartCounter = document.querySelector(".cart-link span");

function readCart() {
  try {
    return JSON.parse(localStorage.getItem("atelier-cart") || "[]");
  } catch {
    return [];
  }
}

function renderCartCount() {
  const total = readCart().reduce((sum, item) => sum + item.quantity, 0);
  cartCounter.textContent = total;
  cartCounter
    .closest(".cart-link")
    .setAttribute(
      "aria-label",
      `Carrinho, ${total} ${total === 1 ? "item" : "itens"}`,
    );
}

if (!product) {
  document.title = "Produto não encontrado | Atelier Art&Sil";
  content.innerHTML =
    '<div class="product-not-found"><p class="eyebrow">Catálogo</p><h1>Produto não encontrado</h1><p>Este item não está disponível no catálogo.</p><a class="primary-btn" href="../index.html#produtos">VOLTAR AO CATÁLOGO</a></div>';
} else {
  document.title = `${product.name} | Atelier Art&Sil`;
  content.innerHTML = `
    <nav class="breadcrumbs" aria-label="Você está aqui"><a href="../index.html">Início</a><span>/</span><a href="../index.html#produtos">${product.category}</a><span>/</span><span>${product.name}</span></nav>
    <section class="product-detail" aria-labelledby="product-name">
      <div class="product-gallery">
        <div class="product-main-image"><span class="product-made-badge">Feito à mão</span><svg viewBox="0 0 200 150" role="img" aria-label="${product.name}"><use href="#${product.image}" /></svg></div>
      </div>
      <div class="product-info-panel">
        <p class="eyebrow">${product.category}</p>
        <h1 id="product-name">${product.name}</h1>
        <p class="product-description">${product.description}</p>
        <div class="product-price"><span>Preço de demonstração</span><strong>${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.priceCents / 100)}</strong></div>
        <div class="product-options"><label for="product-quantity">Quantidade</label><div class="quantity-control"><button type="button" data-quantity="decrease" aria-label="Diminuir quantidade">−</button><input id="product-quantity" type="number" min="1" value="1" inputmode="numeric" /><button type="button" data-quantity="increase" aria-label="Aumentar quantidade">+</button></div></div>
        <button class="add-to-cart" type="button"><svg aria-hidden="true"><use href="#i-cart" /></svg> ADICIONAR AO CARRINHO</button>
        <p class="cart-feedback" role="status" aria-live="polite"></p>
        <p class="product-note">Valor demonstrativo, sujeito a confirmação. Cada peça pode ser personalizada; consulte disponibilidade pelo WhatsApp.</p>
      </div>
    </section>`;

  const quantityInput = document.getElementById("product-quantity");
  const feedback = document.querySelector(".cart-feedback");

  document.querySelectorAll("[data-quantity]").forEach((button) => {
    button.addEventListener("click", () => {
      const current = Math.max(
        1,
        Number.parseInt(quantityInput.value, 10) || 1,
      );
      quantityInput.value =
        button.dataset.quantity === "increase"
          ? current + 1
          : Math.max(1, current - 1);
    });
  });

  quantityInput.addEventListener("change", () => {
    quantityInput.value = Math.max(
      1,
      Number.parseInt(quantityInput.value, 10) || 1,
    );
  });

  document.querySelector(".add-to-cart").addEventListener("click", () => {
    const cart = readCart();
    const quantity = Math.max(1, Number.parseInt(quantityInput.value, 10) || 1);
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) existingItem.quantity += quantity;
    else
      cart.push({
        id: productId,
        name: product.name,
        quantity,
        selected: true,
      });

    localStorage.setItem("atelier-cart", JSON.stringify(cart));
    renderCartCount();
    feedback.textContent = `${quantity} ${quantity === 1 ? "unidade adicionada" : "unidades adicionadas"} ao carrinho.`;
  });
}

renderCartCount();
