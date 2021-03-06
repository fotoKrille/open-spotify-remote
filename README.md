# Open Spotify Remote
  [![Code Climate][code-climate-image]][code-climate-url]
  [![Issue Count][issue-count-image]][issue-count-url]
  

Connect your [Node.js](https://nodejs.org) app to Spotify via [open.spotify.com](https://open.spotify.com)

## Getting Started

Just install the module and try it out with some exampels :)
You need to have Spotify installed on the same computer where this script is running from.

### Installing

```bash
$ npm install open-spotify-remote --save
```

### Example code

```js
var osr = require('open-spotify-remote');

var spotify = new osr();

spotify.connect();

spotify.on('connected', function() {
    // Play one song over and over
    //play(track)
    spotify.play("1LVQ5LsVHxpgnY7VAyLjCR");
    
    // Play a album
    //playlist(user, playlist, track)
    spotify.playlist("spotifydiscover", "67oFw1dAUZhGve2hPv5kgr", "7tJWarixh0rqI31ob9J7Kw");
});

spotify.on('error', function(error) {
    console.log(error);
});

spotify.on('playing', function(play) {
    console.log(play);
});

spotify.on('status', function(status) {
    console.log(status);
});

setInterval(function () {
    spotify.status();
}, 2000);

// Use this to pause or unpause
spotify.pause(true);
```

## Running the tests

No test avalible. :(

## TODO
* Auto connect to different port.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Krister Johansson** - *Initial work* - [fotoKrille](https://github.com/fotoKrille)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
[chrippa](https://github.com/chrippa)

[code-climate-image]: https://codeclimate.com/github/fotoKrille/open-spotify-remote/badges/gpa.svg
[code-climate-url]:https://codeclimate.com/github/fotoKrille/open-spotify-remote
[issue-count-image]: https://codeclimate.com/github/fotoKrille/open-spotify-remote/badges/issue_count.svg
[issue-count-url]: https://codeclimate.com/github/fotoKrille/open-spotify-remote
