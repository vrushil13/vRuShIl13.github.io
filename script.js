'use strict';

document.getElementById('year').textContent = new Date().getFullYear();

// CURSOR
const cursor = document.getElementById('cursor');
if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a,button,input,textarea').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.width='20px';cursor.style.height='20px';cursor.style.opacity='.5'; });
    el.addEventListener('mouseleave', () => { cursor.style.width='8px';cursor.style.height='8px';cursor.style.opacity='1'; });
  });
} else { cursor.style.display='none'; }

// SCROLL PROGRESS + NAV COMPACT
const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  progress.style.width = Math.min(pct, 100) + '%';
  document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// HAMBURGER
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
hamburger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});
navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => { navMenu.classList.remove('open'); hamburger.setAttribute('aria-expanded','false'); });
});

// REVEAL ON SCROLL
const revealEls = document.querySelectorAll('.reveal,.tl-item');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));

// TYPE CYCLE
const words = ['Full-Stack Developer','Backend Engineer','Next.js Developer','React Developer','TypeScript Developer','Go Developer','Python Developer','Problem Solver'];
let wi=0,ci=0,deleting=false;
const typeEl = document.getElementById('type-cycle');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  function typeStep() {
    const w = words[wi];
    if (!deleting) {
      typeEl.textContent = w.slice(0,++ci);
      if (ci===w.length){deleting=true;setTimeout(typeStep,1800);return;}
    } else {
      typeEl.textContent = w.slice(0,--ci);
      if (ci===0){deleting=false;wi=(wi+1)%words.length;setTimeout(typeStep,300);return;}
    }
    setTimeout(typeStep, deleting ? 50 : 80);
  }
  typeStep();
}

// SEASONS
const SEASONS = {
  spring:{ pColor:[134,239,172], pShape:'petal' },
  summer:{ pColor:[251,191,36],  pShape:'ray'   },
  autumn:{ pColor:[249,115,22],  pShape:'leaf'  },
  winter:{ pColor:[147,197,253], pShape:'snow'  }
};
let currentSeason = 'winter';

function setSeason(season) {
  if (!SEASONS[season]) return;
  const overlay = document.getElementById('season-overlay');
  overlay.style.opacity = '1';
  setTimeout(() => {
    document.body.className = season;
    currentSeason = season;
    document.querySelectorAll('.s-btn').forEach(b => {
      const active = b.dataset.season === season;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active);
    });
    try { localStorage.setItem('season', season); } catch(e) {}
    initParticles();
    overlay.style.opacity = '0';
  }, 350);
}

document.querySelectorAll('.s-btn').forEach(b => {
  b.addEventListener('click', () => setSeason(b.dataset.season));
});
try {
  const saved = localStorage.getItem('season');
  if (saved && SEASONS[saved]) setSeason(saved);
} catch(e) {}

// CANVAS PARTICLES
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [], animFrame;

function initParticles() {
  cancelAnimationFrame(animFrame);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles = [];
  if (prefersReducedMotion) return;
  const cfg = SEASONS[currentSeason];
  const count = Math.min(55, Math.floor(window.innerWidth / 22));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 4 + 2,
      vx: (Math.random()-.5) * .35,
      vy: Math.random() * .55 + .15,
      alpha: Math.random() * .55 + .15,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random()-.5) * .025,
      rgb: cfg.pColor,
      shape: cfg.pShape
    });
  }
  animateParticles();
}

