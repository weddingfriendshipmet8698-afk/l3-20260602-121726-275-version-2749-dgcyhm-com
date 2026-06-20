(function () {
  function setupMenu() {
    const button = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.mobile-nav');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      const isOpen = button.classList.toggle('is-open');
      nav.classList.toggle('is-open', isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHero() {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const prev = document.querySelector('.hero-prev');
    const next = document.querySelector('.hero-next');

    if (!slides.length) {
      return;
    }

    let current = slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    });

    if (current < 0) {
      current = 0;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function setupFilters() {
    const scope = document.querySelector('.filter-scope');
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const search = document.getElementById('movieSearch');
    const selects = Array.from(document.querySelectorAll('.filter-select'));
    const empty = document.querySelector('.empty-state');

    if (!scope || !cards.length || (!search && !selects.length)) {
      return;
    }

    function valueOf(key) {
      const select = selects.find(function (item) {
        return item.dataset.filter === key;
      });
      return select ? select.value.trim() : '';
    }

    function apply() {
      const keyword = search ? search.value.trim().toLowerCase() : '';
      const type = valueOf('type');
      const year = valueOf('year');
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(' ').toLowerCase();
        const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchType = !type || card.dataset.type === type;
        const matchYear = !year || card.dataset.year === year;
        const shouldShow = matchKeyword && matchType && matchYear;

        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (search) {
      search.addEventListener('input', apply);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
