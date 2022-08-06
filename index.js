const dotenv = require('dotenv');
const path = require('path');
const Spotify = require('./Spotify.js');
const YouTube = require('./YouTube.js');

dotenv.config({ path: path.join(__dirname, '.env') });

const sptfy = new Spotify(process.env.SPOTIFY_AUTH_TOKEN);

const youtube = new YouTube();

setTimeout(async () => {
    await sptfy.init();

    const songs = await sptfy.StripTrackTitles('3D79kgaDUFdEdMoRGKzYyE');
    let urls = [];
    for (let i = 0; i < songs.length; i++) {
        try {
            const video = await youtube.GetVideoUrl(
                `${songs[i].artists}- ${songs[i].name}`,
                1
            );
            console.log(
                `\x1b[32mFound ${songs[i].artists}- ${songs[i].name}\x1b[0m`
            );
            urls.push(video);
        } catch (error) {
            console.log(
                `\x1b[31mFailed to find ${songs[i].artists}- ${songs[i].name}\x1b[0m`
            );
        }
    }
});
