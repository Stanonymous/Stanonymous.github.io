document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('subscribeForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('subscribeEmail').value;
    var msg   = document.getElementById('subscribeMsg');
    var btn   = form.querySelector('.subscribe-btn');

    btn.disabled    = true;
    btn.textContent = 'Subscribing…';

    fetch('https://stanonymous.pythonanywhere.com/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          form.querySelector('.subscribe-row').style.display = 'none';
          msg.textContent = 'You’re subscribed — thanks!';
          msg.className   = 'subscribe-msg subscribe-msg--success';
          msg.hidden      = false;
        } else {
          throw new Error(data.error || 'Something went wrong.');
        }
      })
      .catch(function (err) {
        btn.disabled    = false;
        btn.textContent = 'Subscribe';
        msg.textContent = err.message;
        msg.className   = 'subscribe-msg subscribe-msg--error';
        msg.hidden      = false;
      });
  });
});
