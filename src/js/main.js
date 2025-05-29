// Global JavaScript functionality for the eCommerce site

document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  // Handle wishlist button toggle
  const wishlistButtons = document.querySelectorAll('.wishlist-btn');
  wishlistButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      this.classList.toggle('active');
      const icon = this.querySelector('i');
      if (icon.classList.contains('bi-heart')) {
        icon.classList.replace('bi-heart', 'bi-heart-fill');
        showToast('Product added to wishlist');
      } else {
        icon.classList.replace('bi-heart-fill', 'bi-heart');
        showToast('Product removed from wishlist');
      }
    });
  });

  // Update cart count from localStorage
  updateCartCount();

  // Handle newsletter form submission
  const newsletterForm = document.querySelector('form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      if (e.target.querySelector('input[type="email"]')) {
        e.preventDefault();
        const emailInput = e.target.querySelector('input[type="email"]');
        if (emailInput.value) {
          showToast('Thank you for subscribing!');
          emailInput.value = '';
        }
      }
    });
  }
});

// Create and show toast notification
function showToast(message) {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-white bg-primary border-0';
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

// Update cart count from localStorage
function updateCartCount() {
  const cartCountBadges = document.querySelectorAll('.cart-count');
  
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Calculate total items in cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Update all cart count badges
  cartCountBadges.forEach(badge => {
    badge.textContent = totalItems;
    if (totalItems > 0) {
      badge.classList.remove('d-none');
    } else {
      badge.classList.add('d-none');
    }
  });
}

// Set page title based on URL parameters
function setDynamicPageTitle() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const productTitle = document.getElementById('productTitle');
  const categoryTitle = document.getElementById('categoryTitle');
  const breadcrumbCategory = document.getElementById('breadcrumbCategory');
  
  if (category && categoryTitle) {
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    document.title = `ShopEase | ${formattedCategory}`;
    categoryTitle.textContent = formattedCategory;
    if (breadcrumbCategory) {
      breadcrumbCategory.textContent = formattedCategory;
    }
  }
}

// Initialize the dynamic title
if (window.location.pathname.includes('/products.html')) {
  setDynamicPageTitle();
}