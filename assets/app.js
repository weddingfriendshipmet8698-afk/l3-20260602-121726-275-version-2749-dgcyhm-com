function setupMobileMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const previous = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');

  if (slides.length === 0) {
    return;
  }

  let current = 0;
  let timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => showSlide(current + 1), 5000);
  }

  previous?.addEventListener('click', () => {
    showSlide(current - 1);
    restart();
  });

  next?.addEventListener('click', () => {
    showSlide(current + 1);
    restart();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      restart();
    });
  });

  showSlide(0);
  restart();
}

function setupCardFilters() {
  const list = document.querySelector('[data-card-list]');
  const input = document.querySelector('[data-card-search]');
  const yearSelect = document.querySelector('[data-year-filter]');

  if (!list || !input) {
    return;
  }

  const cards = Array.from(list.querySelectorAll('.movie-card'));

  function applyFilters() {
    const keyword = input.value.trim().toLowerCase();
    const year = yearSelect?.value || '';

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const cardYear = card.getAttribute('data-year') || '';
      const matchKeyword = keyword === '' || text.includes(keyword);
      const matchYear = year === '' || cardYear === year;
      card.classList.toggle('is-card-hidden', !matchKeyword || !matchYear);
    });
  }

  input.addEventListener('input', applyFilters);
  yearSelect?.addEventListener('change', applyFilters);
}

async function setupHlsPlayers() {
  const players = Array.from(document.querySelectorAll('.js-hls-player'));
  if (players.length === 0) {
    return;
  }

  let Hls = null;

  async function getHls() {
    if (Hls !== null) {
      return Hls;
    }
    try {
      const module = await import('./hls-dru42stk.js');
      Hls = module.H || module.default || null;
    } catch (error) {
      Hls = null;
    }
    return Hls;
  }

  for (const video of players) {
    const source = video.dataset.videoSrc;
    if (!source) {
      continue;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      const HlsConstructor = await getHls();
      if (HlsConstructor && HlsConstructor.isSupported()) {
        const hls = new HlsConstructor({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
  }
}

function setupPlayButtons() {
  const buttons = Array.from(document.querySelectorAll('[data-play-button]'));
  buttons.forEach((button) => {
    const card = button.closest('.player-card');
    const video = card?.querySelector('video');
    if (!video) {
      return;
    }

    button.addEventListener('click', async () => {
      try {
        await video.play();
        button.classList.add('is-hidden');
      } catch (error) {
        button.textContent = '请再次点击或使用播放器控件播放';
      }
    });

    video.addEventListener('play', () => {
      button.classList.add('is-hidden');
    });
  });
}

function setupGlobalSearch() {
  const input = document.getElementById('globalSearchInput');
  const category = document.getElementById('globalCategoryFilter');
  const button = document.getElementById('globalSearchButton');
  const results = document.getElementById('searchResults');
  const info = document.getElementById('searchResultInfo');

  if (!input || !category || !button || !results || !info || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  function renderCard(movie) {
    const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
<article class="movie-card">
  <a class="poster-shell" href="${movie.href}" aria-label="观看 ${escapeHtml(movie.title)}">
    <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.style.opacity='0';">
    <span class="play-badge">▶</span>
    <span class="year-badge">${movie.year || '精选'}</span>
  </a>
  <div class="card-body">
    <h3><a href="${movie.href}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.description)}</p>
    <div class="meta-row">
      <span>${escapeHtml(movie.region)}</span>
      <span>${escapeHtml(movie.type)}</span>
    </div>
    <div class="tag-row">${tags}<a href="${movie.categoryHref}">${escapeHtml(movie.categoryName)}</a></div>
  </div>
</article>`;
  }

  function doSearch() {
    const keyword = input.value.trim().toLowerCase();
    const categoryName = category.value;
    const matches = window.MOVIE_SEARCH_DATA.filter((movie) => {
      const text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.categoryName,
        movie.tags.join(' '),
        movie.description
      ].join(' ').toLowerCase();
      const keywordMatched = keyword === '' || text.includes(keyword);
      const categoryMatched = categoryName === '' || movie.categoryName === categoryName;
      return keywordMatched && categoryMatched;
    }).slice(0, 120);

    info.textContent = `找到 ${matches.length} 条结果${matches.length === 120 ? '，已显示前 120 条' : ''}`;
    results.innerHTML = matches.map(renderCard).join('');
  }

  button.addEventListener('click', doSearch);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      doSearch();
    }
  });
  category.addEventListener('change', doSearch);

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    input.value = q;
    doSearch();
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

setupMobileMenu();
setupHeroCarousel();
setupCardFilters();
setupHlsPlayers();
setupPlayButtons();
setupGlobalSearch();
