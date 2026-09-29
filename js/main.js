const filters = document.querySelectorAll(".filter");
const products = document.querySelectorAll(".produto");
const searchInput = document.getElementById("busca");
const searchForm = document.getElementById("product-search");
const catalogSection = document.querySelector(".catalogo");
const emptyState = document.querySelector(".empty-state");
const resultsStatus = document.getElementById("results-status");
const cartCount = document.querySelector(".cart-link span");

function updateCartCount() {
  let cart = [];
  try {
    const storedCart = JSON.parse(localStorage.getItem("atelier-cart") || "[]");
    cart = Array.isArray(storedCart) ? storedCart : [];
  } catch {
    cart = [];
  }
  if (cartCount)
    cartCount.textContent = cart.reduce(
      (total, item) => total + Math.max(0, Number(item.quantity) || 0),
      0,
    );
  if (cartCount)
    cartCount
      .closest(".cart-link")
      .setAttribute(
        "aria-label",
        `Carrinho, ${cartCount.textContent} ${cartCount.textContent === "1" ? "item" : "itens"}`,
      );
}

function normalizeSearchText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function renderProducts(selectedCategory = "all", query = "") {
  const normalized = normalizeSearchText(query);
  let visibleProducts = 0;

  products.forEach((product) => {
    const category = product.dataset.category;
    const name = normalizeSearchText(product.dataset.name);
    const categoryLabel = normalizeSearchText(
      product.querySelector(".badge")?.textContent || "",
    );
    const description = normalizeSearchText(
      product.querySelector(".produto-info p")?.textContent || "",
    );
    const matchesCategory =
      selectedCategory === "all" || category === selectedCategory;
    const matchesSearch =
      !normalized ||
      name.includes(normalized) ||
      categoryLabel.includes(normalized) ||
      description.includes(normalized);
    const isVisible = matchesCategory && matchesSearch;

    product.classList.toggle("is-hidden", !isVisible);
    product.setAttribute("aria-hidden", String(!isVisible));
    visibleProducts += isVisible ? 1 : 0;
  });

  emptyState.hidden = visibleProducts > 0;
  resultsStatus.textContent = `${visibleProducts} ${visibleProducts === 1 ? "produto encontrado" : "produtos encontrados"}.`;
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;
    filters.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    renderProducts(selected, searchInput.value);
  });
});

document.querySelectorAll("[data-category-target]").forEach((link) => {
  link.addEventListener("click", () => {
    const selected = link.dataset.categoryTarget;
    searchInput.value = "";
    const matchingFilter = document.querySelector(
      `.filter[data-filter="${selected}"]`,
    );
    filters.forEach((button) => {
      const isActive = button === matchingFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    renderProducts(selected);
  });
});

searchInput.addEventListener("input", (event) => {
  const activeFilter =
    document.querySelector(".filter.is-active")?.dataset.filter || "all";
  renderProducts(activeFilter, event.target.value);
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const activeFilter =
    document.querySelector(".filter.is-active")?.dataset.filter || "all";
  renderProducts(activeFilter, searchInput.value);
  catalogSection.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector(".filter.is-active")?.focus({ preventScroll: true });
});

renderProducts();
updateCartCount();
