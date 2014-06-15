// ==UserScript==
// @name       PDFescape ctrl-s save
// @namespace  http://geraintwhite.co.uk/
// @version    0.1
// @description  Allows the use of ctrl-s to save a PDF on PDFescape
// @match      http://www.pdfescape.com/open/*
// @copyright  2014, Geraint White
// @require    http://code.jquery.com/jquery-latest.js
// ==/UserScript==


$(function() {
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.keyCode === 83) {
            $('iframe').contents().find('#pdfe_side a:first-child').click();
            e.preventDefault();
            return false;
        }
    });

    $('iframe').addEventListener('onload', function(e) {
        $('iframe').contents()[0].addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.keyCode === 83) {
                $('#pdfe_side a:first-child').click();
                e.preventDefault();
                return false;
            }
        });
    });
});
