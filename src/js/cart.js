// Shopping Cart functionality

document.addEventListener('DOMContentLoaded', function() {
  // Add to cart buttons
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', addToCart);
  });
  
  // Initialize cart page if we're on it
  if (window.location.pathname.includes('/cart.html')) {
    displayCartItems();
    setupCartFunctionality();
  }
  
  // Initialize checkout page if we're on it
  if (window.location.pathname.includes('/checkout.html')) {
    displayOrderSummary();
  }
  
  // On product detail page, handle quantity input
  if (window.location.pathname.includes('/product-detail.html')) {
    const quantityInput = document.getElementById('productQuantity');
    const decreaseBtn = document.getElementById('decreaseQuantity');
    const increaseBtn = document.getElementById('increaseQuantity');
    
    if (quantityInput && decreaseBtn && increaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
        }
      });
      
      increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
      });
      
      // Add to cart from detail page
      const addToCartBtn = document.querySelector('.add-to-cart-btn');
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function(e) {
          const quantity = parseInt(quantityInput.value);
          const id = this.dataset.id;
          const name = this.dataset.name;
          const price = parseFloat(this.dataset.price);
          const image = this.dataset.image;
          const color = document.querySelector('.selected-color').textContent;
          
          addToCartWithOptions(id, name, price, image, quantity, color);
        });
      }
    }
  }
});

// Add item to cart
function addToCart(e) {
  e.preventDefault();
  
  const button = e.currentTarget;
  const id = button.dataset.id;
  const name = button.dataset.name;
  const price = parseFloat(button.dataset.price);
  const image = button.dataset.image;
  
  addToCartWithOptions(id, name, price, image, 1);
}

