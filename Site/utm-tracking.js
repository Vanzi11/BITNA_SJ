(function () {
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var STORE_KEY = 'bitna_utm_params';

  function readStored() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function writeStored(data) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
    catch (_) {}
  }

  function collect() {
    var params = new URLSearchParams(window.location.search);
    var data = readStored();
    var changed = false;

    UTM_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) { data[key] = value; changed = true; }
    });

    if (!data.landing_page) { data.landing_page = window.location.href.split('#')[0]; changed = true; }
    if (!data.referrer && document.referrer) { data.referrer = document.referrer; changed = true; }
    if (changed) writeStored(data);
    return data;
  }

  function populateHiddenInputs(data) {
    Object.keys(data).forEach(function (key) {
      var input = document.querySelector('input[name="' + key + '"]');
      if (input && !input.value) input.value = data[key];
    });
  }

  function decorateHotmartLinks(data) {
    document.querySelectorAll('a[href*="pay.hotmart.com"]').forEach(function (link) {
      try {
        var url = new URL(link.href);
        UTM_KEYS.forEach(function (key) {
          if (data[key] && !url.searchParams.has(key)) url.searchParams.set(key, data[key]);
        });
        link.href = url.toString();
      } catch (_) {}
    });
  }

  var data = collect();
  populateHiddenInputs(data);
  decorateHotmartLinks(data);
})();
