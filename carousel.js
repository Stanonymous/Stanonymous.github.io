/* Infinite carousel for the "Recent" strip on audio.html. */
(function () {
  'use strict';

  var track = document.getElementById('carouselTrack');
  if (!track) return;

  var prevBtn = document.querySelector('.carousel-btn--prev');
  var nextBtn = document.querySelector('.carousel-btn--next');
  if (!prevBtn || !nextBtn) return;

  var origItems = Array.prototype.slice.call(track.children);
  var total = origItems.length;
  if (total === 0) return;

  var DURATION = 350;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Clone buffer must never exceed the number of real items, otherwise the
  // clone loops below index past the start of the list.
  var buffer = Math.min(3, total);

  function cloneOf(item) {
    var clone = item.cloneNode(true);
    // Clones are visual filler. Hide them from assistive tech and keep them
    // out of the tab order so the same links aren't announced three times.
    clone.setAttribute('aria-hidden', 'true');
    Array.prototype.forEach.call(clone.querySelectorAll('a'), function (a) {
      a.setAttribute('tabindex', '-1');
    });
    return clone;
  }

  for (var i = total - 1; i >= total - buffer; i--) {
    track.insertBefore(cloneOf(origItems[i]), track.firstChild);
  }
  for (var j = 0; j < buffer; j++) {
    track.appendChild(cloneOf(origItems[j]));
  }

  var allItems = Array.prototype.slice.call(track.children);
  var current = buffer;
  var animating = false;

  function getVisible() {
    return window.innerWidth < 640 ? 1 : window.innerWidth < 900 ? 2 : 3;
  }

  function getItemWidth() {
    return track.parentElement.offsetWidth / getVisible();
  }

  function moveTo(index, animate) {
    var w = getItemWidth();
    track.style.transition = (animate && !reduceMotion) ? 'transform ' + DURATION + 'ms ease' : 'none';
    track.style.transform = 'translateX(-' + (index * w) + 'px)';
    current = index;
  }

  function setWidths() {
    var w = getItemWidth();
    allItems.forEach(function (item) { item.style.width = w + 'px'; });
    track.style.width = (w * allItems.length) + 'px';
    moveTo(current, false);
  }

  function step(dir) {
    if (animating) return;
    animating = true;
    moveTo(current + dir, true);
    window.setTimeout(function () {
      // Jump back into the real items so the strip can scroll forever.
      if (current >= buffer + total) moveTo(current - total, false);
      if (current < buffer) moveTo(current + total, false);
      animating = false;
    }, reduceMotion ? 0 : DURATION);
  }

  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });

  var resizeTimer;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(setWidths, 100);
  });

  setWidths();
})();