// Add to cart with quantity and options
function addToCartWithOptions(id, name, price, image, quantity = 1, color = null) {
  // Get existing cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(item => item.id === id && (!color || item.color === color));
  
  if (existingItemIndex > -1) {
    // Update quantity if item exists
    cart[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    const item = {
      id,
      name,
      price,
      image,
      quantity,
    };
    
    // Add color if selected
    if (color) {
      item.color = color;
    }
    
    cart.push(item);
  }
  
  // Save cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count display
  updateCartCount();
  
  // Show success message
  showToast(`${name} added to cart`);
}

// Display cart items on cart page
function displayCartItems() {
  const cartItemsContainer = document.getElementById('cartItems');
  const emptyCartMessage = document.getElementById('emptyCartMessage');
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    // Show empty cart message
    if (cartItemsContainer) cartItemsContainer.classList.add('d-none');
    if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
    updateCartSummary(cart);
    return;
  }
  
  // Hide empty cart message and show cart items
  if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
  if (cartItemsContainer) {
    cartItemsContainer.classList.remove('d-none');
    
    // Clear existing items
    cartItemsContainer.innerHTML = '';
    
    // Add each cart item to the page
    cart.forEach(item => {
      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'cart-item mb-3 pb-3 border-bottom';
      cartItemElement.dataset.id = item.id;
      if (item.color) cartItemElement.dataset.color = item.color;
      
      cartItemElement.innerHTML = `
        <div class="row align-items-center">
          <div class="col-md-2 col-4 mb-2 mb-md-0">
            <img src="${item.image}" class="img-fluid rounded" alt="${item.name}">
          </div>
          <div class="col-md-4 col-8 mb-2 mb-md-0">
            <h5 class="cart-item-title">${item.name}</h5>
            <p class="text-muted small mb-0">
              ${item.color ? `Color: ${item.color}` : ''}
            </p>
          </div>
          <div class="col-md-2 col-4">
            <div class="quantity-control d-flex align-items-center">
              <button class="btn btn-sm btn-outline-secondary quantity-btn decrease-quantity">-</button>
              <input type="number" min="1" value="${item.quantity}" class="form-control form-control-sm text-center quantity-input">
              <button class="btn btn-sm btn-outline-secondary quantity-btn increase-quantity">+</button>
            </div>
          </div>
          <div class="col-md-2 col-4 text-md-center">
            <span class="fw-bold cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          <div class="col-md-2 col-4 text-end">
            <button class="btn btn-sm btn-outline-danger remove-cart-item">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
      
      cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Add event listeners for new elements
    setupCartItemEvents();
  }
  
  // Update cart summary
  updateCartSummary(cart);
}

// Set up cart functionality
function setupCartFunctionality() {
  // Clear cart button
  const clearCartBtn = document.querySelector('.clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem('cart');
        updateCartCount();
        displayCartItems();
      }
    });
  }
  
  // Shipping method change
  const shippingMethods = document.querySelectorAll('input[name="shipping"]');
  shippingMethods.forEach(method => {
    method.addEventListener('change', function() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      updateCartSummary(cart);
    });
  });
  
  // Enable checkout button if cart has items
  updateCheckoutButton();
}

// Set up event listeners for cart item actions
function setupCartItemEvents() {
  // Quantity decrease buttons
  const decreaseButtons = document.querySelectorAll('.decrease-quantity');
  decreaseButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.nextElementSibling;
      const currentValue = parseInt(input.value);
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateCartItemQuantity(this.closest('.cart-item'), input.value);
      }
    });
  });
  
  // Quantity increase buttons
  const increaseButtons = document.querySelectorAll('.increase-quantity');
  increaseButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.previousElementSibling;
      input.value = parseInt(input.value) + 1;
      updateCartItemQuantity(this.closest('.cart-item'), input.value);
    });
  });
  
  // Quantity input change
  const quantityInputs = document.querySelectorAll('.quantity-input');
  quantityInputs.forEach(input => {
    input.addEventListener('change', function() {
      const value = parseInt(this.value);
      if (value < 1) this.value = 1;
      updateCartItemQuantity(this.closest('.cart-item'), this.value);
    });
  });
  
  // Remove buttons
  const removeButtons = document.querySelectorAll('.remove-cart-item');
  removeButtons.forEach(button => {
    button.addEventListener('click', function() {
      removeCartItem(this.closest('.cart-item'));
    });
  });
}

// Update cart item quantity
function updateCartItemQuantity(cartItemElement, quantity) {
  const id = cartItemElement.dataset.id;
  const color = cartItemElement.dataset.color;
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Find the item in the cart
  const itemIndex = cart.findIndex(item => 
    item.id === id && (!color || item.color === color)
  );
  
  if (itemIndex > -1) {
    // Update quantity
    cart[itemIndex].quantity = parseInt(quantity);
    
    // Update price display
    const priceElement = cartItemElement.querySelector('.cart-item-price');
    if (priceElement) {
      priceElement.textContent = `$${(cart[itemIndex].price * cart[itemIndex].quantity).toFixed(2)}`;
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartSummary(cart);
  }
}

// Remove item from cart
function removeCartItem(cartItemElement) {
  const id = cartItemElement.dataset.id;
  const color = cartItemElement.dataset.color;
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Remove the item from the cart
  cart = cart.filter(item => 
    !(item.id === id && (!color || item.color === color))
  );
  
  // Save updated cart
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Remove the element from the page
  cartItemElement.remove();
  
  // Update cart display
  updateCartCount();
  updateCartSummary(cart);
  
  // Show empty cart message if cart is empty
  if (cart.length === 0) {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    
    if (cartItemsContainer) cartItemsContainer.classList.add('d-none');
    if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
  }
}

// Update cart summary
function updateCartSummary(cart) {
  const subtotalElement = document.querySelector('.cart-subtotal');
  const shippingElement = document.querySelector('.cart-shipping');
  const taxElement = document.querySelector('.cart-tax');
  const discountElement = document.querySelector('.cart-discount');
  const totalElement = document.querySelector('.cart-total');
  
  if (!subtotalElement || !totalElement) return;
  
  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Get shipping cost
  let shipping = 0;
  const shippingMethods = document.querySelectorAll('input[name="shipping"]');
  if (shippingMethods.length > 0) {
    const selectedMethod = Array.from(shippingMethods).find(method => method.checked);
    if (selectedMethod) {
      if (selectedMethod.id === 'expressShipping') {
        shipping = 9.99;
      } else if (selectedMethod.id === 'nextDayShipping') {
        shipping = 14.99;
      }
    }
  }
  
  // Calculate tax (assume 8%)
  const tax = subtotal * 0.08;
  
  // Discount (placeholder)
  const discount = 0;
  
  // Calculate total
  const total = subtotal + shipping + tax - discount;
  
  // Update elements
  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  if (shippingElement) {
    shippingElement.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
  }
  if (taxElement) {
    taxElement.textContent = `$${tax.toFixed(2)}`;
  }
  if (discountElement) {
    discountElement.textContent = discount === 0 ? '-$0.00' : `-$${discount.toFixed(2)}`;
  }
  totalElement.textContent = `$${total.toFixed(2)}`;
  
  // Enable/disable checkout button
  updateCheckoutButton();
}

// Update checkout button state
function updateCheckoutButton() {
  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0) {
      checkoutBtn.classList.remove('disabled');
    } else {
      checkoutBtn.classList.add('disabled');
    }
  }
}

// Display order summary on checkout page
function displayOrderSummary() {
  const orderItems = document.getElementById('orderItems');
  const subtotalElement = document.querySelector('.order-subtotal');
  const shippingElement = document.querySelector('.order-shipping');
  const taxElement = document.querySelector('.order-tax');
  const discountElement = document.querySelector('.order-discount');
  const totalElement = document.querySelector('.order-total');
  
  if (!orderItems || !subtotalElement || !totalElement) return;
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Clear existing items
  orderItems.innerHTML = '';
  
  // Calculate subtotal
  let subtotal = 0;
  
  // Add each cart item to the order summary
  cart.forEach(item => {
    const orderItemElement = document.createElement('div');
    orderItemElement.className = 'order-item d-flex justify-content-between align-items-center mb-3';
    
    orderItemElement.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="order-item-image me-2">
          <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" width="50">
        </div>
        <div>
          <p class="mb-0 order-item-title">${item.name}</p>
          <small class="text-muted">Qty: ${item.quantity}${item.color ? `, ${item.color}` : ''}</small>
        </div>
      </div>
      <span class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
    `;
    
    orderItems.appendChild(orderItemElement);
    
    // Add to subtotal
    subtotal += item.price * item.quantity;
  });
  
  // Calculate other values
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.08; // 8% tax
  const discount = 0; // No discount
  const total = subtotal + shipping + tax - discount;
  
  // Update elements
  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  shippingElement.textContent = 'Free';
  taxElement.textContent = `$${tax.toFixed(2)}`;
  discountElement.textContent = `-$${discount.toFixed(2)}`;
  totalElement.textContent = `$${total.toFixed(2)}`;
  
  // Continue to payment button
  const continueBtn = document.querySelector('.continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', function() {
      const form = document.getElementById('checkoutForm');
      if (form.checkValidity()) {
        alert('Payment processing would happen here in a real application.');
      } else {
        form.reportValidity();
      }
    });
  }
}