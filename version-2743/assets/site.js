(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNav() {
    var header = $('.site-header');
    var toggle = $('.nav-toggle');
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initHero() {
    var slider = $('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = $all('.hero-slide', slider);
    var dots = $all('.hero-dot', slider);
    var prev = $('[data-hero-prev]', slider);
    var next = $('[data-hero-next]', slider);
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

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(text) {
    return (text || '').toString().toLowerCase().trim();
  }

  function initCards() {
    var searchInputs = $all('[data-card-search]');
    var sortSelects = $all('[data-sort-cards]');
    var chipGroups = $all('[data-filter-group]');

    function applyFilters(root) {
      var grid = root || document;
      var cards = $all('[data-card]', grid);
      var input = $('[data-card-search]', grid) || $('[data-card-search]');
      var query = input ? normalize(input.value) : '';
      var activeChip = $('[data-filter-value].active', grid);
      var filter = activeChip ? normalize(activeChip.getAttribute('data-filter-value')) : '';
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-text'));
        var region = normalize(card.getAttribute('data-region'));
        var matchSearch = !query || text.indexOf(query) !== -1;
        var matchFilter = !filter || filter === 'all' || region.indexOf(filter) !== -1 || text.indexOf(filter) !== -1;
        var visible = matchSearch && matchFilter;
        card.classList.toggle('hidden-card', !visible);
        if (visible) {
          shown += 1;
        }
      });

      $all('[data-empty-state]', grid).forEach(function (empty) {
        empty.classList.toggle('show', shown === 0);
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        applyFilters(input.closest('[data-card-scope]') || document);
      });
    });

    chipGroups.forEach(function (group) {
      $all('[data-filter-value]', group).forEach(function (chip) {
        chip.addEventListener('click', function () {
          $all('[data-filter-value]', group).forEach(function (item) {
            item.classList.remove('active');
          });
          chip.classList.add('active');
          applyFilters(group.closest('[data-card-scope]') || document);
        });
      });
    });

    sortSelects.forEach(function (select) {
      select.addEventListener('change', function () {
        var scope = select.closest('[data-card-scope]') || document;
        var grid = $('[data-card-grid]', scope);
        if (!grid) {
          return;
        }
        var cards = $all('[data-card]', grid);
        var mode = select.value;
        cards.sort(function (a, b) {
          if (mode === 'title') {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
          }
          var ay = parseInt(a.getAttribute('data-year') || '0', 10);
          var by = parseInt(b.getAttribute('data-year') || '0', 10);
          return by - ay;
        });
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
        applyFilters(scope);
      });
    });
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (box) {
      var video = $('video', box);
      var button = $('.player-button', box);
      var message = $('.player-message', box);
      var source = box.getAttribute('data-src');
      var hls = null;
      var attached = false;

      function setMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text || '';
        message.classList.toggle('show', Boolean(text));
      }

      function attach() {
        if (attached || !video || !source) {
          return;
        }
        attached = true;
        setMessage('');
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('视频暂时无法加载');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          setMessage('浏览器暂不支持该播放格式');
        }
      }

      function play() {
        attach();
        if (!video) {
          return;
        }
        if (video.paused) {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              setMessage('播放失败，稍后再试');
            });
          }
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }

      box.addEventListener('click', function (event) {
        if (event.target && (event.target.tagName === 'VIDEO' || event.target.closest('.player-button'))) {
          return;
        }
        play();
      });

      if (video) {
        video.addEventListener('play', function () {
          box.classList.add('playing');
        });
        video.addEventListener('pause', function () {
          box.classList.remove('playing');
        });
        video.addEventListener('ended', function () {
          box.classList.remove('playing');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initCards();
    initPlayers();
  });
}());
