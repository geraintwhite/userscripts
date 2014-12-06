// ==UserScript==
// @name         YouTube to mp3
// @namespace    http://dvbris.com
// @version      1.5.1
// @description  Adds a button to convert YouTube videos to mp3 using video2mp3.net
// @copyright    2014, Geraint White
// @match        *://*.youtube.com/*
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

function download(url) {
  window.open('http://www.video2mp3.net/loading.php?url='+url);
}

function watchBtn() {
  $('#action-panel-overflow-menu').append(
    $('<li />').append(
      $('<button />')
        .addClass('yt-ui-menu-item dl-button')
        .text('Convert to mp3')
    )
  );
}

function feedBtn() {
  var container = '.feed-item-container .yt-lockup-content';

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
  unsafeWindow.yt.pubsub.instance_.subscribe('init-watch', function() {
    watchBtn();
  });
  unsafeWindow.yt.pubsub.instance_.subscribe('init-feed', function() {
    feedBtn();
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
