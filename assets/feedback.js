/* MUGI feedback: a small button in the bottom-right corner (the display
   options sit bottom-left) that opens a short form. Messages go to the
   site's Netlify function (netlify/functions/feedback.mjs), which passes them
   on to ACASOHQ, the studio that runs this site. The page being viewed is
   sent along. Follows the page's language (vi / en / ja). Styles are in
   washi.css (.fb-*). Not shown inside the admin's preview. */
(function () {
  if (/[?&]preview\b/.test(location.search)) return;
  var ENDPOINT = '/.netlify/functions/feedback';
  var L = {
    vi: { open: 'Góp ý về trang web', title: 'Góp ý về trang web', intro: 'Gửi đến đội ngũ làm trang web này. Đặt bàn hoặc hỏi về món ăn, vui lòng gọi nhà hàng.', type: 'Loại', problem: 'Báo lỗi', request: 'Đề xuất', question: 'Câu hỏi', praise: 'Khen ngợi', message: 'Nội dung', name: 'Tên', email: 'Email', optional: 'không bắt buộc', send: 'Gửi', sending: 'Đang gửi…', cancel: 'Đóng', thanks: 'Cảm ơn bạn! Chúng tôi đã nhận được góp ý.', again: 'Gửi góp ý khác', needMsg: 'Vui lòng nhập nội dung.', badEmail: 'Email này có vẻ chưa đúng.', busy: 'Hiện có quá nhiều góp ý. Vui lòng thử lại sau ít phút.', failed: 'Chưa gửi được. Vui lòng thử lại sau.', close: 'Đóng' },
    en: { open: 'Website feedback', title: 'Website feedback', intro: 'This goes to the team that runs this website. For bookings or questions about food, please call the restaurant.', type: 'Type', problem: 'Problem', request: 'Request', question: 'Question', praise: 'Praise', message: 'Message', name: 'Name', email: 'Email', optional: 'optional', send: 'Send', sending: 'Sending…', cancel: 'Close', thanks: 'Thank you! We got your message.', again: 'Send another', needMsg: 'Please write a message.', badEmail: 'That email doesn’t look right.', busy: 'Too many messages right now. Please try again in a few minutes.', failed: 'It couldn’t be sent. Please try again later.', close: 'Close' },
    ja: { open: 'サイトへのご意見', title: 'サイトへのご意見', intro: 'このサイトを運営するチームに届きます。ご予約や料理についてはお店へお電話ください。', type: '種類', problem: '不具合', request: 'ご要望', question: 'ご質問', praise: 'お褒め', message: '内容', name: 'お名前', email: 'メール', optional: '任意', send: '送信', sending: '送信中…', cancel: '閉じる', thanks: 'ありがとうございます。ご意見を受け付けました。', again: 'もう一度送る', needMsg: '内容をご記入ください。', badEmail: 'メールアドレスをご確認ください。', busy: '現在送信が集中しています。数分後にお試しください。', failed: '送信できませんでした。後ほどお試しください。', close: '閉じる' }
  };
  var TYPES = ['problem', 'request', 'question', 'praise'];
  var ICON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>';
  function lang() { var l = document.documentElement.lang; return L[l] ? l : 'vi'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function build() {
    var root = document.createElement('div');
    root.className = 'fb';
    root.innerHTML = '<button type="button" class="fb-btn" aria-haspopup="dialog">' + ICON + '</button><dialog class="fb-dlg" aria-labelledby="fb-title"></dialog>';
    document.body.appendChild(root);
    var btn = root.firstChild, dlg = root.lastChild;
    // what the guest typed survives a language switch or a failed send
    var form = { type: 'question', message: '', name: '', email: '' };
    var st = { sending: false, done: false, error: '', field: '' };

    function render() {
      var t = L[lang()];
      btn.setAttribute('aria-label', t.open);
      btn.title = t.open;
      dlg.innerHTML =
          '<div class="fb-head"><b id="fb-title">' + t.title + '</b><button type="button" data-a="close" aria-label="' + t.close + '">×</button></div>' +
          (st.done
            ? '<div class="fb-done"><p role="status">' + t.thanks + '</p><button type="button" class="fb-link" data-a="again">' + t.again + '</button></div>'
            : '<form novalidate>' +
                '<p class="fb-intro">' + t.intro + '</p>' +
                '<fieldset class="fb-types"><legend>' + t.type + '</legend>' +
                  TYPES.map(function (k) { return '<label><input type="radio" name="type" value="' + k + '"' + (form.type === k ? ' checked' : '') + '><span>' + t[k] + '</span></label>'; }).join('') +
                '</fieldset>' +
                '<label class="fb-f"><span>' + t.message + '</span><textarea name="message" rows="4" maxlength="5000" required aria-required="true"' + (st.field === 'message' ? ' aria-invalid="true" aria-describedby="fb-err"' : '') + '>' + esc(form.message) + '</textarea></label>' +
                '<div class="fb-row">' +
                  '<label class="fb-f"><span>' + t.name + ' <small>(' + t.optional + ')</small></span><input name="name" autocomplete="name" maxlength="120" value="' + esc(form.name) + '"></label>' +
                  '<label class="fb-f"><span>' + t.email + ' <small>(' + t.optional + ')</small></span><input name="email" type="email" autocomplete="email" maxlength="200" value="' + esc(form.email) + '"' + (st.field === 'email' ? ' aria-invalid="true" aria-describedby="fb-err"' : '') + '></label>' +
                '</div>' +
                // decoy for bots: hidden from people and screen readers
                '<div class="fb-hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>' +
                '<p class="fb-err" id="fb-err" role="alert">' + (st.error ? t[st.error] : '') + '</p>' +
                '<div class="fb-foot"><button type="button" class="fb-link" data-a="close">' + t.cancel + '</button><button type="submit" class="fb-send"' + (st.sending ? ' disabled' : '') + '>' + (st.sending ? t.sending : t.send) + '</button></div>' +
              '</form>');
    }

    function openDlg() {
      render();
      dlg.showModal();
      var f = dlg.querySelector('textarea, [data-a="again"]');
      if (f) f.focus();
    }
    function closeDlg() {
      if (dlg.open) dlg.close();
    }

    root.addEventListener('click', function (e) {
      if (e.target === dlg) { closeDlg(); return; } // click on the backdrop
      var b = e.target.closest('button');
      if (!b) return;
      if (b === btn) openDlg();
      else if (b.dataset.a === 'close') closeDlg();
      else if (b.dataset.a === 'again') { st.done = false; render(); dlg.querySelector('textarea').focus(); }
    });
    root.addEventListener('input', function (e) {
      if (!(e.target.name in form)) return;
      form[e.target.name] = e.target.value;
      // a field's error goes once it is being fixed
      if (st.field === e.target.name) {
        st.error = ''; st.field = '';
        e.target.removeAttribute('aria-invalid'); e.target.removeAttribute('aria-describedby');
        dlg.querySelector('#fb-err').textContent = '';
      }
    });
    root.addEventListener('change', function (e) { if (e.target.name === 'type') form.type = e.target.value; });
    // the native dialog closes on Escape; give focus back to the button
    dlg.addEventListener('close', function () {
      if (st.done) { st.done = false; form.message = ''; }
      st.error = ''; st.field = '';
      btn.focus();
    });

    root.addEventListener('submit', function (e) {
      e.preventDefault();
      if (st.sending) return;
      var f = e.target;
      st.error = ''; st.field = '';
      if (!form.message.trim()) { st.error = 'needMsg'; st.field = 'message'; }
      else if (form.email.trim() && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(form.email.trim())) { st.error = 'badEmail'; st.field = 'email'; }
      if (st.error) { render(); dlg.querySelector('[aria-invalid="true"]').focus(); return; }
      st.sending = true; render();
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 10000);
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: form.type, message: form.message, name: form.name, email: form.email, page: location.pathname + location.hash, website: f.website.value }),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (r.ok && j.ok) { st.done = true; form.message = ''; return; }
          st.error = j.error === 'busy' ? 'busy' : j.field === 'email' ? 'badEmail' : 'failed';
          if (j.field) st.field = j.field;
        });
      }).catch(function () { st.error = 'failed'; }).then(function () {
        clearTimeout(timer);
        st.sending = false; render();
        var focus = dlg.querySelector(st.done ? '.fb-done [data-a="again"]' : st.field ? '[aria-invalid="true"]' : '.fb-send');
        if (focus) focus.focus();
      });
    });

    new MutationObserver(function () { if (!st.sending) render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    render();
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
