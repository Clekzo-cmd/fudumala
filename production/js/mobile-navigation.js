/**
 * Fudumala Mobile Navigation Enhancement
 * Ensures consistent mobile menu behavior across all pages
 * Compatible with Webflow navigation
 */

(function() {
  'use strict';
  
  // Wait for DOM and Webflow to be ready
  function initWhenReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
      // Small delay to ensure Webflow is initialized
      setTimeout(initMobileNav, 100);
    }
  }
  
  function initMobileNav() {
    console.log('Initializing mobile navigation...');
    
    // Find navigation elements with multiple possible selectors
    const navbar = document.querySelector('.navbar6_component, .w-nav, [role="banner"]');
    const menuButton = document.querySelector('.navbar6_menu-button, .w-nav-button, .menu-button');
    const navMenu = document.querySelector('.navbar6_menu, .w-nav-menu, nav[role="navigation"]');
    const navLinks = document.querySelectorAll('.navbar6_link, .w-nav-link, .nav-link');
    const menuIcon = document.querySelector('.menu-icon5, .menu-icon1, .w-icon-nav-menu');
    
    if (!menuButton || !navMenu) {
      console.warn('Mobile navigation elements not found. Retrying...');
      // Retry after a short delay if elements aren't found
      setTimeout(function() {
        const retryButton = document.querySelector('.navbar6_menu-button, .w-nav-button');
        const retryMenu = document.querySelector('.navbar6_menu, .w-nav-menu');
        if (retryButton && retryMenu) {
          initMobileNav();
        }
      }, 500);
      return;
    }
    
    console.log('Navigation elements found:', { navbar, menuButton, navMenu });
    
    let isMenuOpen = false;
    let scrollThreshold = 50;
    
    // Remove any existing Webflow click handlers and add our own
    const newMenuButton = menuButton.cloneNode(true);
    menuButton.parentNode.replaceChild(newMenuButton, menuButton);
    
    // Mobile menu toggle function
    function toggleMenu(forceClose = false) {
      if (forceClose) {
        isMenuOpen = false;
      } else {
        isMenuOpen = !isMenuOpen;
      }
      
      console.log('Toggle menu:', isMenuOpen ? 'open' : 'closed');
      
      if (isMenuOpen) {
        // Open menu
        navMenu.style.display = 'flex';
        navMenu.style.maxHeight = 'calc(100vh - 80px)';
        navMenu.style.opacity = '1';
        navMenu.classList.add('nav-open', 'w--nav-menu-open', 'is-open');
        newMenuButton.classList.add('w--open', 'is-active');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('menu-open');
        
        // Ensure menu is visible on mobile
        if (window.innerWidth <= 991) {
          navMenu.style.transform = 'translateY(0)';
          navMenu.style.visibility = 'visible';
          navMenu.style.pointerEvents = 'auto';
        }
        
        // Animate hamburger icon
        animateHamburger(true);
      } else {
        // Close menu
        navMenu.classList.remove('nav-open', 'w--nav-menu-open', 'is-open');
        newMenuButton.classList.remove('w--open', 'is-active');
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');
        
        // Animate hamburger icon
        animateHamburger(false);
        
        // Hide menu after animation
        setTimeout(() => {
          if (!isMenuOpen) {
            navMenu.style.display = '';
            navMenu.style.maxHeight = '';
            navMenu.style.opacity = '';
            navMenu.style.transform = '';
            navMenu.style.visibility = '';
            navMenu.style.pointerEvents = '';
          }
        }, 300);
      }
    }
    
    // Animate hamburger menu icon
    function animateHamburger(open) {
      const lineTop = newMenuButton.querySelector('.menu-icon1_line-top, .w-icon-nav-menu');
      const lineMiddle = newMenuButton.querySelector('.menu-icon1_line-middle');
      const lineBottom = newMenuButton.querySelector('.menu-icon1_line-bottom');
      
      if (lineTop && lineMiddle && lineBottom) {
        if (open) {
          lineTop.style.transform = 'rotate(45deg) translateY(8px)';
          lineMiddle.style.opacity = '0';
          lineBottom.style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
          lineTop.style.transform = '';
          lineMiddle.style.opacity = '';
          lineBottom.style.transform = '';
        }
      }
    }
    
    // Menu button click handler
    newMenuButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
    
    // Prevent event bubbling on menu
    navMenu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    
    // Close menu when clicking on links (mobile only)
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        if (window.innerWidth <= 991 && isMenuOpen) {
          // Allow default navigation
          setTimeout(() => {
            toggleMenu(true);
          }, 100);
        }
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (isMenuOpen && 
          !navMenu.contains(e.target) && 
          !newMenuButton.contains(e.target) &&
          window.innerWidth <= 991) {
        toggleMenu(true);
      }
    });
    
    // Handle escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isMenuOpen) {
        toggleMenu(true);
      }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (window.innerWidth > 991) {
          // Reset menu on desktop
          if (isMenuOpen) {
            toggleMenu(true);
          }
          navMenu.style.display = '';
          navMenu.style.transform = '';
          navMenu.style.visibility = '';
          navMenu.style.pointerEvents = '';
          navMenu.classList.remove('nav-open', 'w--nav-menu-open', 'is-open');
        }
      }, 250);
    });
    
    // Sticky navigation on scroll
    if (navbar) {
      let lastScrollTop = 0;
      let ticking = false;
      
      function handleScroll() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll > scrollThreshold) {
          navbar.classList.add('scrolled', 'is-scrolled');
        } else {
          navbar.classList.remove('scrolled', 'is-scrolled');
        }
        
        // Hide menu on scroll (mobile only)
        if (window.innerWidth <= 991 && isMenuOpen && Math.abs(currentScroll - lastScrollTop) > 10) {
          toggleMenu(true);
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
      }
      
      window.addEventListener('scroll', function() {
        if (!ticking) {
          window.requestAnimationFrame(function() {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      // Initial scroll check
      handleScroll();
    }
    
    // Add required styles if not present
    if (!document.querySelector('#mobile-nav-styles')) {
      const style = document.createElement('style');
      style.id = 'mobile-nav-styles';
      style.textContent = `
        @media screen and (max-width: 991px) {
          .navbar6_menu,
          .w-nav-menu {
            position: fixed !important;
            top: 64px !important;
            left: 0 !important;
            right: 0 !important;
            background: white !important;
            flex-direction: column !important;
            padding: 1.5rem !important;
            max-height: calc(100vh - 64px) !important;
            overflow-y: auto !important;
            z-index: 999 !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
            transform: translateY(-120%) !important;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease !important;
            opacity: 0;
          }
          
          .navbar6_menu.nav-open,
          .navbar6_menu.w--nav-menu-open,
          .navbar6_menu.is-open,
          .w-nav-menu.nav-open,
          .w-nav-menu.w--nav-menu-open,
          .w-nav-menu.is-open {
            transform: translateY(0) !important;
            opacity: 1 !important;
          }
          
          .navbar6_menu-button,
          .w-nav-button {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 48px !important;
            height: 48px !important;
            cursor: pointer !important;
            -webkit-tap-highlight-color: transparent !important;
            background: transparent !important;
            border: none !important;
            padding: 8px !important;
          }
          
          .menu-icon1_line-top,
          .menu-icon1_line-middle,
          .menu-icon1_line-bottom {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            background-color: #333 !important;
            height: 2px !important;
            width: 24px !important;
            display: block !important;
            margin: 4px 0 !important;
          }
          
          .navbar6_menu-left,
          .navbar6_menu-right {
            width: 100% !important;
            flex-direction: column !important;
            gap: 0 !important;
          }
          
          .navbar6_link,
          .w-nav-link {
            display: block !important;
            padding: 1rem !important;
            font-size: 1.125rem !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
            transition: background-color 0.2s ease !important;
          }
          
          .navbar6_link:hover,
          .navbar6_link:focus,
          .w-nav-link:hover,
          .w-nav-link:focus {
            background-color: rgba(107, 70, 193, 0.05) !important;
          }
          
          .navbar6_menu-right .button {
            width: 100% !important;
            margin-top: 1rem !important;
            padding: 1rem !important;
            text-align: center !important;
          }
          
          body.menu-open {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
          }
        }
        
        /* Ensure Webflow's default styles don't interfere */
        @media screen and (max-width: 991px) {
          .w-nav-overlay {
            display: none !important;
          }
          
          .w--nav-menu-open {
            display: flex !important;
          }
        }
        
        /* Animations */
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    console.log('Mobile navigation initialized successfully');
  }
  
  // Initialize
  initWhenReady();
  
  // Also reinitialize if Webflow reinitializes
  if (window.Webflow && window.Webflow.push) {
    window.Webflow.push(function() {
      initMobileNav();
    });
  }
})();