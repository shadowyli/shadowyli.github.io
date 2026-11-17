/* 「一键播放」按钮的触控波纹：以按压点为圆心扩散，450ms 淡出 */
(function () {
  var buttons = document.querySelectorAll(".mobile-play");
  if (!buttons.length) return;

  function addRipple(button, event) {
    var rect = button.getBoundingClientRect();
    var size = rect.width * 2.4;
    var hasPoint = typeof event.clientX === "number" && event.clientY > 0;
    var x = hasPoint ? event.clientX - rect.left : rect.width / 2;
    var y = hasPoint ? event.clientY - rect.top : rect.height / 2;

    var ripple = document.createElement("span");
    ripple.className = "mobile-play-ripple";
    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    button.appendChild(ripple);

    ripple.addEventListener("animationend", function () { ripple.remove(); });
    window.setTimeout(function () { if (ripple.parentNode) ripple.remove(); }, 900);
  }

  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener("pointerdown", function (event) {
      addRipple(button, event);
    });
  });
})();
