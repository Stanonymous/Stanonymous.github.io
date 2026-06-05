#!/usr/bin/env python3
"""
Portfolio dev server.
Serves static files exactly like `python3 -m http.server`,
plus handles:
  POST /subscribe → appends to subscribers.csv
  POST /contact   → saves to messages.csv + emails stan@stanalcorn.com

To enable email sending, fill in the SMTP config below.
Gmail users: create an App Password at myaccount.google.com/apppasswords
and set SMTP_USER to your Gmail address and SMTP_PASS to the app password.

Usage: python3 server.py
"""

import csv
import json
import os
import smtplib
from datetime import datetime
from email.message import EmailMessage
from http.server import HTTPServer, SimpleHTTPRequestHandler

# ── Email config ─────────────────────────────────────────────────────────────
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = ""          # e.g. "yourname@gmail.com"
SMTP_PASS = ""          # Gmail App Password (16 chars, no spaces)
CONTACT_TO = "stan@stanalcorn.com"
# ─────────────────────────────────────────────────────────────────────────────


def send_contact_email(name, email, message):
    if not SMTP_USER or not SMTP_PASS:
        return  # not configured — silently skip, message already saved to CSV
    msg = EmailMessage()
    msg["Subject"] = f"Portfolio contact from {name}"
    msg["From"]    = SMTP_USER
    msg["To"]      = CONTACT_TO
    msg["Reply-To"] = email
    msg.set_content(f"Name: {name}\nEmail: {email}\n\n{message}")
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
        s.starttls()
        s.login(SMTP_USER, SMTP_PASS)
        s.send_message(msg)


class PortfolioHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/subscribe":
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = json.loads(self.rfile.read(length))
                email = body.get("email", "").strip().lower()
            except Exception:
                self._json(400, {"error": "Bad request."})
                return

            if not email or "@" not in email or "." not in email.split("@")[-1]:
                self._json(400, {"error": "Please enter a valid email address."})
                return

            csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "subscribers.csv")
            new_file = not os.path.exists(csv_path)
            with open(csv_path, "a", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                if new_file:
                    w.writerow(["email", "subscribed_at"])
                w.writerow([email, datetime.now().strftime("%Y-%m-%d %H:%M:%S")])

            self._json(200, {"ok": True})

        elif self.path == "/contact":
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = json.loads(self.rfile.read(length))
                name    = body.get("name", "").strip()
                email   = body.get("email", "").strip()
                message = body.get("message", "").strip()
            except Exception:
                self._json(400, {"error": "Bad request."})
                return

            if not name or not email or not message:
                self._json(400, {"error": "Please fill in all fields."})
                return
            if "@" not in email or "." not in email.split("@")[-1]:
                self._json(400, {"error": "Please enter a valid email address."})
                return

            # Always save to CSV
            csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "messages.csv")
            new_file = not os.path.exists(csv_path)
            with open(csv_path, "a", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                if new_file:
                    w.writerow(["name", "email", "message", "sent_at"])
                w.writerow([name, email, message, datetime.now().strftime("%Y-%m-%d %H:%M:%S")])

            # Attempt to send email (fails silently if SMTP not configured)
            try:
                send_contact_email(name, email, message)
            except Exception as e:
                print(f"Email send failed: {e}")

            self._json(200, {"ok": True})

        else:
            self.send_error(404)

    def _json(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        if args and str(args[1]) not in ("200", "304"):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = 3000
    server = HTTPServer(("", port), PortfolioHandler)
    print(f"Serving at http://localhost:{port}  (Ctrl-C to stop)")
    server.serve_forever()
