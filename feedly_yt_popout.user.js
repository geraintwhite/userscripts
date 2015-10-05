// ==UserScript==
// @name         Popout YouTube on Feedly
// @namespace    http://geraintwhite.co.uk
// @version      1.0.0
// @description  Adds a button to watch a popout version of the video on Feedly
// @copyright    2015, Geraint White
// @match        *://*.feedly.com/*
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==


$(document).on('click', '.headerInfo-links.right .headerInfo-expanded-img:last-child', function () {
    var url = $('.u100Entry').data('alternate-link');
    var title = $('.u100Entry').data('title');

    if (/^https?:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9]+$/.test(url)) {
        $('.headerInfo-expanded-scroller').append(
            $('<section/>').text('Popout').on('click', function () {
                window.open(url.replace('watch?v=','v/') + '?autoplay=1', title, 'width=560,height=315');
            })
        )
    }
});
