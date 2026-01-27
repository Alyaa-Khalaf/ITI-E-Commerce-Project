/*****************
 * PRODUCTS PAGE SCRIPT
 * (Display + Filter + Cart + Wishlist + Logout + Notifications)
 *****************/
(function guardProducts() {
  const currentUser = getCurrentUserSafe();
  if (!currentUser || currentUser.role !== "customer") {
    window.location.replace("login.html");
  }
})();



function getCurrentUserSafe() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return null;

  const MAX_SESSION_TIME = 30 * 60 * 1000; // 30 دقيقة
  const now = Date.now();

  if (!user.lastActive || now - user.lastActive > MAX_SESSION_TIME) {
    localStorage.removeItem("currentUser");
    return null;
  }

  // 🔥 نجدد الجلسة مع أي استخدام
  user.lastActive = now;
  localStorage.setItem("currentUser", JSON.stringify(user));

  return user;
}


function loadCategoriesToDropdown() {
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  select.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

loadCategoriesToDropdown();


// DOM Elements
const productsContainer = document.getElementById("products-container");
const categoryFilter = document.getElementById("categoryFilter");
const cartCount = document.getElementById("cart-count");
const notification = document.getElementById("notification");

let allProducts = [];

/*****************
 * SHOW NOTIFICATION
 *****************/
function showNotification(message, color = "#4caf50") {
    notification.textContent = message;
    notification.style.background = color;
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, 2000);
}

/*****************
 * FETCH PRODUCTS
 *****************/
async function fetchProducts() {
    try {
        let storedProducts = JSON.parse(localStorage.getItem("products"));

        if (!storedProducts || storedProducts.length === 0) {
            const response = await fetch("../html/productsData.json");
            const data = await response.json();
            allProducts = data.products;
            localStorage.setItem("products", JSON.stringify(allProducts));
        } else {
            allProducts = storedProducts;
        }

        loadCategories();
        displayProducts(allProducts);
        updateCartCount();

    } catch (error) {
        console.error("Error loading products:", error);
    }
}

/*****************
 * DISPLAY PRODUCTS
 *****************/
function displayProducts(productsList) {
    productsContainer.innerHTML = "";
    const wishlist = JSON.parse(localStorage.getItem("userWishlist")) || [];

    productsList.forEach(product => {
        const productName = product.title || product.name || "Unknown Product";
        const productDesc = (product.description || "No description available").substring(0, 60);
        const isFav = wishlist.includes(product.id);

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <img src="${product.image}" alt="${productName}">
            <div class="product-info">
                <h3>${productName}</h3>
                <p>Category: ${product.category}</p>
                <p>${productDesc}...</p>
                <p class="price">$${product.price}</p>
                <div class="btn-group">
                    <button class="wishlist-btn"
                        style="${isFav ? 'background:#ff4757;color:white;' : ''}"
                        onclick="toggleWishlist(${product.id})">
                        ${isFav ? 'Saved ❤️' : '❤️ Wishlist'}
                    </button>
                    <button class="cart-btn"
                        onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        productsContainer.appendChild(card);
    });
}

/*****************
 * LOAD & FILTER CATEGORIES
 *****************/
function loadCategories() {
    let categories = allProducts.map(product => product.category);
    categories = ["all", ...new Set(categories)];

    categoryFilter.innerHTML = "";

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        categoryFilter.appendChild(option);
    });
}

categoryFilter.addEventListener("change", e => {
    const selectedCategory = e.target.value;

    const filteredProducts =
        selectedCategory === "all"
            ? allProducts
            : allProducts.filter(product => product.category === selectedCategory);

    displayProducts(filteredProducts);
});

/*****************
 * WISHLIST
 *****************/
function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem("userWishlist")) || [];

    const index = wishlist.indexOf(productId);

    if (index === -1) {
        wishlist.push(productId);
        showNotification("Added to Wishlist ❤️");
    } else {
        wishlist.splice(index, 1);
        showNotification("Removed from Wishlist ❌", "#ff4757");
    }

    localStorage.setItem("userWishlist", JSON.stringify(wishlist));
    displayProducts(allProducts);
}

/*****************
 * CART
 *****************/
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem("userCart")) || [];
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex > -1) {
        cart[productIndex].quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem("userCart", JSON.stringify(cart));
    updateCartCount();
    showNotification("Added to Cart 🛒");
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("userCart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;
}

/*****************
 * LOGOUT
 *****************/
document.getElementById("logout-btn")?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    showNotification("Logging out...", "#ff4757");
    setTimeout(() => {
        window.location.replace("login.html");
    }, 1000);
});

/*****************
 * INIT
 *****************/
fetchProducts();