// Theme toggle + landing animations. All motion respects prefers-reduced-motion.
(function () {
  var stored = localStorage.getItem('sentra-site-theme');
  if (stored === 'light') document.documentElement.setAttribute('data-theme', 'light');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    // --- theme toggle ---
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      var sync = function () {
        var light = document.documentElement.getAttribute('data-theme') === 'light';
        btn.textContent = light ? '☾' : '☀';
        btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      };
      btn.addEventListener('click', function () {
        var light = document.documentElement.getAttribute('data-theme') === 'light';
        if (light) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('sentra-site-theme', 'dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
          localStorage.setItem('sentra-site-theme', 'light');
        }
        sync();
      });
      sync();
    }

    // --- scroll reveal ---
    var revealables = document.querySelectorAll('.reveal, .reveal-stagger');
    if (revealables.length && 'IntersectionObserver' in window && !reduced) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.15 });
      revealables.forEach(function (el) { io.observe(el); });
    } else {
      revealables.forEach(function (el) { el.classList.add('in'); });
    }

    // --- animated counters (elements with data-count) ---
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
      var animate = function (el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduced) { el.textContent = target.toLocaleString() + suffix; return; }
        var start = null, dur = 1400;
        var step = function (ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); }
          });
        }, { threshold: 0.4 });
        counters.forEach(function (el) { cio.observe(el); });
      } else {
        counters.forEach(animate);
      }
    }

    // --- hero live-alert feed rotation ---
    var feed = document.getElementById('live-feed');
    if (feed && !reduced) {
      var pool = [
        ['critical', 'Breaking development', 'now · 14 sources converging'],
        ['high', 'Narrative shift detected', '2 min ago · sentiment falling'],
        ['medium', 'New entity connection', '5 min ago · network updated'],
        ['high', 'Broadcast mention spike', '7 min ago · live TV transcription'],
        ['low', 'Daily brief ready', '06:00 · EN / AR'],
        ['medium', 'Trend rising in watch region', '9 min ago · Trends Centre'],
        ['critical', 'Crisis signal — 3 regions', 'now · desktop push sent']
      ];
      var i = 0;
      setInterval(function () {
        if (document.hidden) return;
        var a = pool[i = (i + 1) % pool.length];
        var row = document.createElement('div');
        row.className = 'alert-row';
        row.innerHTML = '<span class="sev ' + a[0] + '"></span><strong>' + a[1] +
          '</strong><div class="meta">' + a[2] + '</div>';
        feed.insertBefore(row, feed.children[1]); // keep the "Live alerts" title first
        while (feed.children.length > 5) feed.removeChild(feed.lastChild);
      }, 3200);
    }

    // --- copilot mock: typing dots, then answer, on loop ---
    var typing = document.getElementById('copilot-typing');
    var answer = document.getElementById('copilot-answer');
    if (typing && answer) {
      if (reduced) {
        typing.style.display = 'none';
        answer.classList.add('show');
      } else {
        var cycle = function () {
          typing.style.display = 'inline-flex';
          answer.classList.remove('show');
          setTimeout(function () {
            typing.style.display = 'none';
            answer.classList.add('show');
          }, 1800);
        };
        cycle();
        setInterval(cycle, 9000);
      }
    }
  });
})();
