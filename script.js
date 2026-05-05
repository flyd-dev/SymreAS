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
