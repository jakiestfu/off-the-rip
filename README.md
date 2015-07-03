# Soundcloud Downloader

## Installation
```sh
brew install eyeD3 phantomjs
npm install
```

## Usage

### CLI
```sh
sc dl https://soundcloud.com/artist/track ~/Music
```

### Node
```javascript
var scdl = require('scdl');

scdl('https://soundcloud.com/artist/track', '~/Music', function() {
   // Done
});
```

## How it works
* Network traffic on the soundcloud page is monitored and API requests and artwork are intercepted.
* Page information is scraped (Title, Artist, etc)
* Data is sent to Node where ID3 tags including artwork is written to the dist folder

