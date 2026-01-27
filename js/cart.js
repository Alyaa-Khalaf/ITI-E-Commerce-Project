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


const currentUser = getCurrentUserSafe();
if (!currentUser) {
  location.href = "../html/login.html";
}



document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById('cart-items');
    const grandTotalEl = document.getElementById('grand-total');
    const notification = document.getElementById('notification');

    function showNotification(message, color = "#4caf50") {
        if (!notification) return;
        notification.textContent = message;
        notification.style.background = color;
        notification.style.display = "block";
        setTimeout(() => notification.style.display = "none", 2000);
    }

    async function loadCart() {
        const response = await fetch('productsData.json');
        const data = await response.json();
        const cart = JSON.parse(localStorage.getItem('userCart')) || [];

        let total = 0;
        tbody.innerHTML = "";

        cart.forEach(item => {
            const product = data.products.find(p => p.id == item.id);
            if (!product) return;
            const price = parseFloat(product.price.replace('$',''));
            const subtotal = price * item.quantity;
            total += subtotal;

            tbody.innerHTML += `
                <tr>
                    <td>${product.title}</td>
                    <td>$${price.toFixed(2)}</td>
                    <td>
                        <button class="qty-btn" onclick="updateQty(${product.id}, -1)">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQty(${product.id}, 1)">+</button>
                    </td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td>
                        <button onclick="deleteItem(${product.id})" style="color:red;border:1px solid red;background:none;padding:4px 10px;cursor:pointer;">Delete</button>
                    </td>
                </tr>
            `;
        });

        grandTotalEl.innerText = total.toFixed(2);
    }

    window.updateQty = function(id, change) {
        let cart = JSON.parse(localStorage.getItem('userCart')) || [];
        const item = cart.find(i => i.id == id);
        if (!item) return;

        item.quantity += change;
        if (item.quantity < 1) {
            cart = cart.filter(i => i.id != id);
            showNotification("Item removed from cart ❌", "#ff4757");
        } else {
            showNotification("Quantity updated ✅");
        }

        localStorage.setItem('userCart', JSON.stringify(cart));
        loadCart();
    }

    window.deleteItem = function(id) {
        let cart = JSON.parse(localStorage.getItem('userCart')) || [];
        cart = cart.filter(item => item.id != id);
        localStorage.setItem('userCart', JSON.stringify(cart));
        loadCart();
        showNotification("Item deleted from cart ❌", "#ff4757");
    }

    window.togglePayment = function(method) {
        document.getElementById('cash-btn').style.display = method === 'paypal' ? 'none' : 'block';
        document.getElementById('paypal-button-container').style.display = method === 'paypal' ? 'block' : 'none';
    }

    window.placeOrder = async function(method) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.email) {
            showNotification("Please login first ❌", "#ff4757");
            setTimeout(() => { location.href = "../html/login.html"; }, 1000);
            return;
        }

        const cart = JSON.parse(localStorage.getItem('userCart')) || [];
        if (!cart.length) { showNotification("Cart is empty ❌", "#ff4757"); return; }

        const response = await fetch('productsData.json');
        const data = await response.json();

        const products = cart.map(item => {
            const product = data.products.find(p => p.id == item.id);
            return { id: product.id, title: product.title, price: product.price, quantity: item.quantity };
        });

        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push({
            id: Date.now(),
            customer: currentUser.name,
            email: currentUser.email,
            products,
            total: grandTotalEl.innerText,
            paymentMethod: method,
            status: "pending",
            date: new Date().toLocaleString()
        });

        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.removeItem('userCart');
        showNotification(`Order placed via ${method} ✅`);
        setTimeout(() => { location.href = "../html/myOrders.html"; }, 1200);
    }

    // --- PAYPAL BUTTONS ---
    paypal.Buttons({
        createOrder: (data, actions) => actions.order.create({
            purchase_units: [{ amount: { value: grandTotalEl.innerText } }]
        }),
        onApprove: (data, actions) => actions.order.capture().then(() => placeOrder('PayPal'))
    }).render('#paypal-button-container');

    loadCart();
});
