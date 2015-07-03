# Soundcloud Downloader

## Dependencies
* Phantom.js
* id3lib

```sh
brew install eyeD3 phantomjs
npm install
```

## Usage
```sh
scdl https://soundcloud.com/brysontiller/bryson-tiller-ease-feat-wuntayk-timmy-prod-by-syk-sense ~/Music
```

```javascript
var scdl = require('scdl');

scdl('https://soundcloud.com/brysontiller/bryson-tiller-ease-feat-wuntayk-timmy-prod-by-syk-sense', '~/Music', function() {
   // Dene
});
```
