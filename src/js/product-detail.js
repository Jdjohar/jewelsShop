// Product Detail Page Functionality

document.addEventListener('DOMContentLoaded', function() {
  // Thumbnail image click to change main image
  const thumbnails = document.querySelectorAll('.thumbnail-images img');
  const mainImage = document.getElementById('mainImage');
  
  if (thumbnails.length && mainImage) {
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', function() {
        // Update main image
        mainImage.src = this.src;
        
        // Update active thumbnail
        thumbnails.forEach(img => img.classList.remove('thumbnail-active'));
        this.classList.add('thumbnail-active');
      });
    });
  }
  
  // Color option selection
  const colorOptions = document.querySelectorAll('.color-option');
  const selectedColorText = document.querySelector('.selected-color');
  
  if (colorOptions.length && selectedColorText) {
    colorOptions.forEach(color => {
      color.addEventListener('click', function() {
        // Update active color
        colorOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        
        // Update selected color text
        selectedColorText.textContent = this.dataset.color;
      });
    });
  }

  // Rating stars in review form
  const ratingStars = document.querySelectorAll('.star-rating');
  const ratingText = document.querySelector('.rating-text');
  
  if (ratingStars.length && ratingText) {
    ratingStars.forEach(star => {
      // Hover effect
      star.addEventListener('mouseenter', function() {
        const rating = parseInt(this.dataset.rating);
        updateStarDisplay(rating);
      });
      
      // Click to select
      star.addEventListener('click', function() {
        const rating = parseInt(this.dataset.rating);
        setRating(rating);
      });
    });
    
    // Reset on mouse leave if no rating is selected
    document.querySelector('.rating-input').addEventListener('mouseleave', function() {
      const activeRating = document.querySelector('.star-rating.active');
      if (activeRating) {
        updateStarDisplay(parseInt(activeRating.dataset.rating));
      } else {
        resetStars();
      }
    });
  }
  
  // Update star display based on rating
  function updateStarDisplay(rating) {
    ratingStars.forEach(star => {
      const starRating = parseInt(star.dataset.rating);
      if (starRating <= rating) {
        star.classList.remove('bi-star');
        star.classList.add('bi-star-fill');
        star.classList.add('text-warning');
      } else {
        star.classList.remove('bi-star-fill', 'text-warning');
        star.classList.add('bi-star');
      }
    });
    
    // Update text
    if (rating > 0) {
      ratingText.textContent = `${rating} star${rating > 1 ? 's' : ''}`;
    } else {
      ratingText.textContent = 'Click to rate';
    }
  }
  
  // Set active rating
  function setRating(rating) {
    ratingStars.forEach(star => {
      const starRating = parseInt(star.dataset.rating);
      star.classList.remove('active');
      if (starRating <= rating) {
        star.classList.add('active');
      }
    });
  }
  
  // Reset stars to initial state
  function resetStars() {
    ratingStars.forEach(star => {
      star.classList.remove('bi-star-fill', 'text-warning', 'active');
      star.classList.add('bi-star');
    });
    ratingText.textContent = 'Click to rate';
  }
});