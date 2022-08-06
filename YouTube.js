const xhr2 = require('xhr2');

class YouTube {
    async Search(title, max) {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${max}&q=${title}&key=${process.env.YOUTUBE_API_KEY}`;
        const resp = await this.FetchYouTube(url);
        return resp;
    }

    async GetVideoUrl(title) {
        const resp = await this.Search(title, 1);
        const url = encodeURI(
            'https://www.youtube.com/watch?v=' + resp.items[0].id.videoId
        );
        // async delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(url);
            }, 1000);
        })
            .then((url) => {
                return url;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    async FetchYouTube(url) {
        return new Promise((resolve, reject) => {
            const xhr = new xhr2();
            xhr.open('GET', url, true);
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
                console.log(err);
            });
    }
}

module.exports = YouTube;
