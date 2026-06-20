(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    panels.forEach(function (panel) {
      var section = panel.closest('section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
      }
      var search = panel.querySelector('[data-movie-search]');
      var region = panel.querySelector('[data-region-filter]');
      var type = panel.querySelector('[data-type-filter]');
      var year = panel.querySelector('[data-year-filter]');
      var empty = section.querySelector('[data-empty-state]');

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (regionValue && card.getAttribute('data-region') !== regionValue) {
            matched = false;
          }
          if (typeValue && card.getAttribute('data-type') !== typeValue) {
            matched = false;
          }
          if (yearValue && card.getAttribute('data-year') !== yearValue) {
            matched = false;
          }
          card.classList.toggle('hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [search, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-start');
      var stream = shell.getAttribute('data-stream');
      var hlsInstance = null;

      function attach() {
        if (!video || !stream || shell.getAttribute('data-ready') === '1') {
          return Promise.resolve();
        }
        shell.setAttribute('data-ready', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function () {
              resolve();
            });
          });
        }
        video.src = stream;
        return Promise.resolve();
      }

      function play() {
        attach().then(function () {
          var request = video.play();
          shell.classList.add('playing');
          if (request && typeof request.catch === 'function') {
            request.catch(function () {
              shell.classList.remove('playing');
            });
          }
        });
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            shell.classList.remove('playing');
          }
        });
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
