/* =============================================================
   main.js — Terminal Theme Interactivity
   ============================================================= */

(function () {
  'use strict';

  /* ---------- Copy Button for Code Blocks ---------- */
  function initCopyButtons() {
    document.querySelectorAll('.highlight').forEach(function (block) {
      // Skip if already processed
      if (block.querySelector('.code-copy-btn')) return;

      // Add language label
      var codeEl = block.querySelector('code[data-lang]');
      if (codeEl) {
        var lang = codeEl.getAttribute('data-lang');
        if (lang) {
          var label = document.createElement('span');
          label.className = 'highlight-lang-label';
          label.textContent = lang;
          block.style.position = 'relative';
          block.appendChild(label);
        }
      }

      // Add copy button
      var btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.textContent = 'COPY';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      block.style.position = 'relative';
      block.appendChild(btn);

      btn.addEventListener('click', function () {
        var pre = block.querySelector('pre');
        if (!pre) return;

        // Get only actual code text, strip line numbers from table-based display
        var codeText = '';
        var codeTable = pre.querySelector('table');
        if (codeTable) {
          // Hugo line-number table: code is in the second td of each row
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
          btn.textContent = 'COPIED!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = 'COPY';
            btn.classList.remove('copied');
          }, 2000);
        });
      });
    });
  }

  /* ---------- Typing Animation for Homepage Bio ---------- */
  function initTypingAnimation() {
    var infoContent = document.querySelector('.first-entry .entry-content');
    if (!infoContent) return;

    // Find the first paragraph — use it as the typing target
    var firstParagraph = infoContent.querySelector('p');
    if (!firstParagraph || firstParagraph.dataset.typed) return;

    var fullText = firstParagraph.textContent;
    firstParagraph.dataset.typed = 'true';
    firstParagraph.textContent = '';
    firstParagraph.classList.add('typing-text');

    var i = 0;
    var speed = 25;

    function type() {
      if (i < fullText.length) {
        firstParagraph.textContent += fullText.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        // Remove cursor once done
        setTimeout(function () {
          firstParagraph.classList.remove('typing-text');
        }, 1500);
      }
    }

    // Small delay before starting
    setTimeout(type, 500);
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
    initCopyButtons();
    initTypingAnimation();
    init404Animation();
  });
})();
