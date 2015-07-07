# Off the Rip

"Future Proof" method of downloading Soundcloud audio and embedding ID3 tags (title, artist, artwork) within the resulting file.

<img src="http://i.imgur.com/yU3M87w.jpg">

## Installing
```sh
npm i -g otr
```

## Developing
After cloning the repo...
```sh
brew install eyeD3 phantomjs rtmpdump
npm install
npm link # Gives you access to `otr` in your terminal
```

## Usage

### CLI
The CLI has only one command, `dl`. It takes two required parameters, `url` and `dir`.
```sh
otr dl https://soundcloud.com/artist/track ~/Music
```

### Node
```javascript
var otr = require('otr');

otr('https://soundcloud.com/artist/track', '~/Music', function() {
   // Done
});
```

## How it works
* Network traffic on the soundcloud page is monitored and API requests and artwork are intercepted.
* Page information is scraped (Title, Artist, etc)
* Data is sent to Node where ID3 tags including artwork is written to the dist folder

## Disclaimer
This tool is in no way shape or form to be used for downloading copywritten music.

## License
MIT
