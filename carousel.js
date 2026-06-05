const track = document.getElementById('carouselTrack');
if (track) {
  const buffer = 3; // fixed clone buffer — works for any visible count

  function getVisible() {
    return window.innerWidth < 640 ? 1 : window.innerWidth < 900 ? 2 : 3;
  }

  const origItems = Array.from(track.children);
  const total = origItems.length;

  // Prepend and append buffer clones once, at startup
  for (let i = origItems.length - 1; i >= origItems.length - buffer; i--) {
    track.insertBefore(origItems[i].cloneNode(true), track.firstChild);
  }
  for (let i = 0; i < buffer; i++) {
    track.appendChild(origItems[i].cloneNode(true));
  }

  const allItems = Array.from(track.children);
  let current = buffer;
  let animating = false;

  function getItemWidth() {
    return track.parentElement.offsetWidth / getVisible();
  }

  function moveTo(index, animate) {
    const w = getItemWidth();
    track.style.transition = animate ? 'transform 0.35s ease' : 'none';
    track.style.transform = `translateX(-${index * w}px)`;
    current = index;
  }

  function setWidths() {
    const w = getItemWidth();
    allItems.forEach(item => item.style.width = w + 'px');
    track.style.width = (w * allItems.length) + 'px';
    moveTo(current, false);
  }

  function step(dir) {
    if (animating) return;
    animating = true;
    moveTo(current + dir, true);
    setTimeout(() => {
      if (current >= buffer + total) moveTo(current - total, false);
      if (current < buffer)          moveTo(current + total, false);
      animating = false;
    }, 350);
  }

  document.querySelector('.carousel-btn--prev').addEventListener('click', () => step(-1));
  document.querySelector('.carousel-btn--next').addEventListener('click', () => step(1));

  window.addEventListener('resize', setWidths);
  setWidths();
}
