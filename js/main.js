// ------------------- Admin Initialization -------------------
// Ensure admin account exists in LocalStorage
if (!localStorage.getItem("admin")) {
    const adminAccount = {
        name: "Shimaa",
        email: "shimaa_ahmed123@gmail.com",
        password: "Itimern2025@$",
        role: "admin"
    };
    localStorage.setItem("admin", JSON.stringify(adminAccount));
}

// ------------------- Admin Guard (Loop Prevention) -------------------
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// Check current page: If it's login.html, skip protection to prevent infinite redirect loops
const isLoginPage = window.location.pathname.includes("login.html");

if (!isLoginPage) {
    if (!currentUser || currentUser.role !== "admin") {
        alert("Access denied! Admins only.");
        window.location.href = "login.html";
    }
}

// ------------------- Logout -------------------
document.getElementById("logout-btn")?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
});

// =================== PRODUCTS LOGIC ===================
let products = JSON.parse(localStorage.getItem("products")) || [];

function displayProducts() {
    const container = document.getElementById("admin-product-container");
    if (!container) return;

    container.innerHTML = "";
    products.forEach((p, idx) => {
        container.innerHTML += `
            <div class="product-item">
                <img src="${p.image}" alt="${p.title}" style="width:100px; height:100px; object-fit:contain;">
                <h4>${p.title}</h4>
                <p>Price: $${p.price}</p>
                <p>Category: ${p.category}</p>
                <p>Stock: ${p.stockQuantity}</p>
                <button onclick="deleteProduct(${idx})">Delete</button>
            </div>
        `;
    });
}

// Handle Add New Product
document.getElementById("save-product-btn")?.addEventListener("click", () => {
    const prodTitle = document.getElementById("prod-title");
    const prodPrice = document.getElementById("prod-price");
    const prodCategory = document.getElementById("prod-category");
    const prodStock = document.getElementById("prod-stock");
    const prodDesc = document.getElementById("prod-desc");
    const prodImage = document.getElementById("prod-image");

    if (!prodTitle.value || !prodPrice.value) {
        return alert("Please fill title and price!");
    }

    products.push({
        id: Date.now(),
        title: prodTitle.value.trim(),
        price: parseFloat(prodPrice.value),
        category: prodCategory.value.trim(),
        stockQuantity: parseInt(prodStock.value) || 0,
        description: prodDesc.value.trim(),
        image: prodImage.value.trim() || "https://via.placeholder.com/150"
    });

    localStorage.setItem("products", JSON.stringify(products));
    displayProducts();
    
    // Clear input fields after saving
    [prodTitle, prodPrice, prodCategory, prodStock, prodDesc, prodImage].forEach(el => el.value = "");
    alert("Product Added Successfully ✅");
});

function deleteProduct(idx) {
    if(confirm("Are you sure you want to delete this product?")) {
        products.splice(idx, 1);
        localStorage.setItem("products", JSON.stringify(products));
        displayProducts();
    }
}

// =================== ORDERS & RETURNS LOGIC ===================
let orders = JSON.parse(localStorage.getItem("orders")) || [];

function displayOrders(){
    const container = document.getElementById("admin-orders-container");
    if (!container) return;
    container.innerHTML = "";

    // Display orders in reverse (newest first)
    [...orders].reverse().forEach((o, visualIdx) => {
        const div = document.createElement("div");
        div.className = "order-item"; 
        div.style.border = "1px solid #ccc";
        div.style.padding = "10px";
        div.style.margin = "10px 0";

        let buttonsHTML = "";
        if (o.status === "pending") {
            buttonsHTML = `
                <button onclick="updateStatus(${visualIdx}, 'confirmed')" style="background:green; color:white; padding:5px; cursor:pointer;">Confirm ✅</button>
                <button onclick="updateStatus(${visualIdx}, 'rejected')" style="background:red; color:white; padding:5px; cursor:pointer;">Reject ❌</button>
            `;
        } else if (o.status === "return_pending") {
            buttonsHTML = `
                <button onclick="updateStatus(${visualIdx}, 'returned')" style="background:orange; color:white; padding:5px; cursor:pointer;">Approve Return 🔄</button>
            `;
        }

        div.innerHTML = `
            <p><b>Order ID:</b> #${o.id}</p>
            <p><b>Customer:</b> ${o.customerName} (${o.customerEmail})</p>
            <p><b>Total:</b> $${o.total}</p>
            <p><b>Status:</b> <span style="font-weight:bold;">${o.status.toUpperCase()}</span></p>
            ${buttonsHTML}
        `;
        container.appendChild(div);
    });
}

function updateStatus(visualIdx, newStatus) {
    // Fetch latest data from LocalStorage for sync
    let allOrders = JSON.parse(localStorage.getItem("orders")) || [];
    
    // Calculate the real index because the display is reversed
    const realIdx = allOrders.length - 1 - visualIdx;

    if (allOrders[realIdx]) {
        if (newStatus === "rejected") {
            const reason = prompt("Enter rejection reason:");
            allOrders[realIdx].rejectReason = reason || "Rejected by admin";
        }
        
        allOrders[realIdx].status = newStatus;
        localStorage.setItem("orders", JSON.stringify(allOrders));
        orders = allOrders; // Sync local variable
        displayOrders();
        alert(`Order status updated to ${newStatus} ✅`);
    }
}

// =================== INITIALIZATION ===================
displayProducts();
displayOrders();