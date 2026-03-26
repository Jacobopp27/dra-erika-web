/**
 * main.js — Interactive functionality
 * Dra. Erika Piedrahita — Medical Epigenetics Website
 *
 * Modules:
 *  1. Sticky Navbar (transparent → frosted on scroll)
 *  2. Hamburger / Mobile Menu
 *  3. Smooth Scroll for anchor links
 *  4. Testimonial Carousel (prev/next + dots + autoplay)
 *  5. Scroll-reveal animations (IntersectionObserver)
 *  6. Scroll Progress Bar
 *  7. Back-to-Top button
 *  8. Active nav link on scroll (spy)
 */

'use strict';

/* =========================================================
   Utility helpers
   ========================================================= */

/**
 * Shorthand for querySelector
 * @param {string} selector
 * @param {Element} [scope=document]
 */
const $ = (selector, scope = document) => scope.querySelector(selector);

/**
 * Shorthand for querySelectorAll → Array
 * @param {string} selector
 * @param {Element} [scope=document]
 */
const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

/* =========================================================
   1. STICKY NAVBAR
   ========================================================= */
function initStickyNav() {
  const navbar = $('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* =========================================================
   2. HAMBURGER / MOBILE MENU
   ========================================================= */
function initMobileMenu() {
  const hamburger = $('.navbar__hamburger');
  const mobileMenu = $('.navbar__mobile');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  $$('.navbar__mobile-link', mobileMenu).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on backdrop click (outside menu)
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('is-open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* =========================================================
   3. SMOOTH SCROLL
   ========================================================= */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = $(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = $('.navbar')?.offsetHeight ?? 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}

/* =========================================================
   4. TESTIMONIAL CAROUSEL
   ========================================================= */
function initTestimonialCarousel() {
  const carousel  = $('.testimonials__carousel');
  const slides    = $$('.testimonials__slide');
  const btnPrev   = $('.testimonials__btn--prev');
  const btnNext   = $('.testimonials__btn--next');
  const dotsWrap  = $('.testimonials__dots');

  if (!carousel || slides.length === 0) return;

  let current   = 0;
  let autoTimer = null;
  const total   = slides.length;

  // Build dots
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonials__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Testimonio ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function updateDots() {
    if (!dotsWrap) return;
    $$('.testimonials__dot', dotsWrap).forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = (index + total) % total;
    carousel.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(next, 5500);
  }

  function stopAutoplay() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => { next(); stopAutoplay(); startAutoplay(); });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => { prev(); stopAutoplay(); startAutoplay(); });
  }

  // Touch / swipe support
  let touchStartX = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      stopAutoplay();
      startAutoplay();
    }
  }, { passive: true });

  // Pause on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  // Keyboard accessibility
  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prev(); stopAutoplay(); startAutoplay(); }
    if (e.key === 'ArrowRight') { next(); stopAutoplay(); startAutoplay(); }
  });

  startAutoplay();
}

/* =========================================================
   5. SCROLL-REVEAL ANIMATIONS (IntersectionObserver)
   ========================================================= */
function initScrollReveal() {
  const elements = $$('.reveal, .reveal-left, .reveal-right');

  if (!elements.length) return;

  // Stagger siblings within same parent
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el, i) => {
    // Apply staggered delay based on data attribute or sibling index
    const delay = el.dataset.delay || (i % 4) * 100;
    el.style.transitionDelay = `${delay}ms`;
    observer.observe(el);
  });
}

/* =========================================================
   6. SCROLL PROGRESS BAR
   ========================================================= */
function initScrollProgress() {
  const bar = $('.scroll-progress');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = docHeight > 0 ? scrollTop / docHeight : 0;
    bar.style.transform = `scaleX(${progress})`;
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* =========================================================
   7. BACK-TO-TOP BUTTON
   ========================================================= */
function initBackToTop() {
  const btn = $('.back-to-top');
  if (!btn) return;

  const toggle = () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =========================================================
   8. ACTIVE NAV LINK (scroll spy)
   ========================================================= */
function initScrollSpy() {
  const sections = $$('section[id]');
  const navLinks = $$('.navbar__nav-link[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    {
      rootMargin: '-30% 0px -60% 0px',
    }
  );

  sections.forEach(sec => observer.observe(sec));
}

/* =========================================================
   9. HERO ENTRANCE ANIMATIONS
   ========================================================= */
function initHeroAnimations() {
  // Elements already have CSS animation classes via HTML
  // This just ensures they're visible when JS is disabled via a
  // no-js fallback class removal
  document.documentElement.classList.remove('no-js');
}

/* =========================================================
   10. LAZY LOAD IFRAMES (YouTube)
   ========================================================= */
function initLazyIframes() {
  const iframes = $$('iframe[data-src]');
  if (!iframes.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          iframe.src = iframe.dataset.src;
          observer.unobserve(iframe);
        }
      });
    },
    { rootMargin: '200px 0px' }
  );

  iframes.forEach(iframe => observer.observe(iframe));
}

/* =========================================================
   11. SERVICE CARDS TOGGLE
   ========================================================= */
function initServiceToggle() {
  console.log('=== initServiceToggle START ===');
  const toggleButtons = $$('.service-card__toggle');
  
  console.log('Toggle buttons found:', toggleButtons.length);
  console.log('Buttons:', toggleButtons);
  
  if (toggleButtons.length === 0) {
    console.error('No toggle buttons found!');
    return;
  }
  
  toggleButtons.forEach((button, index) => {
    console.log(`Setting up button ${index}:`, button);
    
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('=== BUTTON CLICKED ===', index);
      
      const card = this.closest('.service-card');
      console.log('Card found:', card);
      
      const details = card.querySelector('.service-card__details');
      console.log('Details found:', details);
      
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      console.log('Is expanded:', isExpanded);
      
      // Toggle expanded state
      this.setAttribute('aria-expanded', !isExpanded);
      
      if (isExpanded) {
        details.setAttribute('hidden', '');
        this.querySelector('span').textContent = 'Ver detalles';
        console.log('Collapsed');
      } else {
        details.removeAttribute('hidden');
        this.querySelector('span').textContent = 'Ocultar detalles';
        console.log('Expanded');
      }
    });
    
    console.log(`Button ${index} event listener attached`);
  });
  
  console.log('=== initServiceToggle END ===');
}

/* =========================================================
   INIT — Run everything when DOM is ready
   ========================================================= */
function init() {
  console.log('Initializing...');
  initHeroAnimations();
  initStickyNav();
  initMobileMenu();
  initSmoothScroll();
  initTestimonialCarousel();
  initScrollReveal();
  initScrollProgress();
  initBackToTop();
  initScrollSpy();
  initLazyIframes();
  initServiceToggle();
  console.log('All initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
