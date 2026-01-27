// =================== 1. ADMIN GUARD ===================
(function checkAccess() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "admin") {
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

  //  نجدد الجلسة مع أي استخدام
  user.lastActive = now;
  localStorage.setItem("currentUser", JSON.stringify(user));

  return user;
}


// =================== 2. GLOBAL DATA ===================
let products = JSON.parse(localStorage.getItem("products")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

let editIdx = -1;

// Inputs
const prodTitle = document.getElementById("prod-title");
const prodPrice = document.getElementById("prod-price");
const prodCategory = document.getElementById("prod-category");
const prodStock = document.getElementById("prod-stock");
const prodDesc = document.getElementById("prod-desc");
const prodImage = document.getElementById("prod-image");
const saveBtn = document.getElementById("save-product-btn");

// =================== 3. VALIDATION LISTENERS ===================
prodPrice?.addEventListener("input", () => {
    const errorMsg = document.getElementById("price-error");
    if (parseFloat(prodPrice.value) < 0) {
        errorMsg.style.display = "block";
        prodPrice.style.borderColor = "red";
    } else {
        errorMsg.style.display = "none";
        prodPrice.style.borderColor = "";
    }
});

prodStock?.addEventListener("input", () => {
    const errorMsg = document.getElementById("stock-error");
    if (parseInt(prodStock.value) < 0) {
        errorMsg.style.display = "block";
        prodStock.style.borderColor = "red";
    } else {
        errorMsg.style.display = "none";
        prodStock.style.borderColor = "";
    }
});

// =================== 4. MESSAGE HANDLER ===================
function showMessage(text, type = "success") {
    const box = document.getElementById("admin-message");
    if (!box) return;

    box.style.display = "block";
    box.innerText = text;

    if (type === "error") {
        box.style.background = "#ffe5e5";
        box.style.color = "#b00020";
        box.style.border = "1px solid #ff4d4d";
    } else {
        box.style.background = "#e6fffa";
        box.style.color = "#065f46";
        box.style.border = "1px solid #34d399";
    }

    setTimeout(() => { box.style.display = "none"; }, 3000);
}

// =================== 5. LOGOUT ===================
document.getElementById("logout-btn")?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.replace("login.html");
});

// =================== 6. PRODUCTS ===================
function displayProducts() {
    const container = document.getElementById("admin-product-container");
    if (!container) return;

    container.innerHTML = "";

    products.forEach((p, idx) => {
        const title = p.title || p.name || "No Title";
        const price = p.price || 0;
        const stock = p.stockQuantity ?? p.stock ?? 0;
        const image = p.image || "https://via.placeholder.com/100";

        container.innerHTML += `
            <div class="product-item">
                <img src="${image}" width="50">
                <h4>${title}</h4>
                <p>Price: $${price} | Stock: ${stock}</p>
                <button onclick="editProduct(${idx})">Edit ✏️</button>
                <button onclick="deleteProduct(${idx})" class="delete-btn">Delete 🗑️</button>
            </div>
        `;
    });
}

saveBtn?.addEventListener("click", () => {
    const title = prodTitle.value.trim();
    const price = parseFloat(prodPrice.value);
    const category = prodCategory.value.trim();
    const stock = parseInt(prodStock.value);
    const desc = prodDesc.value.trim();
    const image = prodImage.value.trim();

    if (!title || isNaN(price) || price < 0 || !category || isNaN(stock) || stock < 0) {
        showMessage("Please fill all fields correctly!", "error");
        return;
    }

    const productData = {
        id: editIdx === -1 ? Date.now() : products[editIdx].id,
        title: title,
        name: title,
        price: price,
        category: category,
        stockQuantity: stock,
        description: desc,
        image: image || "https://via.placeholder.com/150",
        rating: editIdx === -1 ? 0 : (products[editIdx].rating || 0)
    };

    if (editIdx === -1) {
        products.push(productData);
        showMessage("Product added successfully ✅");
    } else {
        products[editIdx] = productData;
        editIdx = -1;
        saveBtn.innerText = "Add Product";
        showMessage("Product updated successfully ✏️");
    }

    localStorage.setItem("products", JSON.stringify(products));
    displayProducts();
    clearInputs();
});

