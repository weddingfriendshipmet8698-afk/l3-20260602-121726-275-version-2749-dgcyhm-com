(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
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
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
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
                timer = null;
            }
        }

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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
        var input = form.querySelector('[data-filter-input]');
        var list = document.querySelector('[data-filter-list]');
        var selects = Array.prototype.slice.call(form.querySelectorAll('[data-filter-select]'));
        var reset = form.querySelector('[data-filter-reset]');
        var message = null;

        if (!list) {
            return;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().replace(/\s+/g, '');
        }

        function ensureMessage() {
            if (!message) {
                message = document.createElement('div');
                message.className = 'no-results';
                message.textContent = '没有找到匹配的影片';
                list.appendChild(message);
            }
            return message;
        }

        function apply() {
            var keyword = normalize(input ? input.value : '');
            var activeFilters = {};
            selects.forEach(function (select) {
                var key = select.getAttribute('data-filter-select');
                if (key && select.value) {
                    activeFilters[key] = normalize(select.value);
                }
            });

            var visible = 0;
            Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matched = !keyword || haystack.indexOf(keyword) !== -1;

                Object.keys(activeFilters).forEach(function (key) {
                    if (normalize(card.getAttribute('data-' + key)) !== activeFilters[key]) {
                        matched = false;
                    }
                });

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (visible === 0) {
                ensureMessage().style.display = 'block';
            } else if (message) {
                message.style.display = 'none';
            }
        }

        if (input) {
            input.addEventListener('input', apply);
            var params = new URLSearchParams(window.location.search);
            if (params.get('q')) {
                input.value = params.get('q');
            }
        }

        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                selects.forEach(function (select) {
                    select.value = '';
                });
                apply();
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });

        apply();
    });

    function attachPlayer(frame) {
        var video = frame.querySelector('video');
        var button = frame.querySelector('[data-play-button]');
        var loading = frame.querySelector('[data-loading]');
        var errorBox = frame.querySelector('[data-error]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var ready = false;

        function setLoading(state) {
            frame.classList.toggle('is-loading', state);
            if (loading) {
                loading.style.display = state ? 'block' : '';
            }
        }

        function showError(message) {
            if (errorBox) {
                errorBox.textContent = message;
                errorBox.classList.add('is-visible');
            }
        }

        function prepare() {
            if (!video || !stream || ready) {
                return Promise.resolve();
            }

            setLoading(true);

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                ready = true;
                setLoading(false);
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                video._hls = hls;
                hls.loadSource(stream);
                hls.attachMedia(video);
                ready = true;
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setLoading(false);
                });
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setLoading(false);
                        showError('播放失败，请稍后再试');
                    }
                });
                return Promise.resolve();
            }

            setLoading(false);
            return Promise.reject(new Error('播放失败，请稍后再试'));
        }

        function play() {
            prepare().then(function () {
                return video.play();
            }).then(function () {
                frame.classList.add('is-playing');
            }).catch(function () {
                showError('播放失败，请稍后再试');
            });
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                frame.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                frame.classList.remove('is-playing');
            });
            video.addEventListener('canplay', function () {
                setLoading(false);
            });
        }
    }

    document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();
