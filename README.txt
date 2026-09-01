HSE Noticeboard V3 — easy-update version

NORMAL UPDATES
You should NOT edit index.html for routine content changes.

For South Melbourne, edit:
sites/south-melbourne.json

For Silverwater, edit:
sites/silverwater.json

For company-wide rotating adverts, edit:
adverts.json

WHAT YOU CAN CHANGE IN A SITE JSON FILE
- Site name and subtitle
- Main welcome text
- Current focus message
- TIFR
- Hazard / near miss reporting number
- IMS Committee Minutes date
- URLs for reporting, EAP, minutes, policy, emergency assistance and emergency map
- HSR names / areas
- QR code image paths

QR CODES
Put QR images in the assets folder, e.g.
assets/incident-qr.png

Then in the site JSON use:
"report": "assets/incident-qr.png"

DEPLOY
Upload this whole folder structure to the root of your GitHub HSE-Board repository:
index.html
adverts.json
sites/
assets/

IMPORTANT
Keep the folder names exactly as supplied.

REMOTE UPDATES
Once the board is running on the TV, it reloads itself every 15 minutes.
That means a GitHub update will appear on the TV automatically without anyone touching it.

South Melbourne:
https://verramobilitysafety.github.io/HSE-Board/?site=south-melbourne
