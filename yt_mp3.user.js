// ==UserScript==
// @name         YouTube to mp3
// @namespace    http://dvbris.com
// @version      1.3.1
// @description  Adds a button to convert YouTube videos to mp3 using video2mp3.net
// @copyright    2014, Geraint White
// @match        *://*.youtube.com/*
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

function download(url) {
  window.open('http://www.video2mp3.net/loading.php?url='+url);
}

function addBtn(container) {
  var btnGrp = $('<span />')
    .addClass('yt-uix-button-group extra-buttons')
    .css({
      margin: '10px 0',
      display: 'block'
    });

  var dlBtn = $('<button />')
    .addClass('yt-uix-button yt-uix-button-text yt-uix-button-size-default dl-button')
    .text('Convert to mp3')
    .css('padding', '0 5px');

  var hasGrp = $(container).find('.extra-buttons');
  if (!hasGrp.length) { $(container).append(btnGrp.clone()); }
  $(hasGrp.selector).append(dlBtn.clone());
}

function main() {
  // from http://userscripts.org/scripts/show/153699
  unsafeWindow.yt.pubsub.instance_.subscribe("init-watch", function() {
    addBtn('#watch7-sentiment-actions');
  });
  unsafeWindow.yt.pubsub.instance_.subscribe("init-feed", function() {
    addBtn('.feed-item-container .yt-lockup-content');
  });
}

main();

$(document).on('click', '.dl-button', function() {
  var url = $(this).parent().siblings('.yt-lockup-title').children('a');
  if (url.length) {
    download('http://youtube.com'+url.attr('href'));
  } else {
    download(window.location.href);
  }
});
