(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
        document.body.classList.toggle('nav-open', mobileNav.classList.contains('is-open'));
      });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var index = 0;
      var timer;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function schedule() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          schedule();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          schedule();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          schedule();
        });
      }

      show(0);
      schedule();
    });

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      var input = form.querySelector('[data-search-input]');
      var scope = form.closest('main') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

      function applySearch() {
        var query = (input.value || '').trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-keywords') || card.textContent || '').toLowerCase();
          card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
        });
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applySearch();
      });

      if (input) {
        input.addEventListener('input', applySearch);
      }
    });

    document.querySelectorAll('[data-filter-row]').forEach(function (row) {
      var main = row.closest('main') || document;
      var cards = Array.prototype.slice.call(main.querySelectorAll('[data-card]'));
      row.addEventListener('click', function (event) {
        var button = event.target.closest('[data-filter-year]');
        if (!button) {
          return;
        }
        var year = button.getAttribute('data-filter-year');
        row.querySelectorAll('[data-filter-year]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        cards.forEach(function (card) {
          var text = card.getAttribute('data-keywords') || '';
          card.classList.toggle('is-hidden', year !== 'all' && text.indexOf(year) === -1);
        });
      });
    });

    document.querySelectorAll('[data-player]').forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var start = wrap.querySelector('[data-player-start]');
      var hls;

      function loadSource() {
        if (!video || video.dataset.ready === '1') {
          return;
        }
        var source = video.getAttribute('data-src');
        if (!source) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          video.dataset.ready = '1';
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.dataset.ready = '1';
        } else {
          video.src = source;
          video.dataset.ready = '1';
        }
      }

      function play() {
        loadSource();
        if (video) {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
          }
        }
      }

      if (start) {
        start.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });
        video.addEventListener('play', function () {
          wrap.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            wrap.classList.remove('is-playing');
          }
        });
        video.addEventListener('ended', function () {
          wrap.classList.remove('is-playing');
        });
        video.addEventListener('error', function () {
          wrap.classList.remove('is-playing');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
