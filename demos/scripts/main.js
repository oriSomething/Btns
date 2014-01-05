/**
 * main.js
 *
 * responsible for adding menu to the page
 */



;(function ( window, document, Btn, FastClick, undefined) {
    'use strict';



    // Used for creating alert messages popups for button
    function alertEvent( title ) {
        return function() { window.alert( title ); };
    }



    // Used for creating links for button
    function linkEvent( link ) {
        return function() { window.location.href = link; };
    }



    // remove CSS that makes the menu invisible onload
    function removeIsMainInvisble() {
        document.documentElement.classList.remove('is-main-invisible');
    }



    // The functions that run after `DOMContetedLoaded`
    function onload() {
        // fast click for iOS / Android
        if ( document.documentElement.classList.contains('touch-fix') ) FastClick.attach(document.body);


        // creates the menu
        new Btn( 'Menu' ).addClass('skin-main_menu')
            .append( new Btn('Portfolio').addClass('skin-www').on( 'click', linkEvent('http://www.orisomething.com/') ) )

            .append( new Btn('orilivni.com').addClass('skin-blog').on( 'click', linkEvent('http://www.orilivni.com/') ) )

            .append( new Btn('Ori\'s Twitter').addClass('skin-twitter').on( 'click', linkEvent('https://twitter.com/oriSomething') ) )

            .append( new Btn('Sub Menu').addClass('skin-menu')

                .append( new Btn('Disaster Artist').addClass('skin-disaster_artist').on( 'click', linkEvent('http://www.thedisasterartistbook.com/') ) )

                .append( new Btn('Nyan Cat').addClass('skin-nyan_cat').on( 'click', linkEvent('http://www.youtube.com/watch?v=QH2-TGUlwu4') ) )

                .append( new Btn('Streets of Rage').addClass('skin-streets_of_rage').on( 'click', linkEvent('https://vimeo.com/80984057') ) )

                .append( new Btn('Sub Sub Menu').addClass('skin-menu')
                    .append( new Btn('Alert: 1!').addClass('skin-alert').on( 'click', alertEvent('Annoying alert 1!') ) )
                    .append( new Btn('Alert: 2!').addClass('skin-alert').on( 'click', alertEvent('Annoying alert 2!') ) )
                ) )

            .append( new Btn('Hacker News').addClass('skin-hacker_news').on( 'click', linkEvent('https://news.ycombinator.com/') ) )

            .append( new Btn('Fontef').addClass('skin-fontef').on( 'click', linkEvent('http://www.fontef.com/') ) )

            .append( new Btn('Processing').addClass('skin-processing').on( 'click', linkEvent('http://www.processing.org/') ) )

            .append( new Btn('HTML5 Rocks!').addClass('skin-html5rocks').on( 'click', linkEvent('http://www.html5rocks.com/en/') ) )

            // Appending the button menu to the DOM - `#main` element
            .appendTo( '#main' );



        // remove the class that makes the menu invisible
        if ('requestAnimationFrame' in window) {
            window.requestAnimationFrame( removeIsMainInvisble );
        } else if ('webkitRequestAnimationFrame' in window) {
            window.webkitRequestAnimationFrame( removeIsMainInvisble );
        } else {
            window.setTimeout( removeIsMainInvisble, 0 );
        }
    }



    // the init function - also call it self
    (function init() {
        // iOS / Android - touch hack fix by sniff user agent - maybe better to use modernizr touch event detect - but not sure it's a problem of all Webkit
        document.documentElement.className += ((/(like Mac OS X)|(Android)/i.test(window.navigator.userAgent)) ? ' touch-fix' : ' no-touch-fix');

        // Makes the menu invisible for fading in animation
        document.documentElement.className += ' is-main-invisible';

        // Makes sure everything is work when blocking render
        document.addEventListener( 'DOMContentLoaded', onload, false );
    } ());


} (window, document, Btn, FastClick) );