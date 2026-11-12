
    import * as THREE from "./vendor/three.module.min.js";

    (function () {
      var reel = document.querySelector(".echo-reel");
      if (!reel) return;
      var canvas = reel.querySelector(".echo-canvas");
      var list = reel.querySelector(".echo-list");
      var figures = Array.prototype.slice.call(reel.querySelectorAll(".echo-card"));
      if (!canvas || !figures.length) return;
      if (window.matchMedia("(min-width: 721px)").matches) return;

      var started = false;
      function start() {
        if (started) return;
        started = true;
        try {
          init();
        } catch (error) {
          if (window.console) console.warn("echo reel fallback:", error && error.message);
          reel.classList.remove("is-gl");
        }
      }

      if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });
      window.setTimeout(start, 1800);

      function init() {
        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        var scene = new THREE.Scene();
        var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);

        /* 横向压缩曲线：屏幕 x = X · sin(s / A) / sin(T)。
           中心斜率为 1（原比例最宽），越往两侧卡片越窄、越暗，形成通栏的“宽—窄”节奏。 */
        var T = 1.32;
        var GAP_RATIO = 0.05;

        var vertex = [
          "uniform float uCenter;",
          "uniform vec2 uSize;",
          "uniform float uA;",
          "uniform float uX;",
          "uniform float uT;",
          "varying vec2 vUv;",
          "varying float vShade;",
          "void main() {",
          "  vUv = uv;",
          "  float s = uCenter + position.x * uSize.x;",
          "  float theta = clamp(s / uA, -1.5707, 1.5707);",
          "  float x = uX * sin(theta) / sin(uT);",
          "  float edge = (1.0 - cos(theta)) / (1.0 - cos(uT));",
          "  float y = position.y * uSize.y * (1.0 - 0.16 * clamp(edge, 0.0, 1.0));",
          "  vShade = clamp(edge, 0.0, 1.0);",
          "  gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, 0.0, 1.0);",
          "}"
        ].join("\n");

        var fragment = [
          "uniform sampler2D uMap;",
          "uniform vec2 uSize;",
          "uniform float uRadius;",
          "varying vec2 vUv;",
          "varying float vShade;",
          "float sdRound(vec2 p, vec2 b, float r) {",
          "  vec2 q = abs(p) - b + r;",
          "  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;",
          "}",
          "void main() {",
          "  vec2 p = (vUv - 0.5) * uSize;",
          "  float d = sdRound(p, uSize * 0.5, uRadius);",
          "  float aa = fwidth(d) * 1.2;",
          "  float mask = 1.0 - smoothstep(-aa, aa, d);",
          "  if (mask < 0.004) discard;",
          "  vec4 tex = texture2D(uMap, vUv);",
          "  vec3 color = tex.rgb;",
          "  float alpha = tex.a * mask;",
          "  if (alpha < 0.004) discard;",
          "  float rim = 1.0 - smoothstep(0.0, 1.6, -d);",
          "  color = mix(color, vec3(1.0), rim * 0.14);",
          "  color *= 1.0 - 0.55 * vShade * vShade;",
          "  gl_FragColor = vec4(color, alpha);",
          "}"
        ].join("\n");

        var blank = new THREE.DataTexture(new Uint8Array([22, 21, 26, 255]), 1, 1);
        blank.needsUpdate = true;
        var geometry = new THREE.PlaneGeometry(1, 1, 40, 1);

        var sources = figures.map(function (figure) {
          var img = figure.querySelector("img");
          var ratio = Number(img.getAttribute("width")) / Number(img.getAttribute("height")) || 0.75;
          return {
            figure: figure,
            img: img,
            aspect: Math.min(1.7, Math.max(0.7, ratio)),
            image: null,
            texture: blank,
            meshes: []
          };
        });

        /* 两份副本首尾相接，接缝始终落在可视范围之外 */
        var items = [];
        for (var copy = 0; copy < 2; copy++) {
          sources.forEach(function (source, index) {
            var material = new THREE.ShaderMaterial({
              uniforms: {
                uMap: { value: blank },
                uCenter: { value: 0 },
                uSize: { value: new THREE.Vector2(1, 1) },
                uA: { value: 1 },
                uX: { value: 1 },
                uT: { value: T },
                uRadius: { value: 5 }
              },
              vertexShader: vertex,
              fragmentShader: fragment,
              transparent: true,
              depthTest: false,
              depthWrite: false,
              extensions: { derivatives: true }
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.frustumCulled = false;
            scene.add(mesh);
            source.meshes.push(mesh);
            items.push({ source: source, index: index, mesh: mesh, width: 0, start: 0 });
          });
        }

        var TH = 720;
        var BAND = 200;
        var cardH = 100;
        var gap = 6;
        var total = 1;
        var halfW = 1;
        var A = 1;

        function measure() {
          var arc = 0;
          items.forEach(function (item) {
            item.width = cardH * item.source.aspect * (TH / (TH + BAND));
            item.start = arc;
            arc += item.width + gap;
          });
          total = arc;
        }

        function badgeText(source) {
          var badge = source.figure.querySelector(".social-badge");
          return badge ? badge.textContent.trim() : "";
        }

        function drawTexture(source) {
          if (!source.image) return;
          var tw = Math.round(TH * source.aspect);
          var surface = document.createElement("canvas");
          surface.width = tw;
          surface.height = TH + BAND;
          var g = surface.getContext("2d");
          g.clearRect(0, 0, tw, TH + BAND);
          var iw = source.image.naturalWidth;
          var ih = source.image.naturalHeight;
          var sx = 0;
          var sy = 0;
          var sw = iw;
          var sh = ih;
          if (iw / ih > source.aspect) {
            sw = ih * source.aspect;
            sx = (iw - sw) / 2;
          } else {
            sh = iw / source.aspect;
          }
          g.drawImage(source.image, sx, sy, sw, sh, 0, BAND, tw, TH);

          var label = badgeText(source);
          if (label) {
            var size = 62;
            var family = "px 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif";
            var padX = 24;
            var padY = 16;
            var lineH = Math.round(size * 1.2);
            g.font = "700 " + size + family;
            var maxTextW = tw - padX * 2 - 20;
            var lines = [];
            var current = "";
            for (var ci = 0; ci < label.length; ci++) {
              var test = current + label.charAt(ci);
              if (current && g.measureText(test).width > maxTextW) {
                lines.push(current);
                current = label.charAt(ci);
              } else {
                current = test;
              }
            }
            if (current) lines.push(current);
            if (lines.length > 2) lines = [lines[0], lines.slice(1).join("")];
            var boxH = lines.length * lineH + padY * 2;
            var textW = 0;
            lines.forEach(function (line) { textW = Math.max(textW, g.measureText(line).width); });
            var boxW = Math.min(tw - 20, textW + padX * 2);
            var x = 10;
            var y = BAND - boxH - 8;
            var r = boxH / 2;
            g.beginPath();
            g.moveTo(x + r, y);
            g.arcTo(x + boxW, y, x + boxW, y + boxH, r);
            g.arcTo(x + boxW, y + boxH, x, y + boxH, r);
            g.arcTo(x, y + boxH, x, y, r);
            g.arcTo(x, y, x + boxW, y, r);
            g.closePath();
            g.save();
            g.shadowColor = "rgba(0, 0, 0, 0.6)";
            g.shadowBlur = 12;
            g.shadowOffsetY = 3;
            g.fillStyle = "rgba(8, 7, 10, 0.94)";
            g.fill();
            g.restore();
            g.lineWidth = 2;
            g.strokeStyle = "rgba(255, 255, 255, 0.55)";
            g.stroke();
            g.fillStyle = "#ffffff";
            g.textBaseline = "middle";
            lines.forEach(function (line, index) {
              g.fillText(line, x + padX, y + padY + lineH * (index + 0.5), boxW - padX * 2);
            });
          }

          var texture = new THREE.CanvasTexture(surface);
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          if (source.texture && source.texture !== blank) source.texture.dispose();
          source.texture = texture;
          source.meshes.forEach(function (mesh) { mesh.material.uniforms.uMap.value = texture; });
          /* 贴图到位立即补画，不依赖动画循环（离屏、后台标签页时同样生效） */
          if (ready) { layout(); renderer.render(scene, camera); }
          dirty = true;
        }

        sources.forEach(function (source) {
          var image = new Image();
          image.decoding = "async";
          image.onload = function () {
            source.image = image;
            drawTexture(source);
          };
          image.src = source.img.currentSrc || source.img.src;
        });

        if (list && "MutationObserver" in window) {
          var relabelTimer = 0;
          new MutationObserver(function () {
            window.clearTimeout(relabelTimer);
            relabelTimer = window.setTimeout(function () { sources.forEach(drawTexture); }, 60);
          }).observe(list, { subtree: true, childList: true, characterData: true });
        }

        var dirty = true;
        var ready = false;
        var offset = 0;
        var target = 0;

        function resize() {
          var w = reel.clientWidth;
          var h = reel.clientHeight;
          if (!w || !h) return;
          var center = items.length ? (offset - items[0].start) / (total || 1) : 0;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.setSize(w, h, false);
          camera.left = -w / 2;
          camera.right = w / 2;
          camera.top = h / 2;
          camera.bottom = -h / 2;
          camera.updateProjectionMatrix();
          cardH = Math.round(h * 0.94);
          gap = Math.max(4, Math.round(cardH * GAP_RATIO));
          halfW = w / 2;
          A = halfW / Math.sin(T);          /* 中心斜率 = 1，中卡保持原比例 */
          measure();
          offset = target = center * total + items[0].start;
          /* setSize 会清空画布：立即补画一帧，避免离屏时尺寸变化留下空白 */
          if (ready) { layout(); renderer.render(scene, camera); }
          dirty = true;
        }

        function wrap(value) {
          return ((value % total) + total * 1.5) % total - total / 2;
        }

        function centerOf(item) {
          return item.start + item.width / 2;
        }

        function nearest(value) {
          var best = items[0];
          var bestDistance = Infinity;
          items.forEach(function (item) {
            var distance = Math.abs(wrap(centerOf(item) - value));
            if (distance < bestDistance) { bestDistance = distance; best = item; }
          });
          return best;
        }

        function snapTo(item) {
          target = offset + wrap(centerOf(item) - offset);
          lastInteract = performance.now();
        }

        function layout() {
          var limit = A * 1.5707 + cardH * 1.8;
          items.forEach(function (item) {
            var c = wrap(centerOf(item) - offset);
            var u = item.mesh.material.uniforms;
            u.uCenter.value = c;
            u.uSize.value.set(item.width, cardH);
            u.uA.value = A;
            u.uX.value = halfW;
            u.uRadius.value = Math.max(3, cardH * 0.025);
            item.mesh.visible = Math.abs(c) < limit;
          });
        }

        /* 屏幕坐标反解回弧长，用于点击定位 */
        function pickAt(clientX) {
          var rect = canvas.getBoundingClientRect();
          var x = clientX - rect.left - rect.width / 2;
          var k = Math.max(-1, Math.min(1, x * Math.sin(T) / halfW));
          var s = Math.asin(k) * A;
          var hit = null;
          items.forEach(function (item) {
            var c = wrap(centerOf(item) - offset);
            if (Math.abs(s - c) <= item.width / 2) hit = item;
          });
          return hit;
        }

        var dragging = false;
        var pointerId = null;
        var startX = 0;
        var startOffset = 0;
        var moved = 0;
        var lastX = 0;
        var lastT = 0;
        var velocity = 0;
        var lastInteract = -1e9;
        var wheelTimer = 0;
        var onScreen = true;

        canvas.addEventListener("pointerdown", function (event) {
          if (event.button > 0) return;
          dragging = true;
          pointerId = event.pointerId;
          startX = lastX = event.clientX;
          startOffset = target = offset;
          lastT = performance.now();
          moved = 0;
          velocity = 0;
          reel.classList.add("is-dragging");
          try { canvas.setPointerCapture(event.pointerId); } catch (error) {}
        });

        canvas.addEventListener("pointermove", function (event) {
          if (!dragging) return;
          var dx = event.clientX - startX;
          moved = Math.max(moved, Math.abs(dx));
          offset = target = startOffset - dx;
          var now = performance.now();
          velocity = (event.clientX - lastX) / Math.max(8, now - lastT);
          lastX = event.clientX;
          lastT = now;
          dirty = true;
        });

        function release(event) {
          if (!dragging) return;
          dragging = false;
          reel.classList.remove("is-dragging");
          if (pointerId !== null) {
            try { canvas.releasePointerCapture(pointerId); } catch (error) {}
            pointerId = null;
          }
          if (moved < 6 && event && event.type === "pointerup") {
            var hit = pickAt(event.clientX);
            if (hit) { snapTo(hit); return; }
          }
          snapTo(nearest(offset - velocity * 240));
        }

        canvas.addEventListener("pointerup", release);
        canvas.addEventListener("pointercancel", release);

        canvas.addEventListener("wheel", function (event) {
          if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
          event.preventDefault();
          target += event.deltaX;
          lastInteract = performance.now();
          window.clearTimeout(wheelTimer);
          wheelTimer = window.setTimeout(function () { snapTo(nearest(target)); }, 160);
        }, { passive: false });

        reel.addEventListener("keydown", function (event) {
          var current = nearest(target);
          var index = items.indexOf(current);
          if (event.key === "ArrowLeft") { event.preventDefault(); snapTo(items[(index - 1 + items.length) % items.length]); }
          else if (event.key === "ArrowRight") { event.preventDefault(); snapTo(items[(index + 1) % items.length]); }
        });

        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (entries) {
            onScreen = entries.some(function (entry) { return entry.isIntersecting; });
          }, { threshold: 0 }).observe(reel);
        }

        if ("ResizeObserver" in window) new ResizeObserver(resize).observe(reel);
        else window.addEventListener("resize", resize);

        var last = 0;
        function frame(now) {
          window.requestAnimationFrame(frame);
          if (!onScreen || document.hidden) { last = 0; return; }
          var dt = last ? Math.min(48, now - last) : 16;
          last = now;
          if (!dragging && !reduced && now - lastInteract > 2600) target += dt * 0.028;
          if (!dragging) {
            var delta = target - offset;
            if (Math.abs(delta) > 0.05) {
              offset += reduced ? delta : delta * Math.min(1, dt * 0.012);
              dirty = true;
            } else if (offset !== target) {
              offset = target;
              dirty = true;
            }
          }
          if (!dirty) return;
          dirty = false;
          layout();
          renderer.render(scene, camera);
        }

        resize();
        offset = target = centerOf(items[0]);
        layout();
        renderer.render(scene, camera);
        ready = true;
        reel.classList.add("is-gl");
        window.requestAnimationFrame(frame);
      }
    })();
  