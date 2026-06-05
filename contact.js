document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name    = document.getElementById('contactName').value;
    var email   = document.getElementById('contactEmail').value;
    var message = document.getElementById('contactMessage').value;
    var msg     = document.getElementById('contactMsg');
    var btn     = form.querySelector('.subscribe-btn');

    btn.disabled    = true;
    btn.textContent = 'Sending…';

    fetch('/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: name, email: email, message: message })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          form.style.display = 'none';
          msg.textContent = 'Message sent — thanks!';
          msg.className   = 'subscribe-msg subscribe-msg--success';
          msg.hidden      = false;
        } else {
          throw new Error(data.error || 'Something went wrong.');
        }
      })
      .catch(function (err) {
        btn.disabled    = false;
        btn.textContent = 'Send';
        msg.textContent = err.message;
        msg.className   = 'subscribe-msg subscribe-msg--error';
        msg.hidden      = false;
      });
  });
});
