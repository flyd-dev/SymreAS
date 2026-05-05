// Vertical cut reveal — split text inside an element into per-character animated spans.
// Walks descendants so inline elements (e.g. <em>) keep their styling.
function buildVerticalCutReveal(root, opts = {}) {
  const stagger = opts.stagger ?? 0.025; // seconds between characters
  const baseDelay = opts.delay ?? 0;     // seconds before first char animates
  const segmenter = (typeof Intl !== 'undefined' && 'Segmenter' in Intl)
    ? new Intl.Segmenter('nb', { granularity: 'grapheme' })
    : null;
  let charIndex = 0;

  const splitGraphemes = (s) =>
    segmenter ? Array.from(segmenter.segment(s), seg => seg.segment) : Array.from(s);

  const processTextNode = (textNode) => {
    const text = textNode.nodeValue;
    if (!text) return;
    const frag = document.createDocumentFragment();
    // Keep whitespace runs as-is so words wrap naturally
    text.split(/(\s+)/).forEach(token => {
      if (!token) return;
      if (/^\s+$/.test(token)) {
        frag.appendChild(document.createTextNode(token));
        return;
      }
      const wordSpan = document.createElement('span');
      wordSpan.className = 'vcr-word';
      splitGraphemes(token).forEach(g => {
        const mask = document.createElement('span');
        mask.className = 'vcr-mask';
        const char = document.createElement('span');
        char.className = 'vcr-char';
        char.style.setProperty('--vcr-delay', (baseDelay + charIndex * stagger).toFixed(3) + 's');
        char.textContent = g;
        mask.appendChild(char);
        wordSpan.appendChild(mask);
        charIndex++;
      });
      frag.appendChild(wordSpan);
    });
    textNode.parentNode.replaceChild(frag, textNode);
  };

  const walk = (node) => {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) processTextNode(child);
      else if (child.nodeType === Node.ELEMENT_NODE) walk(child);
    });
  };

  walk(root);
}

// Page intro / preloader
const pageIntro = document.getElementById('page-intro');

// Prepare hero heading split before reveal so the page paints with chars hidden
const heroTitle = document.getElementById('hero-title');
if (heroTitle) {
  heroTitle.setAttribute('aria-label', heroTitle.textContent.trim());
  heroTitle.classList.add('vcr');
  buildVerticalCutReveal(heroTitle, { stagger: 0.028, delay: 0 });
}
const revealHero = () => heroTitle && heroTitle.classList.add('is-revealed');

if (pageIntro) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hold = reduceMotion ? 200 : 1500;

  let dismissed = false;
  const dismissIntro = () => {
    if (dismissed) return;
    dismissed = true;
    pageIntro.classList.add('is-done');
    document.body.classList.remove('is-loading');
    // Trigger hero text reveal as the preloader fades out
    revealHero();
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
} else {
  // No preloader present — reveal immediately on load
  if (document.readyState === 'complete') revealHero();
  else window.addEventListener('load', revealHero, { once: true });
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
