VERA MOBILITY HSE NOTICEBOARD
SCREENSAVER ASSETS
============================

Put screensaver images and videos in this folder.

Examples:

hazard-alert-01.png
hazard-alert-02.jpg
heat-stress-alert.png
safety-campaign.png
minto-hazard-alert.png
southampton-safety-alert.png
safety-video.mp4


IMPORTANT:
Uploading a file here does not automatically make it appear.

After uploading the file, add it to screensaver.json.

EXAMPLE - ALL SITES

{
  "type": "image",
  "file": "./assets/screensaver/hazard-alert-01.png",
  "duration": 20,
  "sites": ["all"]
}


EXAMPLE - MINTO ONLY

{
  "type": "image",
  "file": "./assets/screensaver/minto-hazard-alert.png",
  "duration": 20,
  "sites": ["minto"]
}


AVAILABLE SITES

minto
silverwater
south-melbourne
southampton
all


FILE TYPES

Images:
.png
.jpg
.jpeg

Videos:
.mp4


For video use:

{
  "type": "video",
  "file": "./assets/screensaver/safety-video.mp4",
  "duration": 30,
  "sites": ["all"]
}
