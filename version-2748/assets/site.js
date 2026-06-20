(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(current - 1);
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterPanel = document.querySelector("[data-filter-panel]");

    if (filterPanel) {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var keywordInput = filterPanel.querySelector("[data-filter-keyword]");
        var yearSelect = filterPanel.querySelector("[data-filter-year]");
        var typeSelect = filterPanel.querySelector("[data-filter-type]");
        var genreSelect = filterPanel.querySelector("[data-filter-genre]");
        var resetButton = filterPanel.querySelector("[data-filter-reset]");

        function applyFilter() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var genre = genreSelect ? genreSelect.value : "";

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region")
                ].join(" ").toLowerCase();
                var visible = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    visible = false;
                }
                if (year && card.getAttribute("data-year") !== year) {
                    visible = false;
                }
                if (type && card.getAttribute("data-type") !== type) {
                    visible = false;
                }
                if (genre && card.getAttribute("data-genre").indexOf(genre) === -1) {
                    visible = false;
                }

                card.classList.toggle("hidden-card", !visible);
            });
        }

        [keywordInput, yearSelect, typeSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                filterPanel.reset();
                applyFilter();
            });
        }
    }

    function startPlayer(wrap) {
        var video = wrap.querySelector("video");
        var overlay = wrap.querySelector(".player-overlay");
        var url = wrap.getAttribute("data-video-url");

        if (!video || !url) {
            return;
        }

        if (wrap.getAttribute("data-ready") !== "1") {
            wrap.setAttribute("data-ready", "1");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                wrap.hlsPlayer = hls;
            } else {
                video.src = url;
            }
        }

        wrap.classList.add("is-playing");
        if (overlay) {
            overlay.style.display = "none";
        }

        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (wrap) {
        var overlay = wrap.querySelector(".player-overlay");
        var video = wrap.querySelector("video");

        if (overlay) {
            overlay.addEventListener("click", function () {
                startPlayer(wrap);
            });
        }

        if (video) {
            video.addEventListener("click", function () {
                if (wrap.getAttribute("data-ready") !== "1") {
                    startPlayer(wrap);
                }
            });
        }
    });

    var searchRoot = document.querySelector("[data-search-root]");

    if (searchRoot) {
        var searchInput = document.querySelector("[data-search-input]");
        var searchYear = document.querySelector("[data-search-year]");
        var searchType = document.querySelector("[data-search-type]");
        var searchGenre = document.querySelector("[data-search-genre]");
        var resultGrid = document.querySelector("[data-search-results]");
        var resultNote = document.querySelector("[data-search-note]");
        var params = new URLSearchParams(window.location.search);

        if (searchInput && params.get("q")) {
            searchInput.value = params.get("q");
        }

        function cardTemplate(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");

            return "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + movie.year + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-region=\"" + escapeHtml(movie.region) + "\">" +
                "<a class=\"poster-wrap\" href=\"./movies/" + movie.file + "\">" +
                "<img src=\"./" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                "<span class=\"poster-shade\"></span><span class=\"poster-play\">播放</span></a>" +
                "<div class=\"movie-card-body\"><div class=\"movie-meta-line\"><a href=\"./category/" + movie.category_slug + ".html\">" + escapeHtml(movie.category_name) + "</a><span>" + movie.year + "</span></div>" +
                "<h3><a href=\"./movies/" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                "<p>" + escapeHtml(movie.one_line) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"]/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;"
                }[char];
            });
        }

        function renderSearch(items) {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var year = searchYear ? searchYear.value : "";
            var type = searchType ? searchType.value : "";
            var genre = searchGenre ? searchGenre.value : "";

            var filtered = items.filter(function (movie) {
                var haystack = [movie.title, movie.year, movie.type, movie.genre, movie.region, movie.one_line].join(" ").toLowerCase();
                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }
                if (year && String(movie.year) !== year) {
                    return false;
                }
                if (type && movie.type !== type) {
                    return false;
                }
                if (genre && movie.genre.indexOf(genre) === -1) {
                    return false;
                }
                return true;
            }).slice(0, 160);

            if (resultGrid) {
                resultGrid.innerHTML = filtered.map(cardTemplate).join("");
            }
            if (resultNote) {
                resultNote.textContent = filtered.length ? "为你展示匹配影片" : "没有找到匹配内容";
            }
        }

        fetch("./assets/movies-search.json")
            .then(function (response) {
                return response.json();
            })
            .then(function (items) {
                renderSearch(items);
                [searchInput, searchYear, searchType, searchGenre].forEach(function (control) {
                    if (control) {
                        control.addEventListener("input", function () {
                            renderSearch(items);
                        });
                        control.addEventListener("change", function () {
                            renderSearch(items);
                        });
                    }
                });
            });
    }
})();
