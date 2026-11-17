(function () {
  var grids = document.querySelectorAll("[data-vi-collage]");
  if (!grids.length) return;

  var TILE_RATIO = 9 / 16;

  Array.prototype.forEach.call(grids, function (grid) {
    var tiles = Array.prototype.slice.call(grid.children).filter(function (node) {
      return node.tagName === "FIGURE";
    });
    if (!tiles.length) return;

    function columnCount() {
      var template = window.getComputedStyle(grid).gridTemplateColumns;
      return template.split(" ").filter(Boolean).length || 1;
    }

    function layout() {
      var styles = window.getComputedStyle(grid);
      var gap = parseFloat(styles.columnGap) || 2;
      var rowUnit = parseFloat(styles.getPropertyValue("--vi-row")) || 4;
      var width = grid.clientWidth;
      if (!width) return;

      var columns = columnCount();
      var columnWidth = (width - gap * (columns - 1)) / columns;

      // 让 1 格图与 2×2 大图的总格数正好铺满整列，末尾不留空洞
      var ratio = columns >= 4 ? 0.13 : 0.06;
      var target = Math.max(1, Math.round(tiles.length * ratio));
      var best = Infinity;
      for (var candidate = 0; candidate * 4 <= tiles.length; candidate++) {
        if ((tiles.length + 3 * candidate) % columns !== 0) continue;
        if (best === Infinity || Math.abs(candidate - target) < Math.abs(best - target)) {
          best = candidate;
        }
      }
      var bigCount = best === Infinity ? Math.min(target, Math.floor(tiles.length / 4)) : best;
      var bigIndices = [];
      for (var k = 0; k < bigCount; k++) {
        bigIndices.push(Math.floor(((k + 0.5) * tiles.length) / bigCount));
      }

      // 若总格数仍差一点，用竖版图（1 列 × 2 行）补齐，底部不留缺口
      var used = tiles.length + 3 * bigIndices.length;
      var portraitCount = (columns - (used % columns)) % columns;
      var portraitIndices = [];
      for (var p = 0; p < portraitCount; p++) {
        var slot = Math.floor(((p + 0.6) * tiles.length) / portraitCount);
        while (bigIndices.indexOf(slot) !== -1) slot = (slot + 1) % tiles.length;
        portraitIndices.push(slot);
      }

      tiles.forEach(function (tile, index) {
        var span = bigIndices.indexOf(index) !== -1 ? 2 : 1;
        tile.style.gridColumn = "span " + span;
        var tileWidth = columnWidth * span + gap * (span - 1);
        var tileHeight = tileWidth * TILE_RATIO;
        if (portraitIndices.indexOf(index) !== -1) tileHeight *= 2;
        var rows = Math.max(1, Math.round((tileHeight + gap) / (rowUnit + gap)));
        tile.style.gridRowEnd = "span " + rows;
      });
    }

    window.addEventListener("resize", layout);
    layout();

    if (window.ResizeObserver) {
      var observer = new ResizeObserver(layout);
      observer.observe(grid);
    }
  });
})();
