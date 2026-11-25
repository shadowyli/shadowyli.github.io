/* 顶栏品牌字标：金属流动质感（Vue Bits MetallicPaint 的 WebGL 移植版）
   只渲染 .brand 的文字，保持顶栏原有尺寸与可访问文本；不带入场动画。 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var VERT = [
    "#version 300 es",
    "layout(location = 0) in vec2 a_position;",
    "uniform vec2 u_resolution;",
    "uniform float u_imageAspect;",
    "uniform float u_scale;",
    "uniform float u_rotation;",
    "out vec2 v_imageUV;",
    "void main() {",
    "  gl_Position = vec4(a_position, 0.0, 1.0);",
    "  vec2 uv = a_position * 0.5;",
    "  float r = u_rotation * 3.14159265358979323846 / 180.0;",
    "  mat2 turn = mat2(cos(r), sin(r), -sin(r), cos(r));",
    "  vec2 imageBox;",
    "  imageBox.x = min(u_resolution.x / u_imageAspect, u_resolution.y) * u_imageAspect;",
    "  imageBox.y = imageBox.x / u_imageAspect;",
    "  v_imageUV = uv * (u_resolution / imageBox) / u_scale;",
    "  v_imageUV.x *= u_imageAspect;",
    "  v_imageUV = turn * v_imageUV;",
    "  v_imageUV.x /= u_imageAspect;",
    "  v_imageUV += 0.5;",
    "  v_imageUV.y = 1.0 - v_imageUV.y;",
    "}"
  ].join("\n");

  var FRAG = [
    "#version 300 es",
    "precision highp float;",
    "uniform sampler2D u_image;",
    "uniform vec2 u_resolution;",
    "uniform float u_time;",
    "uniform vec4 u_colorBack;",
    "uniform vec4 u_colorTint;",
    "uniform float u_softness;",
    "uniform float u_repetition;",
    "uniform float u_shiftRed;",
    "uniform float u_shiftBlue;",
    "uniform float u_distortion;",
    "uniform float u_contour;",
    "uniform float u_angle;",
    "uniform vec2 u_tilt;",
    "uniform float u_reveal;",
    "uniform float u_light;",
    "in vec2 v_imageUV;",
    "out vec4 fragColor;",
    "#define PI 3.14159265358979323846",
    "vec2 rotate(vec2 uv, float th) { return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv; }",
    "vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }",
    "float snoise(vec2 v) {",
    "  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);",
    "  vec2 i = floor(v + dot(v, C.yy));",
    "  vec2 x0 = v - i + dot(i, C.xx);",
    "  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
    "  vec4 x12 = x0.xyxy + C.xxzz;",
    "  x12.xy -= i1;",
    "  i = mod(i, 289.0);",
    "  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));",
    "  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);",
    "  m = m * m;",
    "  m = m * m;",
    "  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
    "  vec3 h = abs(x) - 0.5;",
    "  vec3 ox = floor(x + 0.5);",
    "  vec3 a0 = x - ox;",
    "  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);",
    "  vec3 g;",
    "  g.x = a0.x * x0.x + h.x * x0.y;",
    "  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
    "  return 130.0 * dot(m, g);",
    "}",
    "float getColorChanges(float c1, float c2, float stripe, vec3 w, float blur, float bump, float tint) {",
    "  float ch = mix(c2, c1, smoothstep(0.0, 2.0 * blur, stripe));",
    "  float border = w[0];",
    "  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));",
    "  bump = smoothstep(0.2, 0.8, bump);",
    "  border = w[0] + 0.4 * (1.0 - bump) * w[1];",
    "  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));",
    "  border = w[0] + 0.5 * (1.0 - bump) * w[1];",
    "  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));",
    "  border = w[0] + w[1];",
    "  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));",
    "  float gradientT = (stripe - w[0] - w[1]) / w[2];",
    "  float gradient = mix(c1, c2, smoothstep(0.0, 1.0, gradientT));",
    "  ch = mix(ch, gradient, smoothstep(border, border + 0.5 * blur, stripe));",
    "  ch = mix(ch, 1.0 - min(1.0, (1.0 - ch) / max(tint, 0.0001)), u_colorTint.a);",
    "  return ch;",
    "}",
    "float getImgFrame(vec2 uv, float th) {",
    "  float frame = 1.0;",
    "  frame *= smoothstep(0.0, th, uv.y);",
    "  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.y);",
    "  frame *= smoothstep(0.0, th, uv.x);",
    "  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.x);",
    "  return frame;",
    "}",
    "float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {",
    "  vec2 texel = 1.0 / vec2(textureSize(tex, 0));",
    "  vec2 r = radius * texel;",
    "  float sum = 4.0 * centerSample;",
    "  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;",
    "  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;",
    "  sum += 2.0 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;",
    "  sum += 2.0 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;",
    "  sum += textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;",
    "  sum += textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;",
    "  sum += textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;",
    "  sum += textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;",
    "  return sum / 16.0;",
    "}",
    "void main() {",
    "  const float firstFrameOffset = 2.8;",
    "  float t = 0.3 * (u_time + firstFrameOffset);",
    "  vec2 uv = v_imageUV;",
    "  vec2 dudx = dFdx(v_imageUV);",
    "  vec2 dudy = dFdy(v_imageUV);",
    "  vec4 img = textureGrad(u_image, uv, dudx, dudy);",
    "  float cycleWidth = u_repetition;",
    "  vec2 rotatedUV = uv - vec2(0.5);",
    "  float angle = (-u_angle + 70.0) * PI / 180.0;",
    "  float cosA = cos(angle);",
    "  float sinA = sin(angle);",
    "  rotatedUV = vec2(rotatedUV.x * cosA - rotatedUV.y * sinA, rotatedUV.x * sinA + rotatedUV.y * cosA) + vec2(0.5);",
    "  float edge = blurEdge3x3(u_image, uv, dudx, dudy, 6.0, img.r);",
    "  edge = pow(edge, 1.6);",
    "  edge *= smoothstep(0.0, 0.4, u_contour);",
    "  float opacity = img.g * getImgFrame(v_imageUV, 0.0);",
    "  float depth = img.r;",
    "  float diagBLtoTR = rotatedUV.x - rotatedUV.y;",
    "  float diagTLtoBR = rotatedUV.x + rotatedUV.y;",
    "  vec3 color1 = mix(vec3(0.98, 0.98, 1.0), vec3(0.9, 0.9, 0.93), u_light);",
    "  vec3 color2 = vec3(0.3, 0.29, 0.3 + 0.1 * smoothstep(0.7, 1.3, diagTLtoBR));",
    "  vec2 gradUV = uv - 0.5 - u_tilt * vec2(0.18, -0.12);",
    "  float dist = length(gradUV + vec2(0.0, 0.2 * diagBLtoTR));",
    "  gradUV = rotate(gradUV, (0.25 - 0.2 * diagBLtoTR) * PI);",
    "  float direction = gradUV.x;",
    "  float bump = pow(1.8 * dist, 1.2);",
    "  bump = 1.0 - bump;",
    "  bump *= pow(uv.y, 0.3);",
    "  float thinStrip1 = 0.12 / cycleWidth * (1.0 - 0.4 * bump);",
    "  float thinStrip2 = 0.07 / cycleWidth * (1.0 + 0.4 * bump);",
    "  float wideStrip = 1.0 - thinStrip1 - thinStrip2;",
    "  float noise = snoise(uv - t);",
    "  edge += (1.0 - edge) * u_distortion * noise;",
    "  direction += diagBLtoTR;",
    "  direction -= 2.0 * noise * diagBLtoTR * (smoothstep(0.0, 1.0, edge) * (1.0 - smoothstep(0.0, 1.0, edge)));",
    "  direction *= mix(1.0, 1.0 - edge, smoothstep(0.5, 1.0, u_contour));",
    "  direction -= 1.7 * edge * smoothstep(0.5, 1.0, u_contour);",
    "  direction += 0.2 * pow(u_contour, 4.0) * (1.0 - smoothstep(0.0, 1.0, edge));",
    "  bump *= clamp(pow(uv.y, 0.1), 0.3, 1.0);",
    "  direction *= 0.1 + (1.1 - edge) * bump;",
    "  direction *= 0.4 + 0.6 * (1.0 - smoothstep(0.5, 1.0, edge));",
    "  direction += 0.18 * (smoothstep(0.1, 0.2, uv.y) * (1.0 - smoothstep(0.2, 0.4, uv.y)));",
    "  direction += 0.03 * (smoothstep(0.1, 0.2, 1.0 - uv.y) * (1.0 - smoothstep(0.2, 0.4, 1.0 - uv.y)));",
    "  direction *= 0.5 + 0.5 * pow(uv.y, 2.0);",
    "  direction *= cycleWidth;",
    "  direction -= t + dot(u_tilt, vec2(0.35, 0.2));",
    "  float colorDispersion = clamp(1.0 - bump, 0.0, 1.0);",
    "  float dispersionRed = colorDispersion;",
    "  dispersionRed += 0.03 * bump * noise;",
    "  dispersionRed += 5.0 * (smoothstep(-0.1, 0.2, uv.y) * (1.0 - smoothstep(0.1, 0.5, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 1.0, bump)));",
    "  dispersionRed -= diagBLtoTR;",
    "  float dispersionBlue = colorDispersion * 1.3;",
    "  dispersionBlue += (smoothstep(0.0, 0.4, uv.y) * (1.0 - smoothstep(0.1, 0.8, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 0.8, bump)));",
    "  dispersionBlue -= 0.2 * edge;",
    "  dispersionRed *= u_shiftRed / 20.0;",
    "  dispersionBlue *= u_shiftBlue / 20.0;",
    "  float softness = 0.05 * u_softness;",
    "  float blur = softness + 0.5 * smoothstep(1.0, 10.0, u_repetition) * smoothstep(0.0, 1.0, edge);",
    "  float rExtraBlur = softness * (0.05 + 0.1 * (u_shiftRed / 20.0) * bump);",
    "  float gExtraBlur = softness * 0.05 / max(0.001, abs(1.0 - diagBLtoTR));",
    "  vec3 w = vec3(thinStrip1 * cycleWidth, thinStrip2 * cycleWidth, wideStrip);",
    "  w[1] -= 0.02 * smoothstep(0.0, 1.0, edge + bump);",
    "  float stripeR = fract(direction + dispersionRed);",
    "  float r = getColorChanges(color1.r, color2.r, stripeR, w, blur + fwidth(stripeR) + rExtraBlur, bump, u_colorTint.r);",
    "  float stripeG = fract(direction);",
    "  float g = getColorChanges(color1.g, color2.g, stripeG, w, blur + fwidth(stripeG) + gExtraBlur, bump, u_colorTint.g);",
    "  float stripeB = fract(direction - dispersionBlue);",
    "  float b = getColorChanges(color1.b, color2.b, stripeB, w, blur + fwidth(stripeB), bump, u_colorTint.b);",
    "  vec3 sheen = mix(vec3(1.0), u_colorTint.rgb, 0.45 * u_colorTint.a);",
    "  r *= sheen.r;",
    "  g *= sheen.g;",
    "  b *= sheen.b;",
    "  float rim = smoothstep(0.78, 1.0, depth) * u_light;",
    "  r *= 1.0 - rim * 0.62;",
    "  g *= 1.0 - rim * 0.62;",
    "  b *= 1.0 - rim * 0.58;",
    "  float pour = u_reveal * 1.25 - 0.1;",
    "  opacity *= smoothstep(1.0 - pour, 1.15 - pour, depth) * smoothstep(0.0, 0.25, u_reveal);",
    "  vec3 color = vec3(r, g, b) * opacity;",
    "  vec3 back = u_colorBack.rgb * u_colorBack.a;",
    "  color += back * (1.0 - opacity);",
    "  opacity += u_colorBack.a * (1.0 - opacity);",
    "  color += 1.0 / 256.0 * (fract(sin(dot(0.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5);",
    "  fragColor = vec4(color, opacity);",
    "}"
  ].join("\n");

  var TINT = [1, 1, 1]; // 参考里的银色铬，不做暖色染色

  function compile(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("brand-metal shader:", gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  function measureText(text, style) {
    var probe = document.createElement("canvas").getContext("2d");
    var font = style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
    probe.font = font;
    if ("letterSpacing" in probe && style.letterSpacing && style.letterSpacing !== "normal") {
      probe.letterSpacing = style.letterSpacing;
    }
    var m = probe.measureText(text);
    var ascent = m.actualBoundingBoxAscent || parseFloat(style.fontSize) * 0.75;
    var descent = m.actualBoundingBoxDescent || parseFloat(style.fontSize) * 0.22;
    return {
      font: font,
      left: m.actualBoundingBoxLeft || 0,
      right: m.actualBoundingBoxRight || m.width,
      ascent: ascent,
      descent: descent,
      letterSpacing: "letterSpacing" in probe ? style.letterSpacing : "normal"
    };
  }

  function drawMask(text, info, cssW, cssH, dpr) {
    var canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.scale(dpr, dpr);
    ctx.font = info.font;
    if ("letterSpacing" in ctx && info.letterSpacing && info.letterSpacing !== "normal") {
      ctx.letterSpacing = info.letterSpacing;
    }
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "alphabetic";
    var pad = (cssW - (info.left + info.right)) / 2;
    ctx.fillText(text, pad + info.left, (cssH - (info.ascent + info.descent)) / 2 + info.ascent);
    return canvas;
  }

  /* 从字形边缘向内解泊松方程，得到“中间凸起”的深度图 */
  function buildDepthTexture(source) {
    var w = source.width;
    var h = source.height;
    var ctx = source.getContext("2d", { willReadFrequently: true });
    var pixels = ctx.getImageData(0, 0, w, h);
    var data = pixels.data;
    var mask = new Uint8Array(w * h);
    for (var i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] > 127 ? 1 : 0;

    var interior = [];
    for (var y = 1; y < h - 1; y++) {
      for (var x = 1; x < w - 1; x++) {
        var idx = y * w + x;
        if (!mask[idx]) continue;
        if (!mask[idx - 1] || !mask[idx + 1] || !mask[idx - w] || !mask[idx + w] ||
            !mask[idx - w - 1] || !mask[idx - w + 1] || !mask[idx + w - 1] || !mask[idx + w + 1]) continue;
        interior.push(idx);
      }
    }

    var field = new Float32Array(w * h);
    var red = [];
    var black = [];
    for (var k = 0; k < interior.length; k++) {
      var p = interior[k];
      if (((p % w) + Math.floor(p / w)) % 2 === 0) red.push(p);
      else black.push(p);
    }
    var relax = function (list) {
      for (var j = 0; j < list.length; j++) {
        var q = list[j];
        var sum = field[q + 1] + field[q - 1] + field[q - w] + field[q + w];
        field[q] = 1.9 * ((0.01 + sum) / 4) - 0.9 * field[q];
      }
    };
    for (var iter = 0; iter < 56; iter++) {
      relax(red);
      relax(black);
    }
    var peak = 0;
    for (var m2 = 0; m2 < interior.length; m2++) {
      var v = field[interior[m2]];
      if (v > peak) peak = v;
    }
    peak = peak || 1;

    var out = ctx.createImageData(w, h);
    for (var n = 0; n < mask.length; n++) {
      var o = n * 4;
      if (mask[n]) {
        out.data[o] = Math.round(255 * (1 - field[n] / peak));
        out.data[o + 1] = 255;
      } else {
        out.data[o] = 255;
        out.data[o + 1] = 0;
      }
      out.data[o + 2] = 255;
      out.data[o + 3] = 255;
    }
    return { data: out, width: w, height: h };
  }

  function mount(brand) {
    var text = (brand.textContent || "").trim();
    if (!text) return;

    var style = getComputedStyle(brand);
    var fontInfo = measureText(text, style);
    var pad = 5;
    var cssW = Math.ceil(fontInfo.left + fontInfo.right + pad * 2);
    var cssH = Math.ceil(fontInfo.ascent + fontInfo.descent + pad * 2);
    /* 小字号需要更高的内部像素密度，元件的边缘/描边才不会被糊成一团 */
    var dpr = Math.min(Math.max(window.devicePixelRatio || 1, 4), 4);

    var canvas = document.createElement("canvas");
    canvas.className = "brand-metal-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";

    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("brand-metal link:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    var uniforms = {};
    var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (var u = 0; u < count; u++) {
      var info = gl.getActiveUniform(program, u);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }

    var vao = gl.createVertexArray();
    var buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(uniforms.u_image, 0);

    var maskCanvas = drawMask(text, fontInfo, cssW, cssH, dpr);
    var depth = buildDepthTexture(maskCanvas);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, depth.data);

    var time = 0;
    var raf = 0;
    var last = 0;
    var visible = true;
    var tilt = { x: 0, y: 0, tx: 0, ty: 0 };

    function draw() {
      gl.useProgram(program);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.u_time, time);
      gl.uniform1f(uniforms.u_imageAspect, depth.width / depth.height);
      gl.uniform1f(uniforms.u_scale, 0.96);
      gl.uniform1f(uniforms.u_rotation, 0);
      gl.uniform4f(uniforms.u_colorBack, 0, 0, 0, 0);
      gl.uniform4f(uniforms.u_colorTint, TINT[0], TINT[1], TINT[2], 1);
      gl.uniform1f(uniforms.u_softness, 0.3);
      gl.uniform1f(uniforms.u_repetition, 1.8);
      gl.uniform1f(uniforms.u_shiftRed, 0.42);
      gl.uniform1f(uniforms.u_shiftBlue, 0.42);
      gl.uniform1f(uniforms.u_distortion, 0.07);
      gl.uniform1f(uniforms.u_contour, 0.9);
      gl.uniform1f(uniforms.u_angle, 70);
      gl.uniform2f(uniforms.u_tilt, tilt.x, tilt.y);
      gl.uniform1f(uniforms.u_reveal, 1);
      gl.uniform1f(uniforms.u_light, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function frame(now) {
      raf = 0;
      if (!visible) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      time += dt * 0.6;
      tilt.x += (tilt.tx - tilt.x) * 0.06;
      tilt.y += (tilt.ty - tilt.y) * 0.06;
      draw();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion || raf || !visible) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    brand.classList.add("is-metal");
    brand.appendChild(canvas);
    draw();
    start();

    canvas.addEventListener("webglcontextlost", function (event) {
      event.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      brand.classList.remove("is-metal");
      canvas.remove();
    });

    brand.addEventListener("pointermove", function (event) {
      var rect = brand.getBoundingClientRect();
      tilt.tx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      tilt.ty = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
    });
    brand.addEventListener("pointerleave", function () {
      tilt.tx = 0;
      tilt.ty = 0;
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries.some(function (entry) { return entry.isIntersecting; });
        if (visible) start();
      }).observe(brand);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        start();
      }
    });
  }

  function boot() {
    var brands = document.querySelectorAll("header .brand");
    Array.prototype.forEach.call(brands, function (brand) {
      try { mount(brand); } catch (error) { console.warn("brand-metal:", error); }
    });
  }

  function ready() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(boot).catch(boot);
    } else {
      boot();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
