(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFiltering() {
        var input = document.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        if (!cards.length) {
            return;
        }
        var activeFilter = '';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var keyword = input ? normalize(input.value) : '';
            var filter = normalize(activeFilter);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedFilter = !filter || text.indexOf(filter) !== -1;
                card.classList.toggle('is-hidden-card', !(matchedKeyword && matchedFilter));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                activeFilter = chip.getAttribute('data-filter') || '';
                apply();
            });
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (wrap) {
            var video = wrap.querySelector('video');
            var overlay = wrap.querySelector('[data-play-button]');
            if (!video) {
                return;
            }
            var streamUrl = video.getAttribute('data-stream');
            var hlsObject = null;
            var initialized = false;

            function init() {
                if (initialized || !streamUrl) {
                    return;
                }
                initialized = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsObject = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsObject.loadSource(streamUrl);
                    hlsObject.attachMedia(video);
                    return;
                }
                video.src = streamUrl;
            }

            function play() {
                init();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsObject) {
                    hlsObject.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFiltering();
        setupPlayers();
    });
})();
