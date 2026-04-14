// ── Navbar scroll ──
const navbar = document.getElementById('navbar');
if (navbar) window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));

// ── Mobile nav ──
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));
}

// ── Active page ──
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const map = { 'index.html': 'Home', 'academics.html': 'Academics', 'students.html': 'Students', 'blog.html': 'Blog', 'personal.html': 'Personal' };
  const label = map[page];
  if (!label) return;
  document.querySelectorAll('.nav-links a').forEach(a => { if (a.textContent.trim() === label) a.classList.add('active'); });
})();

// ── Scroll reveal ──
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach(el => obs.observe(el));
}

// ── Contact form ──
function handleContactSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  btn.textContent = 'Message Sent!';
  btn.style.background = 'linear-gradient(145deg, #5BBFB5, #4aa89f)';
  setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; e.target.reset(); }, 2500);
}
