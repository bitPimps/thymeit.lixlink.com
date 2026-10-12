/*
 * thymeit.lixlink.com: mobile nav toggle and the season ruler on the home page.
 * No dependencies. (Analytics, website only, is the Google Tag Manager snippet in each page.)
 */

(function () {
  'use strict';

  // ---- Mobile nav ------------------------------------------------------------------------
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var mobile = window.matchMedia('(max-width: 720px)');
    var sync = function () {
      if (mobile.matches) {
        nav.hidden = toggle.getAttribute('aria-expanded') !== 'true';
      } else {
        nav.hidden = false;
      }
    };
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      sync();
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && mobile.matches) {
        toggle.setAttribute('aria-expanded', 'false');
        sync();
      }
    });
    if (mobile.addEventListener) {
      mobile.addEventListener('change', sync);
    } else if (mobile.addListener) {
      mobile.addListener(sync); // Safari < 14
    }
    sync();
  }

  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // ---- Help Center: search and deep links ------------------------------------------------
  var faq = document.getElementById('faq');
  if (faq) {
    var filter = document.getElementById('faq-filter');
    var empty = document.getElementById('faq-empty');
    var status = document.getElementById('faq-status');
    var items = Array.prototype.slice.call(faq.querySelectorAll('details'));
    var sections = Array.prototype.slice.call(faq.querySelectorAll('section'));

    var applyFilter = function () {
      var words = filter ? filter.value.toLowerCase().split(/\s+/).filter(Boolean) : [];
      var shown = 0;
      items.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        var match = words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
        item.hidden = !match;
        // Open matches while searching, so the answer is right there. Only answers the
        // search opened are closed again; ones the reader opened stay open.
        if (words.length > 0 && match && !item.open) {
          item.open = true;
          item.setAttribute('data-search-opened', '');
        } else if ((words.length === 0 || !match) && item.hasAttribute('data-search-opened')) {
          item.open = false;
          item.removeAttribute('data-search-opened');
        }
        if (match) {
          shown++;
        }
      });
      sections.forEach(function (section) {
        section.hidden = !section.querySelector('details:not([hidden])');
      });
      empty.hidden = shown > 0;
      if (status) {
        status.textContent =
          words.length === 0
            ? ''
            : shown === 0
              ? 'No answers match.'
              : shown + (shown === 1 ? ' answer matches.' : ' answers match.');
      }
    };

    // Opens the answer with this id (clearing a search that hides it) and scrolls to it.
    var openAnswer = function (id, scroll) {
      var target = id && document.getElementById(id);
      if (!target || target.tagName !== 'DETAILS') {
        return false;
      }
      if (target.hidden && filter) {
        filter.value = '';
        applyFilter();
      }
      target.open = true;
      target.removeAttribute('data-search-opened');
      if (scroll) {
        target.scrollIntoView();
      }
      return true;
    };

    // A link like faq.html#restore opens that answer.
    openAnswer(window.location.hash.slice(1), false);
    window.addEventListener('hashchange', function () {
      openAnswer(window.location.hash.slice(1), true);
    });
    // In-page links to an answer: also when the hash is already that answer, or a search
    // hides it.
    faq.addEventListener('click', function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (link && openAnswer(link.getAttribute('href').slice(1), true)) {
        event.preventDefault();
        history.replaceState(null, '', link.getAttribute('href'));
      }
    });

    if (filter) {
      filter.addEventListener('input', applyFilter);
    }
  }

  // ---- Season ruler ------------------------------------------------------------------------
  // Windows ThymeIt schedules for each city's ZIP, copied from the app's generated plant
  // library review sheet (docs/content/plant-library-review.md in bitPimps/thymeit).
  // Update these when the library changes.
  var CITIES = {
    minneapolis: { name: 'Minneapolis', zip: '55401', last: 'Apr 23', first: 'Oct 16' },
    chicago: { name: 'Chicago', zip: '60601', last: 'Apr 10', first: 'Nov 5' },
    atlanta: { name: 'Atlanta', zip: '30303', last: 'Mar 24', first: 'Nov 8' },
    seattle: { name: 'Seattle', zip: '98101', last: 'Mar 13', first: 'Nov 17' },
  };

  var ROWS = [
    {
      plant: 'Apple tree',
      job: 'Prune while dormant',
      kind: 'prune',
      windows: {
        minneapolis: 'Feb 26–Apr 2',
        chicago: 'Feb 13–Mar 20',
        atlanta: 'Jan 27–Mar 3',
        seattle: 'Jan 16–Feb 20',
      },
    },
    {
      plant: 'Panicle hydrangea',
      job: 'Prune before growth',
      kind: 'prune',
      windows: {
        minneapolis: 'Mar 12–Apr 9',
        chicago: 'Feb 27–Mar 27',
        atlanta: 'Feb 10–Mar 10',
        seattle: 'Jan 30–Feb 27',
      },
    },
    {
      plant: 'Lilac',
      job: 'Prune right after bloom',
      kind: 'prune',
      estimated: true,
      windows: {
        minneapolis: 'May 14–Jun 4',
        chicago: 'May 1–May 22',
        atlanta: 'Apr 14–May 5',
        seattle: 'Apr 3–Apr 24',
      },
    },
    {
      plant: 'Bigleaf hydrangea',
      job: 'Prune after bloom, before August',
      kind: 'prune',
      estimated: true,
      windows: {
        minneapolis: 'Jun 25–Jul 16',
        chicago: 'Jun 12–Jul 3',
        atlanta: 'May 26–Jun 16',
        seattle: 'May 15–Jun 5',
      },
    },
    {
      plant: 'Oak',
      job: 'Prune in winter only',
      kind: 'prune',
      windows: {
        minneapolis: 'Nov 30–Jan 29',
        chicago: 'Dec 20–Feb 18',
        atlanta: 'Dec 23–Feb 21',
        seattle: 'Jan 1–Mar 2',
      },
    },
    {
      plant: 'Tomato',
      job: 'Transplant outside',
      kind: 'plant',
      windows: {
        minneapolis: 'May 7–May 21',
        chicago: 'Apr 24–May 8',
        atlanta: 'Apr 7–Apr 21',
        seattle: 'Mar 27–Apr 10',
      },
    },
    {
      plant: 'Garlic',
      job: 'Plant cloves',
      kind: 'plant',
      estimated: true,
      windows: {
        minneapolis: 'Oct 16–Nov 6',
        chicago: 'Nov 5–Nov 26',
        atlanta: 'Nov 8–Nov 29',
        seattle: 'Nov 17–Dec 8',
      },
    },
  ];

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var CUMULATIVE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

  // "Feb 13" → fraction of the (non-leap) year at the start of that day.
  function position(text) {
    var parts = text.trim().split(/\s+/);
    var month = MONTHS.indexOf(parts[0]);
    return (CUMULATIVE[month] + Number(parts[1]) - 1) / 365;
  }

  function pct(value) {
    return (value * 100).toFixed(3) + '%';
  }

  var ruler = document.getElementById('ruler');
  var buttons = document.querySelectorAll('.city-picker button');
  if (!ruler || !buttons.length) {
    return;
  }

  // Build the rows once; switching cities only moves the windows.
  var rowEls = ROWS.map(function (row) {
    var el = document.createElement('div');
    el.className = 'ruler-row';
    var label = document.createElement('div');
    label.className = 'ruler-label';
    label.innerHTML = '';
    label.appendChild(document.createTextNode(row.plant));
    var job = document.createElement('span');
    job.textContent = row.job;
    label.appendChild(job);
    var track = document.createElement('div');
    track.className = 'track';
    // Two segments, so a window that crosses New Year (oak) wraps around the ruler.
    var a = document.createElement('div');
    var b = document.createElement('div');
    a.className = b.className = 'window ' + row.kind + (row.estimated ? ' estimated' : '');
    track.appendChild(a);
    track.appendChild(b);
    el.appendChild(label);
    el.appendChild(track);
    ruler.appendChild(el);
    return { row: row, track: track, a: a, b: b, label: label };
  });

  var lastMark = document.getElementById('last-frost');
  var firstMark = document.getElementById('first-frost');

  function render(cityKey) {
    var city = CITIES[cityKey];
    var last = position(city.last);
    var first = position(city.first);
    lastMark.textContent = 'Last frost ' + city.last;
    lastMark.style.left = pct(last);
    firstMark.textContent = 'First frost ' + city.first;
    firstMark.style.left = pct(first);

    rowEls.forEach(function (item) {
      item.track.style.setProperty('--last', pct(last));
      item.track.style.setProperty('--first', pct(first));
      var text = item.row.windows[cityKey];
      var ends = text.split('–');
      var start = position(ends[0]);
      var end = position(ends[1]) + 1 / 365;
      var label =
        item.row.plant +
        ', ' +
        item.row.job.toLowerCase() +
        ': ' +
        text.replace('–', ' to ') +
        (item.row.estimated ? ' (estimated)' : '');
      item.track.setAttribute('role', 'img');
      item.track.setAttribute('aria-label', label);
      item.a.title = item.b.title = text;
      if (end > start) {
        item.a.style.left = pct(start);
        item.a.style.width = pct(end - start);
        item.b.style.left = pct(end);
        item.b.style.width = '0%';
      } else {
        item.a.style.left = pct(start);
        item.a.style.width = pct(1 - start);
        item.b.style.left = '0%';
        item.b.style.width = pct(end);
      }
    });

    buttons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.city === cityKey));
    });

    var summary = document.getElementById('ruler-summary');
    if (summary) {
      summary.textContent =
        city.name + ' (' + city.zip + '): last frost ' + city.last + ', first frost ' + city.first + '.';
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      render(button.dataset.city);
      try {
        localStorage.setItem('thymeit.city', button.dataset.city);
      } catch (error) {
        /* storage unavailable: the choice just isn't remembered */
      }
    });
  });

  var start = 'chicago';
  try {
    var saved = localStorage.getItem('thymeit.city');
    if (saved && CITIES[saved]) {
      start = saved;
    }
  } catch (error) {
    /* ignore */
  }
  render(start);
})();
