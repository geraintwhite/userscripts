// ==UserScript==
// @name         Remove watched videos
// @namespace    https://geraintwhite.co.uk/
// @version      1.0.0
// @description  Add Remove Watched Videos button for to YouTube playlists
// @author       Geraint White
// @match        https://www.youtube.com/playlist?list=*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    async function removeWatchedVideos() {
        const videoItems = document.querySelectorAll('ytd-playlist-video-renderer');

        for (const item of videoItems) {
            const progressBar = item.querySelector('#progress');

            // Check if the progress bar indicates the video is mostly watched (> 90%)
            if (progressBar && parseFloat(progressBar.style.width) > 90) {
                // Find the action menu button (three dots)
                const menuButton = item.querySelector('yt-icon-button.ytd-menu-renderer');

                if (menuButton) {
                    menuButton.click();

                    // Wait for the dropdown menu to appear in the DOM
                    await new Promise(resolve => setTimeout(resolve, 100));

                    // Find the "Remove from" option.
                    // Note: The text may vary based on your language settings or playlist name.
                    const menuOptions = document.querySelectorAll('ytd-menu-service-item-renderer');
                    const removeOption = Array.from(menuOptions).find(opt => opt.innerText.includes('Remove from'));

                    if (removeOption) {
                        removeOption.click();
                        // Brief pause to allow YouTube's UI to update before next action
                        await new Promise(resolve => setTimeout(resolve, 200));
                    } else {
                        // Click away to close the menu if the option wasn't found
                        document.body.click();
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            }
        }

        // Wait for final requests to finish before reloading
        await new Promise(resolve => setTimeout(resolve, 500));

        location.reload();
    }

    const createButton = (onclick) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'removeWatchedVideos';
        button.innerText = 'Remove Watched Videos';
        button.onclick = onclick;

        return button;
    };

    const interval = setInterval(() => {
        const actions = document.querySelector(".ytPageHeaderViewModelScrollContainer .ytPageHeaderViewModelContent")
        if (actions && !actions.querySelector('.removeWatchedVideos')) {
            actions.appendChild(createButton(() => removeWatchedVideos()));
        }
    }, 1000);

    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerText = `
        .removeWatchedVideos {
            height: 36px;
            margin: 12px 0;
            padding: 0 16px;
            background: #fff;
            color: #000;
            font-weight: 500;
            border: 0;
            border-radius: 18px;
            cursor: pointer;
        }
        .removeWatchedVideos:hover {
            opacity: 0.9;
        }
    `;

    document.head.appendChild(style);
})();
