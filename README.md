# Mark content related images
Chrome extension for marking content related images in websites.

## Technologies used
1. React.js
2. Firestore
3. Chrome (extension) API-s

## Purpose
The purpose of this extension is to allow us annotate images on websites that are "relevant" to the content of the website
(i.e. filter out ads/background images).
This data will be further processed to analyze whether images on websites help us determine content of the website (user interests).

## How to install

### Prerequisties:
1. node
2. npm

### Installing into browser:

1. `npm run webpack`
2. Compress `dist` folder that has been created.
3. Enter `chrome://extensions` in the URL bar in the Chrome browser, select `Load unpacked` and select compressed `dist` folder.
