function checkAdmin(email, password) {
  const adminData = JSON.parse(localStorage.getItem("admin"));
  if (adminData && email === adminData.email && password === adminData.password) {
    adminData.lastActive = Date.now();
    localStorage.setItem("currentUser", JSON.stringify(adminData));
    return adminData.role;
  }
  return null;
}

function checkCustomer(email, password) {
  const customerData = JSON.parse(localStorage.getItem("customer"));
  if (customerData && email === customerData.email && password === customerData.password) {
    customerData.lastActive = Date.now();
    localStorage.setItem("currentUser", JSON.stringify(customerData));
    return customerData.role;
  }
  return null;
}

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorSpan = document.getElementById("login-error");

  const adminRole = checkAdmin(email, password);
  const customerRole = checkCustomer(email, password);

  if (adminRole === "admin") {
    errorSpan.style.display = "none";
    window.location.href = "admin.html";
  } else if (customerRole === "customer") {
    errorSpan.style.display = "none";
    window.location.href = "products.html";
  } else {
    errorSpan.textContent = "Invalid Email or Password";
    errorSpan.style.display = "block";
  }
});

