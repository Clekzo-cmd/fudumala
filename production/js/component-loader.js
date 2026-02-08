// Component Loader for Fudumala Website
// Loads navigation and footer components dynamically

function loadComponent(elementId, componentPath) {
  const element = document.getElementById(elementId);
  if (!element) return;

  fetch(componentPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      element.innerHTML = html;
      
      // If it's navigation, ensure current page highlighting
      if (elementId === 'navigation-component') {
        highlightCurrentPage();
        initializeNavigation();
      }
    })
    .catch(error => {
      console.warn('Could not load component:', componentPath, error);
      // Fallback: keep existing content if component loading fails
    });
}

function highlightCurrentPage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar6_link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('w--current');
    } else {
      link.classList.remove('w--current');
    }
  });
}

function initializeNavigation() {
  // Sticky Navigation with enhanced performance
  const navbar = document.querySelector('.navbar6_component');
  if (!navbar) return;
  
  let lastScrollTop = 0;
  let scrollThreshold = 50;
  
  function handleScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    if (currentScroll > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }
  
  // Throttled scroll handler for performance
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Initial scroll check
  handleScroll();
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Load navigation component
  loadComponent('navigation-component', 'components/navigation.html');
  
  // Load footer component
  loadComponent('footer-component', 'components/footer.html');
  
  // Add page wrapper padding for fixed navigation
  const pageWrapper = document.querySelector('.page-wrapper');
  if (pageWrapper && !pageWrapper.style.paddingTop) {
    pageWrapper.style.paddingTop = '80px';
  }
});

// Add mobile responsive padding adjustments
function adjustPaddingForMobile() {
  const pageWrapper = document.querySelector('.page-wrapper');
  if (!pageWrapper) return;
  
  if (window.innerWidth <= 991) {
    pageWrapper.style.paddingTop = '64px';
  } else if (window.innerWidth <= 479) {
    pageWrapper.style.paddingTop = '60px';
  } else {
    pageWrapper.style.paddingTop = '80px';
  }
}

// Listen for window resize
window.addEventListener('resize', adjustPaddingForMobile);
window.addEventListener('load', adjustPaddingForMobile);