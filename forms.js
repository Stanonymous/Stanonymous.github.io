/* Newsletter signup + contact form.
   Replaces the near-identical subscribe.js and contact.js. */
(function () {
  'use strict';

  var ENDPOINT = 'https://stanonymous.pythonanywhere.com';

  function setMessage(el, text, kind) {
    el.textContent = text;
    el.className = 'subscribe-msg subscribe-msg--' + kind;
    el.hidden = false;
  }

  /**
   * @param {object} opts
   *   formId   – id of the <form>
   *   msgId    – id of the status <p> (must live OUTSIDE the form when
   *              onSuccess hides the form, or it gets hidden along with it)
   *   path     – endpoint path
   *   fields   – map of payload key -> input element id
   *   busy     – button label while the request is in flight
   *   idle     – button label to restore on failure
   *   success  – message shown when the server accepts
   *   hide     – selector of the element to hide on success
   */
  function wire(opts) {
    var form = document.getElementById(opts.formId);
    var msg = document.getElementById(opts.msgId);
    if (!form || !msg) return;

    var btn = form.querySelector('.subscribe-btn');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var payload = {};
      for (var key in opts.fields) {
        var input = document.getElementById(opts.fields[key]);
        if (!input) return;
        payload[key] = input.value.trim();
      }

      btn.disabled = true;
      btn.textContent = opts.busy;
      msg.hidden = true;

      fetch(ENDPOINT + opts.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          return r.json().catch(function () {
            throw new Error('Sorry — something went wrong. Please try again.');
          });
        })
        .then(function (data) {
          if (!data.ok) throw new Error(data.error || 'Something went wrong.');
          var hide = form.querySelector(opts.hide) || form;
          hide.style.display = 'none';
          setMessage(msg, opts.success, 'success');
        })
        .catch(function (err) {
          btn.disabled = false;
          btn.textContent = opts.idle;
          // A network failure surfaces as "Failed to fetch", which means
          // nothing to a reader — show something actionable instead.
          var text = (err && err.message && err.message !== 'Failed to fetch')
            ? err.message
            : 'Could not reach the server. Please check your connection and try again.';
          setMessage(msg, text, 'error');
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    wire({
      formId: 'subscribeForm',
      msgId: 'subscribeMsg',
      path: '/subscribe',
      fields: { email: 'subscribeEmail' },
      busy: 'Subscribing…',
      idle: 'Subscribe',
      success: 'You’re subscribed — thanks!',
      hide: '.subscribe-row'
    });

    wire({
      formId: 'contactForm',
      msgId: 'contactMsg',
      path: '/contact',
      fields: { name: 'contactName', email: 'contactEmail', message: 'contactMessage' },
      busy: 'Sending…',
      idle: 'Send',
      success: 'Message sent — thanks!',
      hide: null
    });
  });
})();
