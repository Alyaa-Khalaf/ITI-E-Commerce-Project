
async function loadWishlist() {
    const response = await fetch('productsData.json');
    const data = await response.json();
    const wishlistIDs = JSON.parse(localStorage.getItem('userWishlist')) || [];
    const container = document.getElementById('wishlist-grid');

    const myItems = data.products.filter(p => wishlistIDs.includes(p.id));

    if (myItems.length === 0) {
        container.innerHTML = "<h3>Your wishlist is empty!</h3>";
        return;
    }

    myItems.forEach(item => {
        container.innerHTML += `
                    <div class="card">
                        <img src="${item.image}">
                        <h3>${item.title}</h3>
                        <p>${item.price}</p>
                        <button class="remove-btn" onclick="removeFromWishlist(${item.id})">Remove 🗑️</button>
                    </div>`;
    });
}

function removeFromWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('userWishlist'));
    wishlist = wishlist.filter(itemId => itemId !== id);
    localStorage.setItem('userWishlist', JSON.stringify(wishlist));
    location.reload();
}
loadWishlist();