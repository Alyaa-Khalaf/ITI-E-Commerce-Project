// --- Validation Functions ---
function validateName(name) {
    var regexName = /^[\p{L}][\p{L} .'-]+[\p{L}] [\p{L}][\p{L} .'-]+[\p{L}]$/u;
    return regexName.test(name);
}

function validateEmail(email) {
    var regexEmail = /^[a-zA-Z][a-zA-Z0-9._+-]*@gmail\.com$/;
    return regexEmail.test(email);
}

function validatePhone(phone) {
    var regexPhone = /^(01)[0125][0-9]{8}$/;
    return regexPhone.test(phone);
}

function validatePassword(password) {
    var regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*\W).{8,}$/;
    return regexPassword.test(password);
}




document.getElementById("name").addEventListener("input", function () {
    if (!validateName(this.value.trim())) {
        document.getElementById("name-error").style.display = "block";
        this.style.border = "2px solid red";
    } else {
        document.getElementById("name-error").style.display = "none";
        this.style.border = "2px solid green";
    }
});

document.getElementById("email").addEventListener("input", function () {
    if (!validateEmail(this.value.trim())) {
        document.getElementById("email-error").style.display = "block";
        this.style.border = "2px solid red";
    } else {
        document.getElementById("email-error").style.display = "none";
        this.style.border = "2px solid green";
    }
});

document.getElementById("phone").addEventListener("input", function () {
    if (!validatePhone(this.value.trim())) {
        document.getElementById("phone-error").style.display = "block";
        this.style.border = "2px solid red";
    } else {
        document.getElementById("phone-error").style.display = "none";
        this.style.border = "2px solid green";
    }
});

document.getElementById("password").addEventListener("input", function () {
    if (!validatePassword(this.value.trim())) {
        document.getElementById("password-error").style.display = "block";
        this.style.border = "2px solid red";
    } else {
        document.getElementById("password-error").style.display = "none";
        this.style.border = "2px solid green";
    }
});


// --- form Validation ---
function validateForm() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();

     let valid = true;
   if (!validateName(name)) {
        document.getElementById("name-error").style.display = "block";
        // nameInput.style.border = "2px solid red";
        valid = false;
    } else {
        document.getElementById("name-error").style.display = "none";
        // nameInput.style.border = "2px solid green";
    }

    // Email
    if (!validateEmail(email)) {
        document.getElementById("email-error").style.display = "block";
        // emailInput.style.border = "2px solid red";
        valid = false;
    } else {
        document.getElementById("email-error").style.display = "none";
        // emailInput.style.border = "2px solid green";
    }

    // Phone
    if (!validatePhone(phone)) {
        document.getElementById("phone-error").style.display = "block";
        // phoneInput.style.border = "2px solid red";
        valid = false;
    } else {
        document.getElementById("phone-error").style.display = "none";
        // phoneInput.style.border = "2px solid green";
    }

    // Password
    if (!validatePassword(password)) {
        document.getElementById("password-error").style.display = "block";
        // passwordInput.style.border = "2px solid red";
        valid = false;
    } else {
        document.getElementById("password-error").style.display = "none";
        // passwordInput.style.border = "2px solid green";
    }

    return valid;
}


// --- Form Submit Handler ---
document.getElementById("register-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const successMsg = document.getElementById("success-regiter");
    const exsitUser = document.getElementById("excit-user");


    if (validateForm()) {

        
  
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value.trim();

        const customer = { name, email, phone, password, role: "customer" };

        const storedCustomer = JSON.parse(localStorage.getItem("customer"));

        if (storedCustomer && storedCustomer.email === email && storedCustomer.phone === phone) {
           exsitUser.style.display="block"
        } else {
            localStorage.setItem("customer", JSON.stringify(customer));
             successMsg.style.display = "block";
             exsitUser.style.display="none"
            function storeData() {
                window.location.href = "products.html";
            }

            setTimeout(storeData, 2000);
        }

    } 
});