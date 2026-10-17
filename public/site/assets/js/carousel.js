(function () {
  var root = document.getElementById('photo-carousel');
  if (!root || typeof CAROUSEL_IMAGES === 'undefined' || !CAROUSEL_IMAGES.length) { if (root) root.style.display = 'none'; return; }
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function caption(file) {
    var m = file.trim().match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.[a-z0-9]+$/i);
    if (!m) return file;
    var name = m[4].replace(/[-_]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    return parseInt(m[3], 10) + ' ' + MONTHS[parseInt(m[2], 10) - 1] + ', ' + m[1] + ' - ' + name;
  }
  var track = root.querySelector('.pc-track');
  var dots = root.querySelector('.pc-dots');
  CAROUSEL_IMAGES.forEach(function (file, i) {
    file = file.trim();
    var s = document.createElement('figure');
    s.className = 'pc-slide';
    s.innerHTML = '<img src="assets/images/carousel/' + file + '" alt="' + caption(file) + '" loading="' + (i ? 'lazy' : 'eager') + '"><figcaption>' + caption(file) + '</figcaption>';
    track.appendChild(s);
    var d = document.createElement('button');
    d.type = 'button'; d.setAttribute('aria-label', 'Show photo ' + (i + 1));
    d.onclick = function () { go(i); restart(); };
    dots.appendChild(d);
  });
  var n = CAROUSEL_IMAGES.length, cur = 0, timer;
  function go(i) {
    cur = (i + n) % n;
    track.style.transform = 'translateX(' + (-100 * cur) + '%)';
    Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle('active', k === cur); });
  }
  function restart() { clearInterval(timer); if (n > 1) timer = setInterval(function () { go(cur + 1); }, 5000); }
  root.querySelector('.pc-prev').onclick = function () { go(cur - 1); restart(); };
  root.querySelector('.pc-next').onclick = function () { go(cur + 1); restart(); };
  root.addEventListener('mouseenter', function () { clearInterval(timer); });
  root.addEventListener('mouseleave', restart);
  if (n < 2) { root.querySelector('.pc-prev').hidden = root.querySelector('.pc-next').hidden = true; dots.hidden = true; }
  go(0); restart();
})();
