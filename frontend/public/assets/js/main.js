/**
 * Dewi main.js — adapté Angular (null-safe + ré-init)
 */
(function() {
  "use strict";

  window.initDewiTemplate = function() {

    function toggleScrolled() {
      const selectBody = document.querySelector('body');
      const selectHeader = document.querySelector('#header');
      if (!selectBody || !selectHeader) return;
      if (!selectHeader.classList.contains('scroll-up-sticky') &&
        !selectHeader.classList.contains('sticky-top') &&
        !selectHeader.classList.contains('fixed-top')) return;
      window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
    }

    document.addEventListener('scroll', toggleScrolled);
    window.addEventListener('load', toggleScrolled);
    toggleScrolled();

    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

    function mobileNavToogle() {
      document.querySelector('body')?.classList.toggle('mobile-nav-active');
      mobileNavToggleBtn?.classList.toggle('bi-list');
      mobileNavToggleBtn?.classList.toggle('bi-x');
    }

    if (mobileNavToggleBtn && !mobileNavToggleBtn.dataset.dewiBound) {
      mobileNavToggleBtn.dataset.dewiBound = 'true';
      mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
    }

    document.querySelectorAll('#navmenu a').forEach(navmenu => {
      if (navmenu.dataset.dewiBound) return;
      navmenu.dataset.dewiBound = 'true';
      navmenu.addEventListener('click', () => {
        if (document.querySelector('.mobile-nav-active')) {
          mobileNavToogle();
        }
      });
    });

    document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
      if (navmenu.dataset.dewiBound) return;
      navmenu.dataset.dewiBound = 'true';
      navmenu.addEventListener('click', function(e) {
        e.preventDefault();
        this.parentNode.classList.toggle('active');
        this.parentNode.nextElementSibling?.classList.toggle('dropdown-active');
        e.stopImmediatePropagation();
      });
    });

    const preloader = document.querySelector('#preloader');
    if (preloader) preloader.remove();

    const scrollTop = document.querySelector('.scroll-top');
    function toggleScrollTop() {
      if (scrollTop) {
        window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
      }
    }
    if (scrollTop && !scrollTop.dataset.dewiBound) {
      scrollTop.dataset.dewiBound = 'true';
      scrollTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    document.addEventListener('scroll', toggleScrollTop);
    toggleScrollTop();

    if (typeof AOS !== 'undefined' && document.body) {
      try {
        AOS.init({
          duration: 600,
          easing: 'ease-in-out',
          once: true,
          mirror: false
        });
      } catch (e) {
        console.warn('AOS init skipped', e);
      }
    }

    if (typeof GLightbox !== 'undefined') {
      GLightbox({ selector: '.glightbox' });
    }

    if (typeof PureCounter !== 'undefined') {
      new PureCounter();
    }

    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      const configEl = swiperElement.querySelector(".swiper-config");
      if (!configEl || typeof Swiper === 'undefined') return;
      const config = JSON.parse(configEl.innerHTML.trim());
      new Swiper(swiperElement, config);
    });
  };

})();
