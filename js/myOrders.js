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


(function guardMyOrders() {
  const currentUser = getCurrentUserSafe();
  if (!currentUser || currentUser.role !== "customer") {
    window.location.replace("login.html");
  }
})();


const container = document.getElementById("orders-container");
const notification = document.getElementById("notification");

// ===== GUARD: منع فتح الصفحة بدون Login =====
function getCurrentUser() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.email) {
    // المستخدم مش موجود، يتم إعادة التوجيه
    window.location.replace("login.html");
    return null;
  }
  return user;
}

const currentUser = getCurrentUser(); // تخزين المستخدم لمرة واحدة

// --- SHOW NOTIFICATION ---
function showNotification(message, color = "#4caf50") {
  if (!notification) return;

  notification.textContent = message;
  notification.style.background = color;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 2500);
}

// --- RENDER ORDERS ---
function renderMyOrders() {
  if (!currentUser) return;

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  // الطلبات الخاصة بالمستخدم الحالي
  const myOrders = orders.filter(
    o =>
      o.email === currentUser.email ||
      o.userEmail === currentUser.email ||
      o.customerEmail === currentUser.email
  );

  container.innerHTML = "";

  if (myOrders.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>No orders yet 📭</p>";
    return;
  }

  myOrders
    .slice()
    .reverse()
    .forEach(order => {
      const statusClass = (order.status || "pending").toLowerCase();
      let statusDisplay = statusClass.toUpperCase().replace("_", " ");

      // --- PRODUCTS TABLE ---
      let productsHTML = "";
      if (order.products && order.products.length) {
        order.products.forEach(p => {
          productsHTML += `
            <tr>
              <td>${p.title}</td>
              <td>${p.quantity}</td>
              <td>$${p.price}</td>
            </tr>`;
        });
      }

      // --- ACTION BUTTONS ---
      let actionContent = "";
      if (statusClass === "confirmed") {
        actionContent = `
          <div class="bonus-actions" id="bonus-area-${order.id}">
            <div id="rating-area-${order.id}">
              <span>Rate Order: </span>
              <span class="stars" onclick="handleRating(${order.id})">
                ⭐ ⭐ ⭐ ⭐ ⭐
              </span>
            </div>
            <button class="return-btn" onclick="handleReturn(${order.id})">
              Return Order
            </button>
          </div>`;
      } else if (statusClass === "return_pending") {
        actionContent = `
          <p style="margin-top:15px; color:#8e44ad; font-weight:bold;">
            ⏳ Your return request is being reviewed by Admin.
          </p>`;
      } else if (statusClass === "returned") {
        actionContent = `
          <p style="margin-top:15px; color:#27ae60; font-weight:bold;">
            ✅ Your return request has been approved.
          </p>`;
      } else if (statusClass === "return_rejected") {
        actionContent = `
          <p style="margin-top:15px; color:#c0392b; font-weight:bold;">
            ❌ Your return request has been rejected by Admin.
          </p>`;
      }

      // --- ADMIN RESPONSE ---
      let adminMsgHTML = "";
      if (order.adminResponse && order.adminResponse.trim() !== "") {
        adminMsgHTML = `
          <p style="margin-top:10px; padding:10px; background:#f1f2f6; border-left:4px solid #2f3542;">
            <b>Admin Response:</b> ${order.adminResponse}
          </p>`;
      }

      // --- RENDER ORDER CARD ---
      container.innerHTML += `
        <div class="order" id="order-card-${order.id}">
          <p><b>Order ID:</b> #${order.id}</p>
          <p><b>Date:</b> ${order.date || "-"}</p>
          <p><b>Total Amount:</b> $${order.total}</p>
          <p>
            <b>Status:</b>
            <span class="${statusClass}">${statusDisplay}</span>
          </p>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${productsHTML}
            </tbody>
          </table>

          ${actionContent}
          ${adminMsgHTML}
        </div>`;
    });
}

// --- HANDLE RATING ---
window.handleRating = function (orderId) {
  let allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const index = allOrders.findIndex(o => o.id == orderId);

  if (index !== -1) {
    allOrders[index].rated = true;
    localStorage.setItem("orders", JSON.stringify(allOrders));
  }

  const ratingArea = document.getElementById(`rating-area-${orderId}`);
  if (ratingArea) {
    ratingArea.innerHTML =
      `<span class="thank-you-msg">✅ Thank you for your feedback!</span>`;
  }
};

// --- HANDLE RETURN REQUEST ---
window.handleReturn = function (orderId) {
  let allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const index = allOrders.findIndex(o => o.id == orderId);

  if (index !== -1) {
    allOrders[index].status = "return_pending";
    allOrders[index].adminResponse = "";

    localStorage.setItem("orders", JSON.stringify(allOrders));

    showNotification(
      "Return request sent to Admin successfully ✅",
      "#2ecc71"
    );

    renderMyOrders();
  }
};

// --- INIT ---
renderMyOrders();
