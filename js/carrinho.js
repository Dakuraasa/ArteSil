class CarrinhoAtelier {
  constructor() {
    this.storageKey = "atelier-cart";
    this.init();
  }

  init() {
    this.loadCart();
    this.updateUI();
  }

  getCart() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Erro ao carregar carrinho:", e);
      return [];
    }
  }

  saveCart(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.updateCartCount();
    } catch (e) {
      console.error("Erro ao salvar carrinho:", e);
    }
  }

  loadCart() {
    this.items = this.getCart();
  }

  addItem(product) {
    const existingItem = this.items.find((i) => i.id === product.id);

    if (existingItem) {
      existingItem.quantity += product.quantity || 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price || 0,
        quantity: product.quantity || 1,
        image: product.image || "",
      });
    }

    this.saveCart(this.items);
    this.showNotification(`${product.name} adicionado ao carrinho!`);
  }

  removeItem(productId) {
    this.items = this.items.filter((i) => i.id !== productId);
    this.saveCart(this.items);
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find((i) => i.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart(this.items);
    }
  }

  updateCartCount() {
    const cartLink = document.querySelector(".cart-link span");
    if (cartLink) {
      const total = this.items.reduce((sum, item) => sum + item.quantity, 0);
      cartLink.textContent = total;
      cartLink.closest(".cart-link").setAttribute(
        "aria-label",
        `Carrinho, ${total} ${total === 1 ? "item" : "itens"}`
      );
    }
  }

  updateUI() {
    this.updateCartCount();
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "cart-notification";
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      background: var(--accent);
      color: #fff;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 0.85rem;
      z-index: 14;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  getTotalPrice() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }
}

const carrinho = new CarrinhoAtelier();

// Adicionar eventos aos botões de adicionar ao carrinho
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const card = btn.closest(".produto");
      const productId = card?.dataset.productId || "unknown";
      const productName = card?.querySelector("h3")?.textContent || "Produto";
      const price = parseFloat(card?.dataset.price) || 89.9;

      carrinho.addItem({
        id: productId,
        name: productName,
        price: price,
        quantity: 1,
      });
    });
  });
});
