// ==UserScript==
// @name         Popout YouTube
// @namespace    http://geraintwhite.co.uk
// @version      1.5.2
// @description  Adds a button to watch a popout version of the video
// @copyright    2014, Geraint White
// @match        *://*.youtube.com/*
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

function popout(url, title) {
  if (url == undefined) {
    var player = $('#movie_player')[0];
    window.open(
      window.location.href.replace('watch?v=','v/') + '?start=' + player.getCurrentTime().toString().split('.')[0] + '&autoplay=1',
      document.title,
      'width=' + player.offsetWidth + ',height=' + player.offsetHeight
    );
    player.stopVideo();
  } else {
    window.open(url.replace('watch?v=','v/') + '?autoplay=1', title, 'width=560,height=315');
  }
}

function watchBtn() {
  $('#action-panel-overflow-menu').append(
    $('<li />').append(
      $('<button />').append(
        $('<span />')
          .addClass('yt-ui-menu-item-icon'),
        $('<span />')
          .addClass('yt-ui-menu-item-label')
          .text('Open popout')
      ).addClass('yt-ui-menu-item popout-button')
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

  var popBtn = $('<button />')
    .addClass('yt-uix-button yt-uix-button-text yt-uix-button-size-default popout-button')
    .text('Open popout')
    .css('padding', '0 5px');

  var hasGrp = $(container).find('.extra-buttons');
  if (!hasGrp.length) { $(container).append(btnGrp.clone()); }
  $(hasGrp.selector).append(popBtn.clone());
}

function playlistBtn() {
  $('.playlist-actions').append(
    $('<button />')
      .addClass('yt-uix-button yt-uix-button-size-default yt-uix-button-default popout-button')
      .text('Open popout')
  )
}

function main() {
  unsafeWindow.yt.pubsub.instance_.subscribe('init-watch', function() {
    console.log('watch');
    watchBtn();
  });
  unsafeWindow.yt.pubsub.instance_.subscribe('init-feed', function() {
    console.log('feed');
    feedBtn();
  });
  unsafeWindow.yt.pubsub.instance_.subscribe('init-playlist', function() {
    console.log('playlist');
    playlistBtn();
  });
}

main();

$(document).on('click', '.popout-button', function() {
  var url = $(this).parent().siblings('.yt-lockup-title').children('a');
  if (!url.length) url = $('.playlist-actions .playlist-play-all');
  if (url.length) {
    console.log(url.attr('href'));
    popout(url.attr('href'), url.textContent);
  } else {
    popout();
  }
});
