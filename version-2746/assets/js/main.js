document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var active = 0;
        var show = function (index) {
            active = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show((active + 1) % slides.length);
            }, 5200);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var searchInput = document.querySelector("#siteSearch");
    if (searchInput && q) {
        searchInput.value = q;
    }

    var filterGrid = document.querySelector("[data-filter-grid]");
    if (filterGrid) {
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll("[data-card]"));
        var input = document.querySelector(".local-search");
        var year = document.querySelector(".year-filter");
        var apply = function () {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase() + " " + (card.getAttribute("data-title") || "").toLowerCase() + " " + (card.getAttribute("data-region") || "").toLowerCase() + " " + (card.getAttribute("data-genre") || "").toLowerCase() + " " + (card.getAttribute("data-category") || "").toLowerCase();
                var byKeyword = keyword === "" || text.indexOf(keyword) !== -1;
                var byYear = selectedYear === "" || card.getAttribute("data-year") === selectedYear;
                card.classList.toggle("is-hidden", !(byKeyword && byYear));
            });
        };
        if (input) {
            input.addEventListener("input", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        apply();
    }
});
