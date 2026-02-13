/* =============================================================
   main.js — Terminal Theme Interactivity
   ============================================================= */

(function () {
  'use strict';

  /* ---------- Code Block Enhancement ---------- */
  function initCodeBlocks() {
    document.querySelectorAll('.highlight').forEach(function (block) {
      if (block.querySelector('.code-titlebar')) return;

      // Detect language
      var codeEl = block.querySelector('code[data-lang]');
      var lang = codeEl ? codeEl.getAttribute('data-lang') : '';

      // Build macOS titlebar
      var titlebar = document.createElement('div');
      titlebar.className = 'code-titlebar';
      titlebar.innerHTML =
        '<span class="code-dot red"></span>' +
        '<span class="code-dot yellow"></span>' +
        '<span class="code-dot green"></span>' +
        '<span class="code-titlebar-lang">' + (lang || 'code') + '</span>' +
        '<button class="code-copy-btn" aria-label="Copy code">COPY</button>';

      block.insertBefore(titlebar, block.firstChild);

      // Copy handler
      var btn = titlebar.querySelector('.code-copy-btn');
      btn.addEventListener('click', function () {
        var pre = block.querySelector('pre');
        if (!pre) return;

        var codeText = '';
        var codeTable = pre.querySelector('table');
        if (codeTable) {
          codeTable.querySelectorAll('tr').forEach(function (row) {
            var cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
              codeText += cells[1].textContent;
            }
          });
        } else {
          codeText = pre.textContent;
        }

        navigator.clipboard.writeText(codeText.trim()).then(function () {
          btn.innerHTML = '<svg class="check-icon" viewBox="0 0 16 16" width="14" height="14"><path fill="#00ff41" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.innerHTML = 'COPY';
            btn.classList.remove('copied');
          }, 2000);
        });
      });
    });
  }

  /* ---------- Stats Count-Up Animation ---------- */
  function initCountUp() {
    var numbers = document.querySelectorAll('.stat-number[data-target]');
    if (!numbers.length) return;

    var observed = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !observed) {
          observed = true;
          animateAll();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(document.querySelector('.stats-dashboard'));

    function animateAll() {
      numbers.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target) || target === 0) {
          el.textContent = '0';
          return;
        }
        var duration = 1200;
        var start = performance.now();
        function tick(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        }
        requestAnimationFrame(tick);
      });

      // Animate progress bars
      document.querySelectorAll('.progress-fill[data-width]').forEach(function (bar) {
        var w = bar.getAttribute('data-width');
        setTimeout(function () {
          bar.style.width = w + '%';
        }, 400);
      });
    }
  }

  /* ---------- Hero Terminal Typing Animation ---------- */
  function initHeroTerminal() {
    var body = document.getElementById('hero-terminal-body');
    if (!body) return;

    var lines = [
      { id: 'hero-line-1', typed: true, delay: 400 },
      { id: 'hero-line-2', typed: false, delay: 600 },
      { id: 'hero-line-3', typed: true, delay: 400 },
      { id: 'hero-line-4', typed: false, delay: 600 },
      { id: 'hero-line-5', typed: false, delay: 0 }
    ];

    var current = 0;

    function processLine() {
      if (current >= lines.length) return;
      var cfg = lines[current];
      var lineEl = document.getElementById(cfg.id);
      if (!lineEl) return;

      lineEl.classList.remove('hero-hidden');

      if (cfg.typed) {
        var typedSpan = lineEl.querySelector('.hero-typed');
        if (typedSpan) {
          var text = typedSpan.getAttribute('data-text');
          typeText(typedSpan, text, function () {
            current++;
            setTimeout(processLine, cfg.delay);
          });
          return;
        }
      }

      current++;
      setTimeout(processLine, cfg.delay);
    }

    function typeText(el, text, cb) {
      var i = 0;
      var speed = 60;
      el.classList.add('typing-cursor');
      function tick() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(tick, speed + Math.random() * 40);
        } else {
          el.classList.remove('typing-cursor');
          if (cb) cb();
        }
      }
      tick();
    }

    setTimeout(processLine, 800);
  }

  /* ---------- Matrix Rain Background ---------- */
  function initMatrixRain() {
    var canvas = document.getElementById('matrix-bg');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var parent = canvas.parentElement;

    function resize() {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var fontSize = 14;
    var columns = Math.floor(canvas.width / fontSize);
    var drops = [];
    for (var i = 0; i < columns; i++) {
      drops[i] = Math.random() * -50;
    }

    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*<>/\\|{}[]~';

    function draw() {
      ctx.fillStyle = 'rgba(13, 17, 23, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(0, 255, 65, 0.12)';
      ctx.font = fontSize + 'px JetBrains Mono, monospace';

      for (var j = 0; j < drops.length; j++) {
        var char = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(char, j * fontSize, drops[j] * fontSize);

        if (drops[j] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[j] = 0;
        }
        drops[j] += 0.3;
      }
    }

    setInterval(draw, 80);
  }

  /* ---------- Back to Top Button ---------- */
  function initBackToTop() {
    // Don't double-create if PaperMod already has one
    var existing = document.querySelector('.top-link');

    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '<span class="btt-prompt">[</span><span class="btt-arrow">\u2191</span> top<span class="btt-prompt">]</span>';
    btn.setAttribute('aria-label', 'Back to top');
    btn.style.display = 'none';
    document.body.appendChild(btn);

    // Hide PaperMod's default button if present
    if (existing) existing.style.display = 'none';

    window.addEventListener('scroll', function () {
      btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 404 Terminal Animation ---------- */
  function init404Animation() {
    var lines = document.querySelectorAll('.terminal-line');
    if (!lines.length) return;
    lines.forEach(function (line, index) {
      line.style.animationDelay = (index * 0.6) + 's';
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initCodeBlocks();
    initCountUp();
    initHeroTerminal();
    initMatrixRain();
    initBackToTop();
    init404Animation();
  });
})();
