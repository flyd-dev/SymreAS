// Page intro / preloader
const pageIntro = document.getElementById('page-intro');
if (pageIntro) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hold = reduceMotion ? 200 : 1500;

  let dismissed = false;
  const dismissIntro = () => {
    if (dismissed) return;
    dismissed = true;
    pageIntro.classList.add('is-done');
    document.body.classList.remove('is-loading');
    pageIntro.addEventListener('transitionend', () => pageIntro.remove(), { once: true });
    // Safety: ensure removal even if transitionend doesn't fire
    window.setTimeout(() => pageIntro.remove(), 1200);
  };

  const start = () => window.setTimeout(dismissIntro, hold);

  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start, { once: true });
  }

  // Hard fallback: dismiss after 4s no matter what
  window.setTimeout(dismissIntro, 4000);
}

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const mobileNav = document.getElementById('mobile-nav');

if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', !open ? 'Lukk meny' : 'Åpne meny');
    if (open) {
      mobileNav.setAttribute('hidden', '');
    } else {
      mobileNav.removeAttribute('hidden');
    }
  });

  // Close mobile menu on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Åpne meny');
      mobileNav.setAttribute('hidden', '');
    });
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Reveal-on-scroll for sections, cards, frames, intros
const targets = document.querySelectorAll(
  '.intro-text, .intro-media, .section-head, .card, .order-text, .order-media, .about-media, .about-text, .contact-card, .map-wrap'
);
targets.forEach(el => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );
  targets.forEach(el => io.observe(el));
} else {
  targets.forEach(el => el.classList.add('in'));
}
