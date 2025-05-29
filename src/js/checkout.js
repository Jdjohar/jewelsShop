// Checkout Page Functionality

document.addEventListener('DOMContentLoaded', function() {
  // Same as billing checkbox
  const sameAsBillingCheckbox = document.getElementById('sameAsBilling');
  
  if (sameAsBillingCheckbox) {
    // Set to checked by default
    sameAsBillingCheckbox.checked = true;
    
    // Add change event to toggle billing address visibility
    sameAsBillingCheckbox.addEventListener('change', function() {
      // In a full implementation, this would show/hide a billing address form
      console.log(`Billing same as shipping: ${this.checked}`);
    });
  }
  
  // Shipping method selection
  const shippingMethods = document.querySelectorAll('input[name="shippingMethod"]');
  shippingMethods.forEach(method => {
    method.addEventListener('change', function() {
      updateOrderSummary();
    });
  });
  
  // Update order summary on load
  updateOrderSummary();
  
  // Continue to payment button
  const continueBtn = document.querySelector('.continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', function() {
      const form = document.getElementById('checkoutForm');
      if (form.checkValidity()) {
        // In a real app, this would navigate to the payment page
        alert('In a real application, this would proceed to the payment step.');
      } else {
        // Trigger form validation
        form.reportValidity();
      }
    });
  }
  
  // Promo code application
  const promoCodeButton = document.querySelector('#promoCode + .btn');
  const promoCodeInput = document.getElementById('promoCode');
  
  if (promoCodeButton && promoCodeInput) {
    promoCodeButton.addEventListener('click', function() {
      if (promoCodeInput.value.trim() !== '') {
        // Check promo code (simplified for demo)
        if (promoCodeInput.value.toUpperCase() === 'DISCOUNT10') {
          showDiscountApplied(10);
        } else if (promoCodeInput.value.toUpperCase() === 'SAVE20') {
          showDiscountApplied(20);
        } else {
          // Invalid promo code
          showToast('Invalid promo code', 'danger');
        }
      }
    });
  }
});

// Update order summary based on selected shipping and items
function updateOrderSummary() {
  const shippingElement = document.querySelector('.order-shipping');
  const subtotalElement = document.querySelector('.order-subtotal');
  const taxElement = document.querySelector('.order-tax');
  const discountElement = document.querySelector('.order-discount');
  const totalElement = document.querySelector('.order-total');
  
  if (!shippingElement || !subtotalElement || !taxElement || !discountElement || !totalElement) return;
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Get selected shipping method
  let shipping = 0;
  const shippingMethods = document.querySelectorAll('input[name="shippingMethod"]');
  const selectedMethod = Array.from(shippingMethods).find(method => method.checked);
  
  if (selectedMethod) {
    if (selectedMethod.id === 'expressShipping') {
      shipping = 9.99;
    } else if (selectedMethod.id === 'nextDayShipping') {
      shipping = 14.99;
    }
  }
  
  // Calculate tax (assume 8%)
  const tax = subtotal * 0.08;
  
  // Get discount (if any)
  const discount = sessionStorage.getItem('checkout_discount') 
    ? parseFloat(sessionStorage.getItem('checkout_discount')) 
    : 0;
  
  // Calculate total
  const total = subtotal + shipping + tax - discount;
  
  // Update display
  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  shippingElement.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
  taxElement.textContent = `$${tax.toFixed(2)}`;
  discountElement.textContent = `-$${discount.toFixed(2)}`;
  totalElement.textContent = `$${total.toFixed(2)}`;
}

// Show discount applied
function showDiscountApplied(percentage) {
  // Get cart total
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate discount amount
  const discountAmount = subtotal * (percentage / 100);
  
  // Save discount to session storage
  sessionStorage.setItem('checkout_discount', discountAmount.toString());
  
  // Show success message
  showToast(`${percentage}% discount applied!`, 'success');
  
  // Update order summary
  updateOrderSummary();
}

// Show toast notification
function showToast(message, type = 'primary') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  
  // Create toast content
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  // Add toast to container
  toastContainer.appendChild(toastEl);
  
  // Initialize and show toast
  const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 });
  toast.show();
  
  // Remove toast from DOM after it's hidden
  toastEl.addEventListener('hidden.bs.toast', function() {
    toastEl.remove();
  });
}