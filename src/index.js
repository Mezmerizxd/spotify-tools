const dotenv = require('dotenv');
const path = require('path');
const Spotify = require('./libs/Spotify');
const YouTube = require('./libs/YouTube.js');
dotenv.config({ path: path.join(__dirname, '../.env') });
const sptfy = new Spotify(process.env.SPOTIFY_AUTH_TOKEN);
const youtube = new YouTube(process.env.YOUTUBE_API_KEY);

setTimeout(async () => {
    // Example 1 ================================================================
    /*
        Basic usage of Spotify class
        It gets User and Playlist data from Spotify API
    */
    /* Allow saving json to file */
    sptfy.AllowSaveJson(); /* Not needed but nice to have */
    // Initialize Spotify
    //await sptfy.init(); /* Gets user data and playlist data */

    /* Log all the collected data found */
    console.log(
        `\x1b[34m======= User Data ========\x1b[0m\n\x1b[33m${JSON.stringify(
            sptfy.userData,
            null,
            2
        )}\x1b[0m\n\x1b[34m======= End ========\x1b[0m`
    );
    console.log(
        `\x1b[34m======= Playlist Data ========\x1b[0m\n\x1b[33m${JSON.stringify(
            sptfy.allPlaylistsData,
            null,
            2
        )}\x1b[0m\n\x1b[34m======= End ========\x1b[0m`
    );
    // ==========================================================================

    // Example 2 ================================================================
    /*
        Basic usage of Spotify class and YouTube class
        It finds the Track name and Artist name from the Spotify playlist
        and then Searches through YouTube and returns the Video Url
    */
    let urls = [];
    /* Get the Tracks from the Playlist with the Playlist Id */
    const songs = await sptfy.StripTrackTitles(
        '68lhzyStrurHSaCxDPisQZ'
    ); /* Enter the Spotify Playlist Id parameter */
    /* Loop through the Tracks and Search for the YouTube url */
    for (let i = 0; i < songs.length; i++) {
        try {
            const video = await youtube.GetVideoUrl(
                `${songs[i].artists}- ${songs[i].name}`,
                1
            );
            console.log(
                `\x1b[32mFound ${songs[i].artists}- ${songs[i].name}: (\x1b[33m${video}\x1b[0m)\x1b[0m`
            );
            urls.push(video);
        } catch (error) {
            console.log(
                `\x1b[31mFailed to find ${songs[i].artists}- ${songs[i].name}\x1b[0m`
            );
        }
    }
    // ==========================================================================
});
