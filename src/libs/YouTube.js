const xhr2 = require('xhr2');

class YouTube {
    constructor(authentication) {
        this.authentication = authentication;
    }

    async Search(title, max) {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${max}&q=${title}&key=${this.authentication}`;
        const resp = await this.FetchYouTube(url);
        return resp;
    }

    async GetVideoUrl(title) {
        const formattedTitle = title.replace(/[^a-zA-Z0-9]/g, '');
        const resp = await this.Search(formattedTitle, 1);
        const url = encodeURI(
            'https://www.youtube.com/watch?v=' + resp.items[0].id.videoId
        );
        return new Promise((resolve) => {
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
