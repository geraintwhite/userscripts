// ==UserScript==
// @name         Feedly watch later
// @namespace    https://geraintwhite.co.uk/
// @version      0.2.3
// @description  Add Watch Later button for YouTube videos in Feedly
// @author       Geraint White
// @match        https://feedly.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const PLAYLIST_NAME = 'Feedly Watch Later';
    const OAUTH2_CLIENT_ID =
        '846857736261-u84r4qvoakrncsfme16j3cdrht193ep0.apps.googleusercontent.com';
    const OAUTH2_SCOPES = ['https://www.googleapis.com/auth/youtube'];

    let cachedAuthResult;

    window.googleApiClientReady = () => {
        console.log('googleApiClientReady');
        gapi.auth.init(() => {
            console.log('gapi.auth.init');
            window.setTimeout(checkAuth, 1000);
        });
    };

    function checkAuth() {
        console.log('checkAuth');
        gapi.auth.authorize(
            {
                client_id: OAUTH2_CLIENT_ID,
                scope: OAUTH2_SCOPES,
                immediate: true
            },
            (authResult) => handleAuthResult(authResult)
        );
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

    const getPlaylist = (title, cb = console.log) => {
        const request = gapi.client.youtube.playlists.list({
            part: 'snippet',
            mine: true
        });

        request.execute((response) => {
            const playlist =
                response.result &&
                response.result.items.find(
                    (item) => item.snippet.title === title
                );
            cb(playlist && playlist.id);
        });
    };

    const createPlaylist = (title, cb = console.log) => {
        const request = gapi.client.youtube.playlists.insert({
            part: 'snippet',
            resource: {
                snippet: {
                    title
                }
            }
        });

        request.execute((response) => {
            cb(response.result && response.result.id);
        });
    };

    const getOrCreatePlaylist = (cb = console.log) => {
        getPlaylist(PLAYLIST_NAME, (playlistId) => {
            if (playlistId) {
                cb(playlistId);
            } else {
                createPlaylist(PLAYLIST_NAME, cb);
            }
        });
    };

    const addVideoToPlaylist = (playlistId, videoId, cb = console.log) => {
        const request = gapi.client.youtube.playlistItems.insert({
            part: 'snippet',
            resource: {
                snippet: {
                    playlistId,
                    resourceId: {
                        videoId,
                        kind: 'youtube#video'
                    }
                }
            }
        });

        request.execute(cb);
    };

    const initPlaylist = (cb) => {
        if (cachedAuthResult && !cachedAuthResult.error) {
            getOrCreatePlaylist(cb);
        } else {
            gapi.auth.authorize(
                {
                    client_id: OAUTH2_CLIENT_ID,
                    scope: OAUTH2_SCOPES,
                    immediate: false
                },
                (authResult) =>
                    handleAuthResult(authResult, () => getOrCreatePlaylist(cb))
            );
        }
    };

    const addToWatchLater = (playlistId, videoId, e) => {
        if (cachedAuthResult && !cachedAuthResult.error) {
            addVideoToPlaylist(playlistId, videoId);
        } else {
            gapi.auth.authorize(
                {
                    client_id: OAUTH2_CLIENT_ID,
                    scope: OAUTH2_SCOPES,
                    immediate: false
                },
                (authResult) =>
                    handleAuthResult(authResult, () =>
                        addVideoToPlaylist(playlistId, videoId)
                    )
            );
        }

        if (e) {
            e.stopPropagation();
        }
    };

    const addAllToWatchLater = (playlistId, videoIds, e) => {
        if (!videoIds.length) {
            window
                .open(
                'https://www.youtube.com/playlist?list=' + playlistId,
                '_blank'
            )
                .focus();
            return;
        }

        if (cachedAuthResult && !cachedAuthResult.error) {
            const [videoId, ...rest] = videoIds;

            addVideoToPlaylist(playlistId, videoId, () =>
                addAllToWatchLater(playlistId, rest)
            );
        } else {
            gapi.auth.authorize(
                {
                    client_id: OAUTH2_CLIENT_ID,
                    scope: OAUTH2_SCOPES,
                    immediate: false
                },
                (authResult) =>
                    handleAuthResult(authResult, () =>
                        addAllToWatchLater(playlistId, videoIds)
                    )
            );
        }

        if (e) {
            e.stopPropagation();
        }
    };

    const getVideoId = (url) => url.split('?v=')[1];

    const createButton = (onclick) => {
        const icon = document.createElement('img');
        icon.src = 'https://upload.wikimedia.org/wikipedia/commons/8/8b/YouTube_dark_icon_%282017%29.svg';
        icon.style.cssText = 'width: 100%';

        const span = document.createElement('span');
        span.className = 'jthuVxlV6d6mDAPuHzn3';
        span.appendChild(icon);

        const button = document.createElement('button');
        button.type = 'button';
        button.style.cssText = 'width: 30px; background: none; border: 0; cursor: pointer';
        button.title = 'Watch Later';
        button.onclick = onclick;
        button.appendChild(span);

        return button;
    };

    const getVideoIds = () => {
        return [...document.querySelectorAll('.MagazineLayout__content')].map((row) => getVideoId(row.querySelector('a').href));
    }

    const interval = setInterval(() => {
        if (document.querySelectorAll('.MagazineLayout__content').length) {
            for (const row of [...document.querySelectorAll('.MagazineLayout__content')]) {
                const videoId = getVideoId(row.querySelector('a').href);
                const toolbar = row.querySelector('.EntryToolbar');
                if (toolbar && !toolbar.querySelector('img')) {
                    toolbar.insertBefore(
                        createButton((e) =>
                            initPlaylist((playlistId) =>
                                addToWatchLater(playlistId, videoId, e)
                            )
                        ),
                        toolbar.children[0]
                    );
                }
            }
        }

        if (document.querySelector('.MarkAsReadButton')) {
            const actions = document.querySelector('.MarkAsReadButton').parentNode;
            if (actions && !actions.querySelector('img')) {
                actions.insertBefore(
                    createButton((e) =>
                        initPlaylist((playlistId) =>
                            addAllToWatchLater(playlistId, getVideoIds(), e)
                        )
                    ),
                    actions.children[1]
                );
            }
        }
    }, 1000);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src =
        'https://apis.google.com/js/client.js?onload=googleApiClientReady';
    document.head.appendChild(script);
})();
