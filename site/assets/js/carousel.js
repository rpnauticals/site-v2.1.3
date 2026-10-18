/* Home page photo ticker. Photos keep their full shape (no cropping): each is
   scaled to the carousel height and they roll right-to-left in a seamless loop.
   Edit the photo list in carousel_images.js — not this file. */
(function () {
  var root = document.getElementById('photo-carousel');
  if (!root || typeof CAROUSEL_IMAGES === 'undefined' || !CAROUSEL_IMAGES.length) { if (root) root.style.display = 'none'; return; }
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var SPEED = 60; // pixels per second
  function caption(file) {
    var m = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.[a-z0-9]+$/i);
    if (!m) return file;
    var name = m[4].replace(/[-_]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    return parseInt(m[3], 10) + ' ' + MONTHS[parseInt(m[2], 10) - 1] + ', ' + m[1] + ' - ' + name;
  }
  var track = root.querySelector('.pc-track');
  var set = document.createElement('div');
  set.className = 'pc-set';
  CAROUSEL_IMAGES.forEach(function (file) {
    file = file.trim();
    var f = document.createElement('figure');
    f.className = 'pc-slide';
    f.innerHTML = '<img src="assets/images/carousel/' + file + '" alt="' + caption(file) + '"><figcaption>' + caption(file) + '</figcaption>';
    set.appendChild(f);
  });
  track.appendChild(set);
  var imgs = set.querySelectorAll('img'), left = imgs.length;
  function build() {
    Array.prototype.slice.call(track.querySelectorAll('.pc-set')).slice(1).forEach(function (s) { s.remove(); });
    var w = set.getBoundingClientRect().width;
    if (!w) return;
    // Repeat the photos until the strip is at least twice the screen width, so the loop never shows a gap.
    var copies = Math.max(2, Math.ceil((root.clientWidth * 2) / w));
    for (var i = 1; i < copies; i++) { var c = set.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }
    track.style.setProperty('--pc-shift', w + 'px');
    track.style.setProperty('--pc-dur', (w / SPEED) + 's');
  }
  function done() { if (--left <= 0) build(); }
  Array.prototype.forEach.call(imgs, function (img) {
    if (img.complete) done(); else { img.addEventListener('load', done); img.addEventListener('error', done); }
  });
  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 200); });
})();
