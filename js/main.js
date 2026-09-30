const filters = document.querySelectorAll(".filter");
const products = document.querySelectorAll(".produto");
const searchInput = document.getElementById("busca");
const searchForm = document.getElementById("product-search");
const catalogSection = document.querySelector(".catalogo");
const emptyState = document.querySelector(".empty-state");
const resultsStatus = document.getElementById("results-status");
const cartCount = document.querySelector(".cart-link span");

if (document.querySelector(".sobre")) {
  const aboutStylesheet = document.createElement("link");
  aboutStylesheet.rel = "stylesheet";
  aboutStylesheet.href = "css/sobre.css";
  document.head.appendChild(aboutStylesheet);
}

if (document.querySelector(".depoimentos")) {
  const testimonialsStylesheet = document.createElement("link");
  testimonialsStylesheet.rel = "stylesheet";
  testimonialsStylesheet.href = "css/depoimentos.css";
  document.head.appendChild(testimonialsStylesheet);
}

if (document.querySelector(".banner-promo")) {
  const promoStylesheet = document.createElement("link");
  promoStylesheet.rel = "stylesheet";
  promoStylesheet.href = "css/banner-promo.css";
  document.head.appendChild(promoStylesheet);
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
      product.querySelector(".badge")?.textContent || ""
    );
    const description = normalizeSearchText(
      product.querySelector(".produto-info p")?.textContent || ""
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

  if (emptyState) emptyState.hidden = visibleProducts > 0;
  if (resultsStatus)
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
      `.filter[data-filter="${selected}"]`
    );
    filters.forEach((button) => {
      const isActive = button === matchingFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    renderProducts(selected);
  });
});

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    const activeFilter =
      document.querySelector(".filter.is-active")?.dataset.filter || "all";
    renderProducts(activeFilter, event.target.value);
  });
}

if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const activeFilter =
      document.querySelector(".filter.is-active")?.dataset.filter || "all";
    renderProducts(activeFilter, searchInput.value);
    catalogSection.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelector(".filter.is-active")?.focus({ preventScroll: true });
  });
}

// Add to cart animation
style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .cart-notification {
    font-family: "DM Sans", sans-serif;
  }
`;
document.head.appendChild(style);

renderProducts();
