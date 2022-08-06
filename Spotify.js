const xhr2 = require('xhr2');
const fs = require('fs');

class Spotify {
    saveJson = false;
    t_getAllPlaylists = null;
    t_getAllTracks = null;
    userData = null;
    allPlaylistsData = null;
    playlistData = null;

    constructor(authentication) {
        this.authentication = authentication;
    }

    async init() {
        await this.GetUser();
        await this.GetAllPlaylists();
    }

    async GetUser() {
        const resp = await this.FetchSpotify(
            'GET',
            'https://api.spotify.com/v1/me'
        );
        if (this.saveJson === true) {
            await fs.writeFileSync(
                './user.json',
                JSON.stringify(resp, null, 4)
            );
        } else {
            this.userData = resp;
        }
        return resp;
    }

    async GetAllPlaylists() {
        const resp = await this.FetchSpotify(
            'GET',
            'https://api.spotify.com/v1/me/playlists'
        );
        // loop through the playlists and get the tracks for each one
        if (this.saveJson === true) {
            // give it a thread to do the work in parallel
            this.t_getAllPlaylists = setInterval(async () => {
                if (resp.items.length > 0) {
                    for (let i = 0; i < resp.items.length; i++) {
                        await this.GetSinglePlaylist(resp.items[i].id);
                    }
                    clearInterval(this.t_getAllPlaylists);
                } else {
                    clearInterval(this.t_getAllPlaylists);
                    this.t_getAllPlaylists = null;
                }
            }, 1000);
            this.t_getAllTracks = setInterval(async () => {
                if (resp.items.length > 0) {
                    for (let i = 0; i < resp.items.length; i++) {
                        await this.GetTracksFromPlaylist(resp.items[i].id);
                    }
                    clearInterval(this.t_getAllTracks);
                } else {
                    clearInterval(this.t_getAllTracks);
                    this.t_getAllTracks = null;
                }
            }, 1000);
            await fs.writeFileSync(
                './playlists.json',
                JSON.stringify(resp, null, 4)
            );
        } else {
            this.allPlaylistsData = resp;
        }
        return resp;
    }

    async GetSinglePlaylist(playlistId) {
        const resp = await this.FetchSpotify(
            'GET',
            'https://api.spotify.com/v1/playlists/' + playlistId
        );
        if (this.saveJson === true) {
            if (resp.tracks.items.length > 0) {
                // make sure the playlists folder exists
                if (!fs.existsSync('./playlists')) {
                    fs.mkdirSync('./playlists');
                }
                // remove illegal characters from the playlist name
                const playlistName = resp.name.replace(/[^a-zA-Z0-9]/g, '_');
                // create a json file with the playlist data
                if (!fs.existsSync(`./playlists/${playlistName}`)) {
                    fs.mkdirSync(`./playlists/${playlistName}`);
                }
                await fs.writeFileSync(
                    './playlists/' + playlistName + '/playlist.json',
                    JSON.stringify(resp, null, 4)
                );
            }
        } else {
            this.playlistData = resp;
        }
        // log success with the playlist name
        console.log(
            `\x1b[32mSuccessfully retrieved playlist ${resp.name}\x1b[0m`
        );
        return resp;
    }

    async GetTracksFromPlaylist(playlistId) {
        const resp = await this.FetchSpotify(
            'GET',
            'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks'
        );
        const playlist = await this.GetSinglePlaylist(playlistId);
        const playlistName = playlist.name.replace(/[^a-zA-Z0-9]/g, '_');
        let retData = [];
        if (resp?.items?.length > 0) {
            // make sure the playlists folder exists
            if (!fs.existsSync('./playlists')) {
                fs.mkdirSync('./playlists');
            }
            // remove illegal characters from the playlist name
            const playlistName = playlist.name.replace(/[^a-zA-Z0-9]/g, '_');
            // create a json file with the playlist data
            if (!fs.existsSync(`./playlists/${playlistName}`)) {
                fs.mkdirSync(`./playlists/${playlistName}`);
            }
            // remove useless info from the response
            for (let i = 0; i < resp.items.length; i++) {
                // delete available_markets
                delete resp.items[i].track.available_markets;
                delete resp.items[i].track.album.available_markets;
                delete resp.items[i].track.artists.available_markets;
                retData.push(resp.items[i].track);
            }
        }
        if (this.saveJson === true) {
            await fs.writeFileSync(
                './playlists/' + playlistName + '/tracks.json',
                JSON.stringify(retData, null, 4)
            );
        }
        console.log(
            `\x1b[32mSuccessfully retrieved trakcs from playlist ${playlist.name}\x1b[0m`
        );
        return retData;
    }

    async StripTrackTitles(playlistId) {
        const tracklist = await this.GetTracksFromPlaylist(playlistId);
        let retData = [];
        for (let i = 0; i < tracklist.length; i++) {
            let name = tracklist[i].name;
            let artists = '';
            // artists
            for (let j = 0; j < tracklist[i].artists.length; j++) {
                artists += `${tracklist[i].artists[j].name} `;
            }
            // combine
            retData.push({ artists: artists, name: name });
        }
        return retData;
    }

    async FetchSpotify(method, url) {
        return new Promise((resolve, reject) => {
            const xhr = new xhr2();
            xhr.open(method, url, true);
            xhr.setRequestHeader('Authorization', this.authentication);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    console.log(
                        `\x1b[31mError: ${xhr.status} ${xhr.statusText}\x1b[0m`
                    );
                    reject(xhr.status);
                }
            };
            xhr.send();
        })
            .then((data) => {
                return data;
            })
            .catch((err) => {
                console.log(`\x1b[31mError: Invalid Token\x1b[0m`);
            });
    }

    async AllowSaveJson() {
        this.saveJson = true;
        return;
    }
}

module.exports = Spotify;
