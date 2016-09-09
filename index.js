var request = require('request');
var url = require('url');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

util.inherits(Spotify, EventEmitter);
module.exports = Spotify;

function Spotify() {
    this.hostname = 'localhost.spotilocal.com';
    this.port = 4371; // TODO Enable to search for port to Spotify
    this.csrf_token = null;
    this.oauth_token = null;
    this.protocol = 'https';
    this.session = request.jar();
    this._playOrPlaylist = null;
    this._track = null;
    this._playlist = null;
    this._user = null;
}

Spotify.prototype.connect = function(){
    var self = this;
    self._call('/simplecsrf/token.json', {Origin: 'https://open.spotify.com'}, false, false, {}, function(res){
        self.csrf_token = res.token;
        self.get_oauth_token(function(res){
            self.oauth_token = res;
            self.emit('connected');
        });
    });
}

Spotify.prototype.play = function(track){
    var self = this;
    var spotify_uri = 'spotify:track:' + track;
    this._call('/remote/play.json', {Referer: 'https://open.spotify.com/track/' + track}, true, false, {
        uri: spotify_uri,
        context: spotify_uri,
        cors: null,
        ref:'https://open.spotify.com/track/' + track
    }, function(res){
        self._playOrPlaylist = false;
        self._track = track;
        self.emit('playing', res);
    });
}

Spotify.prototype.playlist = function(user, playlist, track){
    var self = this;
    var spotify_uri = 'spotify:track:' + track;
    this._call('/remote/play.json', {Referer: 'https://open.spotify.com/user/' + user + '/playlist/' + playlist}, true, false, {
        uri: spotify_uri,
        context: 'spotify:user:' + user + ':playlist:' + playlist,
        cors: null,
        ref: 'https://open.spotify.com/user/' + user + '/playlist/' + playlist
    }, function(res){
        self._playOrPlaylist = true;
        self._user = user;
        self._playlist = playlist;
        self.emit('playing', res);
    });
}

Spotify.prototype._referer = function(){
    var Referer = 'https://open.spotify.com';

    if(this._playOrPlaylist == false){
        Referer += '/track/' + this._track;
    }else{
        Referer += '/user/' + this._user + '/playlist/' + this._playlist
    }
    return Referer;
}

Spotify.prototype.status = function(){
    var self = this;
    if(this._playOrPlaylist != null){
        this._call('/remote/status.json', {Referer: this._referer()}, true, false, {
            returnafter: 1,
            returnon: DEFAULT_RETURN_ON.join(','),
            cors: null
        }, function(res){
            self.emit('playing', res);
        });
    }else{
        self.emit('playing', {playing: false});
    }
}

Spotify.prototype.pause = function(pause){
    var self = this;
    this._call('/remote/pause.json', {Referer: this._referer()}, true, false, {
        pause: pause,
        cors: null
    }, function(res){
        self.emit('status', {playing: !pause});
    });
}
        
Spotify.prototype.get_oauth_token = function(callback){
    request('http://open.spotify.com/token', {jar: this.session}, function (error, response, body) {
        var jsonObj = JSON.parse(body);
        callback(jsonObj.t);
    });
}

Spotify.prototype._url = function(path){
    return url.format({hostname: this.hostname, port: this.port, protocol: this.protocol, pathname: path});
}

Spotify.prototype._call = function(path, headers, authed, raise_error, params, callback){
    var self = this;

    if(authed){
        params.oauth = self.oauth_token;
        params.csrf = self.csrf_token
    }

    request({
        url: self._url(path),
        headers: headers,
        jar: self.session,
        qs: params,
        rejectUnauthorized: false
    }, function(error, response, body) {
        if(error){
            throw new Error(error);
        }

        if(response.statusCode != 200){
            return self.emit('error', 'Unable to connect to client');
        }

        var jsonObj = JSON.parse(body);

        if(jsonObj.hasOwnProperty('error')){
            return self.emit('error', ERROR_TYPES[jsonObj.error.type]);
        }
        
        return callback(jsonObj);
    });
}

var DEFAULT_RETURN_ON = ['login', 'logout', 'play', 'pause', 'error', 'ap'];

var ERROR_TYPES = {
    4001: 'Unknown method',
    4002: 'Error parsing request',
    4003: 'Unknown service',
    4004: 'Service not responding',
    4102: 'Invalid OAuthToken',
    4103: 'Expired OAuth token',
    4104: 'OAuth token not verified',
    4105: 'Token verification denied, too many requests',
    4106: 'Token verification timeout',
    4107: 'Invalid Csrf token',
    4108: 'OAuth token is invalid for current user',
    4109: 'Invalid Csrf path',
    4110: 'No user logged in',
    4111: 'Invalid scope',
    4112: 'Csrf challenge failed',
    4201: 'Upgrade to premium',
    4202: 'Upgrade to premium or wait',
    4203: 'Billing failed',
    4204: 'Technical error',
    4205: 'Commercial is playing',
    4301: 'Content is unavailable but can be purchased',
    4302: 'Premium only content',
    4303: 'Content unavailable'
};