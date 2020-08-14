// ==UserScript==
// @name         Feedly watch later
// @namespace    https://geraintwhite.co.uk/
// @version      0.1
// @description  Add Watch Later button for YouTube videos in Feedly
// @author       Geraint White
// @match        https://feedly.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const OAUTH2_CLIENT_ID = '846857736261-u84r4qvoakrncsfme16j3cdrht193ep0.apps.googleusercontent.com';
    const OAUTH2_SCOPES = [
        'https://www.googleapis.com/auth/youtube'
    ];

    let cachedAuthResult;

    window.googleApiClientReady = () => {
        console.log('googleApiClientReady');
        gapi.auth.init(() => {
            console.log('gapi.auth.init');
            window.setTimeout(checkAuth, 1000);
        });
    }

    function checkAuth() {
        console.log('checkAuth');
        gapi.auth.authorize({
            client_id: OAUTH2_CLIENT_ID,
            scope: OAUTH2_SCOPES,
            immediate: true
        }, (authResult) => handleAuthResult(authResult));
    }

    function handleAuthResult(authResult, cb) {
        console.log('handleAuthResult', authResult);

        cachedAuthResult = authResult;

        if (authResult && !authResult.error) {
            gapi.client.load('youtube', 'v3', () => {
                console.log('gapi.client.load');

                if (cb) {
                    cb(authResult);
                }
            });
        }
    }

    const addVideoToPlaylist = (id, cb = console.log) => {
        const request = gapi.client.youtube.playlistItems.insert({
            part: 'snippet',
            resource: {
                snippet: {
                    playlistId: 'WL',
                    resourceId: {
                        videoId: id,
                        kind: 'youtube#video'
                    }
                }
            }
        });

        request.execute(cb);
    };

    const addToWatchLater = (id, e) => {
        if (cachedAuthResult && !cachedAuthResult.error) {
            addVideoToPlaylist(id);
        } else {
            gapi.auth.authorize({
                client_id: OAUTH2_CLIENT_ID,
                scope: OAUTH2_SCOPES,
                immediate: false
            }, (authResult) => handleAuthResult(authResult, () => addVideoToPlaylist(id)));
        }

        if (e) {
            e.stopPropagation();
        }
    };

    const addAllToWatchLater = (ids, e) => {
        if (!ids.length) {
            return;
        }

        if (cachedAuthResult && !cachedAuthResult.error) {
            const [id, ...rest] = ids;
            addVideoToPlaylist(id, () => addAllToWatchLater(rest));
        } else {
            gapi.auth.authorize({
                client_id: OAUTH2_CLIENT_ID,
                scope: OAUTH2_SCOPES,
                immediate: false
            }, (authResult) => handleAuthResult(authResult, () => addAllToWatchLater(ids)));
        }

        if (e) {
            e.stopPropagation();
        }
    };

    const getVideoId = (url) => url.split('?v=')[1];

    const interval = setInterval(() => {
        if (document.querySelectorAll('.content').length) {
            const ids = [];

            for (const row of [...document.querySelectorAll('.content')]) {
                const id = getVideoId(row.querySelector('a').href);
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'save-for-later';
                button.title = 'Watch Later';
                button.style = 'background-image: url("https://e7.pngegg.com/pngimages/901/503/png-clipart-black-play-button-icon-youtube-computer-icons-social-media-play-button-angle-rectangle.png");';
                button.onclick = (e) => addToWatchLater(id, e);
                row.insertBefore(button, row.querySelector('.metadata'));
                ids.push(id);
            }

            const actionButton = document.createElement('button');
            actionButton.type = 'button';
            actionButton.className = 'save-for-later';
            actionButton.title = 'Watch Later';
            actionButton.style = 'background-image: url("https://e7.pngegg.com/pngimages/901/503/png-clipart-black-play-button-icon-youtube-computer-icons-social-media-play-button-angle-rectangle.png");';
            actionButton.onclick = (e) => addAllToWatchLater(ids, e);

            const actions = document.querySelector('.actions-container');
            actions.insertBefore(actionButton, actions.children[1]);

            clearInterval(interval);
        }
    }, 1000);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://apis.google.com/js/client.js?onload=googleApiClientReady';
    document.head.appendChild(script);
})();
