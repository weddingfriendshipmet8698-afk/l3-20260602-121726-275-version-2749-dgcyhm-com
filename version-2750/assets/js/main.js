(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    initHeroSlider();
    initFilters();
    applySearchQuery();
  });

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
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

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    restart();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));

    forms.forEach(function (form) {
      var scopeSelector = form.getAttribute("data-filter-target") || "[data-card]";
      var cards = Array.prototype.slice.call(document.querySelectorAll(scopeSelector));
      var empty = document.querySelector(form.getAttribute("data-empty-target") || "");
      var input = form.querySelector("[data-filter-keyword]");
      var region = form.querySelector("[data-filter-region]");
      var year = form.querySelector("[data-filter-year]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" "));
          var regionText = normalize(card.getAttribute("data-region"));
          var yearText = normalize(card.getAttribute("data-year"));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (regionValue && regionText.indexOf(regionValue) === -1) {
            matched = false;
          }
          if (yearValue && yearText !== yearValue) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visibleCount === 0);
        }
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  }

  function applySearchQuery() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (!query) {
      return;
    }

    var input = document.querySelector("[data-filter-keyword]");
    if (input) {
      input.value = query;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
})();
