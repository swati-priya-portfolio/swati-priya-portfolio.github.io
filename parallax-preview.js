/* Preview-only parallax tuning. This file is intentionally not on main. */
(function () {
  var presets = [
    [".hero-copy", -34],
    [".section-head", -28],
    [".case-card:nth-child(1)", 34],
    [".case-card:nth-child(2)", 54],
    [".case-card:nth-child(3)", 76],
    [".behind-head", -28],
    [".board:nth-child(1)", 30],
    [".board:nth-child(2)", 48],
    [".board:nth-child(3)", 38],
    [".board:nth-child(4)", 62],
    [".about-grid > .polaroid-col", 44],
    [".about-grid > .story-col", -30],
    [".timeline-item:nth-child(1)", 12],
    [".timeline-item:nth-child(2)", 20],
    [".timeline-item:nth-child(3)", 16],
    [".timeline-item:nth-child(4)", 26],
    [".drives-title", -22],
    [".drives-list", 34],
    [".footer-story", -38]
  ];

  presets.forEach(function (preset) {
    document.querySelectorAll(preset[0]).forEach(function (el) {
      el.setAttribute("data-parallax", String(preset[1]));
      el.setAttribute("data-parallax-layer", "");
    });
  });
})();
