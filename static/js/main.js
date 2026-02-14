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

  /* ---------- Stats Count-Up Animation + Progress Bars ---------- */
  function initCountUp() {
    var dashboard = document.querySelector('.stats-dashboard');
    if (!dashboard) return;

    var numbers = dashboard.querySelectorAll('.stat-number[data-target]');
    var progressBars = document.querySelectorAll('.progress-fill[data-width]');

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
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        }
        requestAnimationFrame(tick);
      });

      progressBars.forEach(function (bar) {
        var w = bar.getAttribute('data-width');
        setTimeout(function () {
          bar.style.width = w + '%';
        }, 400);
      });
    }

    // Use IntersectionObserver if available, otherwise animate immediately
    if ('IntersectionObserver' in window) {
      var observed = false;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !observed) {
            observed = true;
            animateAll();
            observer.disconnect();
          }
        });
      }, { threshold: 0.2 });
      observer.observe(dashboard);
    } else {
      animateAll();
    }
  }

  /* ---------- Hero Terminal Typing Animation ---------- */
  function initHeroTerminal() {
    var body = document.getElementById('hero-terminal-body');
    if (!body) return;

    var sequence = [
      { id: 'hero-line-1', typed: true, postDelay: 400 },
      { id: 'hero-line-2', typed: false, postDelay: 600 },
      { id: 'hero-line-3', typed: true, postDelay: 400 },
      { id: 'hero-line-4', typed: false, postDelay: 600 },
      { id: 'hero-line-5', typed: false, postDelay: 0 }
    ];

    var step = 0;

    function typeText(el, text, callback) {
      var i = 0;
      var speed = 60;
      el.textContent = '';
      el.classList.add('typing-cursor');

      function tick() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(tick, speed + Math.random() * 40);
        } else {
          el.classList.remove('typing-cursor');
          callback();
        }
      }
      tick();
    }

    function nextStep() {
      if (step >= sequence.length) return;

      var cfg = sequence[step];
      var lineEl = document.getElementById(cfg.id);
      if (!lineEl) { step++; nextStep(); return; }

      // Reveal the line
      lineEl.classList.remove('hero-hidden');

      if (cfg.typed) {
        var typedSpan = lineEl.querySelector('.hero-typed');
        if (typedSpan && typedSpan.getAttribute('data-text')) {
          typeText(typedSpan, typedSpan.getAttribute('data-text'), function () {
            step++;
            setTimeout(nextStep, cfg.postDelay);
          });
          return;
        }
      }

      // Non-typed line: just show and move on
      step++;
      setTimeout(nextStep, cfg.postDelay);
    }

    // Initial delay so page renders first
    setTimeout(nextStep, 500);
  }

  /* ---------- Matrix Rain Background ---------- */
  function initMatrixRain() {
    var canvas = document.getElementById('matrix-bg');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var hero = canvas.closest('.hero-terminal');
    if (!hero) return;

    var fontSize = 14;
    var columns, drops;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*<>/\\|{}[]~';

    function resize() {
      var w = hero.offsetWidth;
      var h = hero.offsetHeight;
      // Only resize if dimensions actually changed
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      columns = Math.floor(w / fontSize);
      drops = [];
      for (var i = 0; i < columns; i++) {
        drops[i] = Math.random() * -50;
      }
    }

    function draw() {
      if (canvas.width === 0 || canvas.height === 0) {
        resize();
        return;
      }

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

    // Initial sizing with a small delay to let layout settle
    setTimeout(function () {
      resize();
      setInterval(draw, 80);
    }, 100);

    window.addEventListener('resize', resize);
  }

  /* ---------- Back to Top Button ---------- */
  function initBackToTop() {
    var existing = document.querySelector('.top-link');

    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '<span class="btt-prompt">[</span><span class="btt-arrow">\u2191</span> top<span class="btt-prompt">]</span>';
    btn.setAttribute('aria-label', 'Back to top');
    btn.style.display = 'none';
    document.body.appendChild(btn);

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

  /* ---------- Writeup Filter Bar ---------- */
  function initFilters() {
    var filterBar = document.getElementById('filter-bar');
    if (!filterBar) return;

    var cards = document.querySelectorAll('.writeup-card');
    var noResults = document.getElementById('filter-no-results');
    var activePlatform = 'all';
    var activeDifficulty = 'all';

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;

      var filterType = btn.getAttribute('data-filter');
      var value = btn.getAttribute('data-value');

      // Update active state within this row
      btn.parentElement.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      if (filterType === 'platform') activePlatform = value;
      if (filterType === 'difficulty') activeDifficulty = value;

      var visible = 0;
      cards.forEach(function (card) {
        var p = card.getAttribute('data-platform') || '';
        var d = card.getAttribute('data-difficulty') || '';
        var showP = activePlatform === 'all' || p === activePlatform;
        var showD = activeDifficulty === 'all' || d === activeDifficulty;
        if (showP && showD) {
          card.style.display = '';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });

      if (noResults) {
        noResults.style.display = visible === 0 ? 'block' : 'none';
      }
    });
  }

  /* ---------- Share Bar (Single Pages) ---------- */
  function initShareBar() {
    var postHeader = document.querySelector('.post-single .post-header');
    if (!postHeader) return;

    var canonicalEl = document.querySelector('link[rel="canonical"]');
    var pageUrl = canonicalEl ? canonicalEl.getAttribute('href') : window.location.href;
    var pageTitle = document.querySelector('.post-title') ? document.querySelector('.post-title').textContent.trim() : document.title;

    var bar = document.createElement('div');
    bar.className = 'share-bar';

    // Copy link button
    var copyBtn = document.createElement('button');
    copyBtn.className = 'share-btn share-copy';
    copyBtn.innerHTML = '\u2398 copy link';
    copyBtn.setAttribute('aria-label', 'Copy link');
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(pageUrl).then(function () {
        copyBtn.innerHTML = '\u2714 copied!';
        copyBtn.classList.add('copied');
        setTimeout(function () {
          copyBtn.innerHTML = '\u2398 copy link';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });

    // LinkedIn share
    var linkedinBtn = document.createElement('a');
    linkedinBtn.className = 'share-btn share-linkedin';
    linkedinBtn.innerHTML = '\u2197 linkedin';
    linkedinBtn.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(pageUrl);
    linkedinBtn.target = '_blank';
    linkedinBtn.rel = 'noopener noreferrer';
    linkedinBtn.setAttribute('aria-label', 'Share on LinkedIn');

    // Twitter share
    var twitterBtn = document.createElement('a');
    twitterBtn.className = 'share-btn share-twitter';
    twitterBtn.innerHTML = '\u2197 twitter';
    twitterBtn.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(pageTitle) + '&url=' + encodeURIComponent(pageUrl);
    twitterBtn.target = '_blank';
    twitterBtn.rel = 'noopener noreferrer';
    twitterBtn.setAttribute('aria-label', 'Share on Twitter');

    bar.appendChild(copyBtn);
    bar.appendChild(linkedinBtn);
    bar.appendChild(twitterBtn);
    postHeader.appendChild(bar);
  }

  /* ---------- Search Keyboard Shortcut ---------- */
  function initSearchShortcut() {
    // Add "/" hint to search nav link
    var searchLink = document.querySelector('#menu a[href*="/search"]');
    if (searchLink && !searchLink.querySelector('.search-hint')) {
      var hint = document.createElement('kbd');
      hint.className = 'search-hint';
      hint.textContent = '/';
      searchLink.appendChild(hint);
    }

    document.addEventListener('keydown', function (e) {
      // "/" to focus search — only when not already in an input
      if (e.key === '/' && !isInputFocused()) {
        e.preventDefault();
        var searchInput = document.getElementById('searchInput');
        if (searchInput) {
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Navigate to search page
          window.location.href = '/search/';
        }
      }
      // Escape to unfocus and clear
      if (e.key === 'Escape') {
        var active = document.activeElement;
        if (active && active.id === 'searchInput') {
          active.value = '';
          active.blur();
          // Trigger input event so PaperMod clears results
          active.dispatchEvent(new Event('input'));
        }
      }
    });

    function isInputFocused() {
      var el = document.activeElement;
      if (!el) return false;
      var tag = el.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
    }
  }

  /* ---------- Init — each function isolated so one failure can't cascade ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    try { initCodeBlocks(); } catch (e) { console.error('initCodeBlocks:', e); }
    try { initCountUp(); } catch (e) { console.error('initCountUp:', e); }
    try { initHeroTerminal(); } catch (e) { console.error('initHeroTerminal:', e); }
    try { initMatrixRain(); } catch (e) { console.error('initMatrixRain:', e); }
    try { initBackToTop(); } catch (e) { console.error('initBackToTop:', e); }
    try { init404Animation(); } catch (e) { console.error('init404Animation:', e); }
    try { initFilters(); } catch (e) { console.error('initFilters:', e); }
    try { initSearchShortcut(); } catch (e) { console.error('initSearchShortcut:', e); }
    try { initShareBar(); } catch (e) { console.error('initShareBar:', e); }
  });
})();
