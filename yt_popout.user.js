// ==UserScript==
// @name         Popout YouTube
// @namespace    http://dvbris.com
// @version      1.3.3
// @description  Adds a button to watch a popout version of the video
// @copyright    2014, Geraint White
// @match        *://*.youtube.com/*
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

function popout(url, title) {
  if (url == undefined) {
    var width = $('#player').width();
    var height = $('#player').height();
    var player = $('#movie_player')[0];
    window.open(
      window.location.href.replace('watch?v=','v/') + '?start=' + player.getCurrentTime().toString().split('.')[0] + '&autoplay=1',
      document.title,
      'width=' + width + ',height=' + height
    );
    player.stopVideo();
  } else {
    window.open(url.replace('watch?v=','v/') + '?autoplay=1', title, 'width=560,height=315');
  }
}

function addBtn(container) {
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

function main() {
  // from http://userscripts.org/scripts/show/153699
  unsafeWindow.yt.pubsub.instance_.subscribe("init-watch", function(){
    addBtn('#watch7-sentiment-actions');
    addBtn('#action-panel-overflow-menu li');
  });
  unsafeWindow.yt.pubsub.instance_.subscribe("init-feed", function(){
    addBtn('.feed-item-container .yt-lockup-content');
  });
}

main();

$(document).on('click', '.popout-button', function() {
  var url = $(this).parent().siblings('.yt-lockup-title').children('a');
  if (url.length) {
    console.log('feed')
    popout(url.attr('href'), url.textContent);
  } else {
    popout();
  }
});