window.editProduct = function (idx) {
    const p = products[idx];
    prodTitle.value = p.title || p.name || "";
    prodPrice.value = p.price || 0;
    prodCategory.value = p.category || "";
    prodStock.value = p.stockQuantity ?? p.stock ?? 0;
    prodDesc.value = p.description || "";
    prodImage.value = p.image || "";

    editIdx = idx;
    saveBtn.innerText = "Update Product";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deleteProduct = function (idx) {
    products.splice(idx, 1);
    localStorage.setItem("products", JSON.stringify(products));
    displayProducts();
    showMessage("Product deleted successfully 🗑️");
};

function clearInputs() {
    [prodTitle, prodPrice, prodCategory, prodStock, prodDesc, prodImage].forEach(i => {
        if(i) {
            i.value = "";
            i.style.borderColor = "";
        }
    });
    if(document.getElementById("price-error")) document.getElementById("price-error").style.display = "none";
    if(document.getElementById("stock-error")) document.getElementById("stock-error").style.display = "none";
}

// =================== 7. CATEGORIES ===================
function displayCategories() {
    const container = document.getElementById("admin-category-container");
    if (!container) return;

    container.innerHTML = categories.map((cat, idx) => `
        <div class="category-item">
            <span>${cat}</span>
            <button onclick="deleteCategory(${idx})">Delete</button>
        </div>
    `).join("");
}

document.getElementById("add-category-btn")?.addEventListener("click", () => {
  const input = document.getElementById("new-category");
  const name = input.value.trim();

  if (!name) {
    showMessage("Category name is required", "error");
    return;
  }

  const exists = categories.some(c => c.toLowerCase() === name.toLowerCase());
  if (exists) {
    showMessage("Category already exists ❌", "error");
    return;
  }

  categories.push(name);
  localStorage.setItem("categories", JSON.stringify(categories));
  displayCategories();
  input.value = "";
  showMessage("Category added successfully 📂");
});

window.deleteCategory = function (idx) {
    categories.splice(idx, 1);
    localStorage.setItem("categories", JSON.stringify(categories));
    displayCategories();
    showMessage("Category deleted ❌");
};

// =================== 8. ORDERS ===================
function displayOrders() {
  const container = document.getElementById("admin-orders-container");
  if (!container) return;

  container.innerHTML = "";
  const currentOrders = JSON.parse(localStorage.getItem("orders")) || [];

  currentOrders.slice().reverse().forEach(o => {
    const customerName = o.customerName || o.userName || o.email || "Guest";

    let buttons = "";
    if (o.status === "pending") {
      buttons = `
        <button onclick="updateOrderStatusById(${o.id}, 'confirmed')">Confirm</button>
        <button onclick="updateOrderStatusById(${o.id}, 'rejected')">Reject</button>
      `;
    } else if (o.status === "return_pending") {
      buttons = `
        <textarea id="reject-reason-${o.id}" placeholder="Enter reason if rejecting..." style="width:100%;margin:10px 0;"></textarea>
        <button onclick="updateOrderStatusById(${o.id}, 'returned')">Approve Return 🔄</button>
        <button onclick="updateOrderStatusById(${o.id}, 'return_rejected')">Reject Return ❌</button>
      `;
    }

    container.innerHTML += `
      <div style="border:2px solid #ddd;padding:15px;margin-bottom:15px;border-radius:8px;">
        <p><b>Order ID:</b> #${o.id}</p>
        <p><b>Customer:</b> ${customerName}</p>
        <p><b>Status:</b> ${o.status}</p>
        ${buttons}
      </div>
    `;
  });
}

window.updateOrderStatusById = function(orderId, status) {
  const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const idx = allOrders.findIndex(o => o.id == orderId);

  if (idx !== -1) {
    const order = allOrders[idx];
    if(status === "return_rejected") {
      const reasonInput = document.getElementById(`reject-reason-${orderId}`);
      let reason = reasonInput ? reasonInput.value.trim() : "";
      if(!reason) reason = "Your return request was rejected by admin.";
      order.adminResponse = reason;
    } else if(status === "returned") {
      order.adminResponse = "✅ Your return has been approved.";
    } else {
      order.adminResponse = "";
    }

    order.status = status;
    localStorage.setItem("orders", JSON.stringify(allOrders));
    displayOrders();
    showMessage(`Order updated to ${status.toUpperCase()} ✅`);
  }
};

// =================== 9. INIT ===================
function init() {
    displayProducts();
    displayCategories();
    displayOrders();
}

init();
