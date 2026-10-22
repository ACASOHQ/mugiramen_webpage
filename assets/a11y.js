/* MUGI accessibility settings: a small button in the corner of every page
   that opens display options (text size, contrast, readable font, link
   underlines, reduced motion). Choices are classes on <html>, styled in
   washi.css, and remembered in this browser. Shared by the public site and
   the admin portal. */
(function () {
  var KEY = 'mugi_a11y';
  var OPTS = ['contrast', 'font', 'links', 'motion', 'focus'];
  var L = {
    vi: { open: 'Tuỳ chọn hiển thị', title: 'Hiển thị dễ đọc', size: 'Cỡ chữ', contrast: 'Tương phản cao', font: 'Phông chữ dễ đọc', links: 'Gạch chân liên kết', motion: 'Giảm chuyển động', focus: 'Viền đậm khi chọn bằng bàn phím', reset: 'Đặt lại', close: 'Đóng', note: 'Lựa chọn được lưu trên trình duyệt này.' },
    en: { open: 'Display options', title: 'Easier reading', size: 'Text size', contrast: 'High contrast', font: 'Readable font', links: 'Underline links', motion: 'Reduce motion', focus: 'Bold keyboard focus', reset: 'Reset', close: 'Close', note: 'Saved in this browser.' },
    ja: { open: '表示の設定', title: '見やすい表示', size: '文字サイズ', contrast: 'ハイコントラスト', font: '読みやすいフォント', links: 'リンクに下線', motion: '動きを減らす', focus: 'キーボード操作の枠を太く', reset: 'リセット', close: '閉じる', note: 'この端末に保存されます。' }
  };
  var state = { size: 0 };
  try { state = JSON.parse(localStorage.getItem(KEY)) || state; } catch (e) {}

  function apply() {
    var c = document.documentElement.classList;
    c.remove('a11y-size-1', 'a11y-size-2');
    if (state.size) c.add('a11y-size-' + state.size);
    OPTS.forEach(function (o) { c.toggle('a11y-' + o, !!state[o]); });
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  apply();

  function lang() { var l = document.documentElement.lang; return L[l] ? l : 'vi'; }

  function build() {
    // data-a11y-inline on <html>: the page supplies its own button (the admin
    // sidebar) and calls window.mugiA11y.toggle(); no floating button.
    var inline = document.documentElement.hasAttribute('data-a11y-inline');
    var root = document.createElement('div');
    root.className = inline ? 'a11y a11y--inline' : 'a11y';
    document.body.appendChild(root);
    var open = false;
    function render() {
      var t = L[lang()];
      root.innerHTML = (inline ? '' :
        '<button type="button" class="a11y-btn" aria-expanded="' + open + '" aria-controls="a11y-panel" aria-label="' + t.open + '" title="' + t.open + '">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="4.5" r="1.8" fill="currentColor" stroke="none"/><path d="M5 8.5l7 1.5 7-1.5M12 10v4.5M12 14.5l-3 6M12 14.5l3 6"/></svg></button>') +
        (open ? '<div class="a11y-panel" id="a11y-panel" role="dialog" aria-label="' + t.title + '">' +
          '<div class="a11y-head"><b>' + t.title + '</b><button type="button" data-a="close" aria-label="' + t.close + '">×</button></div>' +
          '<div class="a11y-row"><span id="a11y-size-l">' + t.size + '</span><div class="a11y-seg" role="group" aria-labelledby="a11y-size-l">' +
            [0, 1, 2].map(function (n) { return '<button type="button" data-size="' + n + '" aria-pressed="' + (state.size === n) + '" style="font-size:' + (13 + n * 3) + 'px">A</button>'; }).join('') +
          '</div></div>' +
          OPTS.map(function (o) { return '<label class="a11y-row"><span>' + t[o] + '</span><input type="checkbox" data-o="' + o + '"' + (state[o] ? ' checked' : '') + '></label>'; }).join('') +
          '<div class="a11y-foot"><small>' + t.note + '</small><button type="button" data-a="reset">' + t.reset + '</button></div>' +
        '</div>' : '');
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('a11y-btn')) { open = !open; render(); if (open) root.querySelector('.a11y-panel button').focus(); return; }
      if (b.dataset.size) { state.size = +b.dataset.size; apply(); render(); root.querySelector('[data-size="' + state.size + '"]').focus(); }
      if (b.dataset.a === 'close') { open = false; render(); refocus(); }
      if (b.dataset.a === 'reset') { state = { size: 0 }; apply(); render(); }
    });
    root.addEventListener('change', function (e) {
      var o = e.target.dataset.o;
      if (o) { state[o] = e.target.checked; apply(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) { open = false; render(); refocus(); }
    });
    var opener = null;
    function refocus() { var el = inline ? opener : root.querySelector('.a11y-btn'); if (el && el.isConnected) el.focus(); }
    window.mugiA11y = {
      toggle: function (from) { opener = from || null; open = !open; render(); if (open) root.querySelector('.a11y-panel button').focus(); },
      // read / replace the choices (the admin's Settings page shows them inline)
      get: function () { return Object.assign({}, state); },
      set: function (next) { state = Object.assign({ size: 0 }, next); apply(); render(); }
    };
    // follow the page's language switch
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    render();
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
