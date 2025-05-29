// Product Listing Page Functionality

document.addEventListener('DOMContentLoaded', function() {
  // Set page title based on category parameter
  setDynamicPageTitle();
  
  // Grid and List view toggle
  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');
  const productsGrid = document.getElementById('productsGrid');
  
  if (gridViewBtn && listViewBtn && productsGrid) {
    // Grid view (default)
    gridViewBtn.addEventListener('click', function() {
      gridViewBtn.classList.add('active');
      listViewBtn.classList.remove('active');
      productsGrid.classList.remove('list-view');
      
      // Update column classes for grid view
      const productItems = productsGrid.querySelectorAll('.product-card').forEach(card => {
        card.closest('[class*="col-"]').className = 'col-lg-4 col-md-6';
      });
    });
    
    // List view
    listViewBtn.addEventListener('click', function() {
      listViewBtn.classList.add('active');
      gridViewBtn.classList.remove('active');
      productsGrid.classList.add('list-view');
      
      // Update column classes for list view
      const productItems = productsGrid.querySelectorAll('.product-card').forEach(card => {
        card.closest('[class*="col-"]').className = 'col-12 mb-3';
      });
    });
  }
  
  // Price range input
  const priceRange = document.getElementById('priceRange');
  const minPrice = document.getElementById('minPrice');
  const maxPrice = document.getElementById('maxPrice');
  
  if (priceRange && minPrice && maxPrice) {
    // Set initial values
    minPrice.value = 0;
    maxPrice.value = 1000;
    priceRange.value = 500;
    
    // Update range on input change
    priceRange.addEventListener('input', function() {
      const value = parseInt(this.value);
      const min = parseInt(minPrice.value) || 0;
      const max = parseInt(maxPrice.value) || 1000;
      
      // Calculate new min/max based on range position
      const newMin = Math.floor((value / 1000) * min);
      const newMax = Math.ceil(max - ((1000 - value) / 1000) * (max - min));
      
      // Update input fields
      minPrice.value = newMin;
      maxPrice.value = newMax;
    });
    
    // Update range when min/max inputs change
    minPrice.addEventListener('change', updatePriceRange);
    maxPrice.addEventListener('change', updatePriceRange);
    
    function updatePriceRange() {
      const min = parseInt(minPrice.value) || 0;
      const max = parseInt(maxPrice.value) || 1000;
      
      // Ensure min doesn't exceed max
      if (min > max) {
        minPrice.value = max;
      }
      
      // Calculate range position based on min/max values
      const rangeValue = ((min / 1000) * 0.5 + (max / 1000) * 0.5) * 1000;
      priceRange.value = rangeValue;
    }
  }
  
  // Filter by category based on URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  
  if (category) {
    // Check the appropriate category checkbox
    const categoryCheckbox = document.getElementById(`${category}Check`);
    if (categoryCheckbox) {
      categoryCheckbox.checked = true;
    }
    
    // Filter products (in a real app, this would query the database)
    filterProductsByCategory(category);
  }
  
  // Category filter checkboxes
  const categoryCheckboxes = document.querySelectorAll('.form-check-input[type="checkbox"]');
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // In a real app, this would trigger filtering via AJAX
      console.log(`Filter by ${this.value}: ${this.checked}`);
    });
  });
});

// Set page title based on category parameter
function setDynamicPageTitle() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
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

// Filter products by category
function filterProductsByCategory(category) {
  // This is a simplified version. In a real app, this would likely be handled server-side
  // or with more advanced client-side filtering.
  
  // For demo purposes, we'll just log the category
  console.log(`Filtering products by category: ${category}`);
  
  // In a real application, this might be an AJAX call to load filtered products
  // or client-side filtering of already loaded products
}