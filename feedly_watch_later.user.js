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
            if (confirm('All videos added. Would you like to open YouTube?')) {
                window.open('https://www.youtube.com/playlist?list=WL', '_blank').focus();
            }
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

    const createButton = (onclick) => {
        const icon = document.createElement('i');
        icon.className = 'icon icon-sm icon-fx-play-ios-sm-black';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'EntryReadLaterButton rounded EntryToolbar__button button-icon-only';
        button.title = 'Watch Later';
        button.onclick = onclick;
        button.appendChild(icon);

        return button;
    };

    const interval = setInterval(() => {
        if (document.querySelectorAll('.content').length) {
            const ids = [];

            for (const row of [...document.querySelectorAll('.content')]) {
                const id = getVideoId(row.querySelector('a').href);
                const toolbar = row.querySelector('.entry__toolbar');
                toolbar.insertBefore(createButton((e) => addToWatchLater(id, e)), toolbar.children[0]);
                ids.push(id);
            }

            const actions = document.querySelector('.actions-container');
            actions.insertBefore(createButton((e) => addAllToWatchLater(ids, e)), actions.children[1]);

            clearInterval(interval);
        }
    }, 1000);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://apis.google.com/js/client.js?onload=googleApiClientReady';
    document.head.appendChild(script);
})();