function drawParticle(p) {
  ctx.save();
  ctx.globalAlpha = p.alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  const c = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},0.85)`;
  if (p.shape === 'snow') {
    ctx.strokeStyle = c; ctx.lineWidth = 1;
    for (let i=0;i<6;i++){
      ctx.beginPath();
      const a=(i/6)*Math.PI*2;
      ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*p.size,Math.sin(a)*p.size);
      ctx.stroke();
    }
  } else if (p.shape === 'petal') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(0,0,p.size*1.4,p.size*.65,0,0,Math.PI*2);
    ctx.fill();
  } else if (p.shape === 'leaf') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(0,-p.size);
    ctx.quadraticCurveTo(p.size*.8,0,0,p.size);
    ctx.quadraticCurveTo(-p.size*.8,0,0,-p.size);
    ctx.fill();
  } else {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(0,0,p.size*.6,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function animateParticles() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p => {
    p.x+=p.vx; p.y+=p.vy; p.rot+=p.vrot;
    if (p.y>canvas.height+20){p.y=-20;p.x=Math.random()*canvas.width;}
    if (p.x<-20) p.x=canvas.width+20;
    if (p.x>canvas.width+20) p.x=-20;
    drawParticle(p);
  });
  animFrame = requestAnimationFrame(animateParticles);
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initParticles, 200);
}, { passive: true });
initParticles();

// TERMINAL
const termLines = [
  {type:'cmd',  text:'whoami'},
  {type:'out',  text:'vrushil-patel  →  associate software engineer & full-stack developer'},
  {type:'cmd',  text:'cat current.txt'},
  {type:'hi',   text:'Norima Consulting Inc. — Associate SWE  ·  Jul 2026 – present'},
  {type:'cmd',  text:'cat skills.txt'},
  {type:'hi',   text:'Next.js · TypeScript · React · Go · Ruby on Rails · Python · GraphQL · SQL'},
  {type:'cmd',  text:'cat experience.txt'},
  {type:'out',  text:'↳ Norima Consulting     (Jul 2026–present)'},
  {type:'out',  text:'↳ IG Wealth Management  (Aug 2025–Jul 2026)'},
  {type:'out',  text:'↳ Priceline             (Sep 2024–Dec 2024)'},
  {type:'out',  text:'↳ IG Wealth Management  (Jan 2024–Aug 2024)'},
  {type:'out',  text:'↳ Pollard Banknote      (May 2023–Sep 2023)'},
  {type:'cmd',  text:'echo $EDUCATION'},
  {type:'out',  text:'BSc Honours Computer Science — University of Manitoba (2021–2025)'},
  {type:'cmd',  text:'echo $STATUS'},
  {type:'hi',   text:'✓  vrushil13@gmail.com  ·  Winnipeg, MB  ·  linkedin.com/in/vrushilp13'},
  {type:'cmd',  text:'_'},
];
const termEl = document.getElementById('terminal-body');
let tli=0,tci=0,termStarted=false;

function typeTerminal() {
  if (tli>=termLines.length) return;
  const line=termLines[tli];
  if (tci===0) {
    const div=document.createElement('div');
    div.style.lineHeight='1.9';
    if (line.type==='cmd') {
      div.innerHTML='<span style="color:var(--accent)">vrushil@dev ~ $ </span><span id="tl-'+tli+'"></span>';
    } else if (line.type==='hi') {
      div.innerHTML='<span style="color:var(--accent2)" id="tl-'+tli+'"></span>';
    } else {
      div.innerHTML='<span style="color:var(--muted)" id="tl-'+tli+'"></span>';
    }
    termEl.appendChild(div);
  }
  const span=document.getElementById('tl-'+tli);
  if (span && tci<=line.text.length) {
    span.textContent=line.text.slice(0,tci);
    tci++;
    setTimeout(typeTerminal, line.type==='cmd'?45:14);
  } else {
    tli++;tci=0;
    setTimeout(typeTerminal, line.type==='cmd'?600:100);
  }
}

const termObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !termStarted && !prefersReducedMotion) {
    termStarted=true;
    typeTerminal();
    termObserver.disconnect();
  }
},{threshold:.3});
termObserver.observe(termEl);
if (prefersReducedMotion) {
  termLines.forEach((line,i) => {
    const div=document.createElement('div');
    if (line.type==='cmd') div.innerHTML='<span style="color:var(--accent)">vrushil@dev ~ $ </span><span>'+line.text+'</span>';
    else if (line.type==='hi') div.innerHTML='<span style="color:var(--accent2)">'+line.text+'</span>';
    else div.innerHTML='<span style="color:var(--muted)">'+line.text+'</span>';
    termEl.appendChild(div);
  });
}

// CONTACT FORM
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mgaegddv';
let lastSent = 0;
function handleContact() {
  if (document.getElementById('hp').value) return;
  const now = Date.now();
  if (now - lastSent < 30000) { showStatus('Please wait 30 seconds before sending again.', false); return; }
  const name = sanitize(document.getElementById('name').value.trim());
  const email = sanitize(document.getElementById('email').value.trim());
  const msg = sanitize(document.getElementById('message').value.trim());
  if (!name||!email||!msg) { showStatus('Please fill in all fields.', false); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showStatus('Please enter a valid email address.', false); return; }
  if (msg.length > 2000) { showStatus('Message too long (max 2000 characters).', false); return; }
  const btn = document.getElementById('send-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;
  btn.setAttribute('aria-busy','true');

  fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new FormData(document.getElementById('contact-form'))
  })
  .then(res => {
    if (res.ok) {
      lastSent = Date.now();
      showStatus('Message sent! I\'ll get back to you soon. 👋', true);
      document.getElementById('name').value='';
      document.getElementById('email').value='';
      document.getElementById('message').value='';
    } else {
      return res.json().then(data => {
        const errMsg = (data && data.errors) ? data.errors.map(e => e.message).join(', ') : 'Something went wrong. Please email me directly.';
        showStatus(errMsg, false);
      });
    }
  })
  .catch(() => {
    showStatus('Something went wrong. Please try again or email me directly.', false);
  })
  .finally(() => {
    btn.textContent = 'Send message →';
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
  });
}

function sanitize(str) { return str.replace(/<[^>]*>/g,'').substring(0,2000); }

function showStatus(msg, ok) {
  const el = document.getElementById('form-status');
  el.textContent = msg;
  el.className = 'form-status ' + (ok?'success':'error');
  setTimeout(() => { el.className='form-status'; }, 6000);
}
