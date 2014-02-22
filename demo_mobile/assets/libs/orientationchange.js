/*
 * OrientationChange Event Shim
 * https://gist.github.com/2966043
 *
 * Copyright (c) 2012, Rich Tibbett
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * DESCRIPTION:
 * ------------
 *
 * JavaScript shim of iOS's window.orientation + orientationchange events
 * for other (typically mobile) browsers.
 *
 * Documentation URL @
 * http://developer.apple.com/library/IOS/#documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html
 *
 * Demo page @
 * http://people.opera.com/richt/release/demos/orientation/orientationchange_shim/test.html
 *
 * USAGE:
 * ------
 *
 * 1. Add this file to the <head> of your web page:
 *
 * <script type="text/javascript" src="orientationChange.js"></script>
 *
 * 2. Register for 'orientationchange' events in the usual way:
 *
 * window.addEventListener('orientationchange', function(e) {
 *   console.log( window.orientation );
 * }, true);
 *
 *   or:
 *
 * window.onorientationchange = function(e) {
 *   console.log( window.orientation );
 * }
 *
 *   or:
 *
 * <body onorientationchange="checkOrientation()">
 *
 * *********************************************************************
 * NOTE: Adding e.g. <body onorientationchange="checkOrientation()"> is
 * partially supported but is not recommended. Please consider using one
 * of the scripting approaches shown above instead.
 * *********************************************************************
 *
 * KNOWN ISSUES:
 * --------------
 *
 * 21-06-2012:
 * The native orientationchange implementation in Android's Native Browser
 * and Chrome Beta for Android is borked. Note that this shim is not loaded
 * in these browsers. This shims does not replace these broken native
 * implementations.
 *
 */

 !(function( window, undefined ) {

    var supportsOrientation = ( typeof window.orientation == 'number' && typeof window.onorientationchange == 'object' );

    // Do nothing if we don't need to shim
    if ( supportsOrientation ) return;

    /* START: requestAnimationFrame shim
     *
     * By: Eric Möller
     * URL: http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
     */
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelRequestAnimationFrame = window[vendors[x] +
            'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            },
            timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    } ());

    /* END: requestAnimationFrame shim */

    var cOrientationChange = function() {

        this.currentOrientationAngle = -1;
        this.lastOrientationAngle = -2;

        this.currentOrientationState = this.lastOrientationState = ( window.innerWidth > window.innerHeight ) ? 'landscape': 'portrait';

        var self = this;

        // Setup deviceorientation listener (if it is available)
        window.addEventListener( 'deviceorientation', function( e ) {
            // Don't use unless we have a 3-axis implementation of device orientation
            if ( e.alpha === null || e.alpha === undefined ) {
                self.currentOrientationAngle = 0;
                return;
            }

            // set orientation angle to nearest 90 degrees
            self.currentOrientationAngle = Math.round( -e.gamma / 90) * 90;

            // correction for holding the device upside down
            if ( self.currentOrientationAngle == 0 && e.beta < 0 ) {
                self.currentOrientationAngle = 180;
            }

        }, true );

        this.manualOrientationChange = function() {

            // landscape when width is biggest, otherwise portrait
            self.currentOrientationState = ( window.innerWidth > window.innerHeight ) ? 'landscape': 'portrait';

            if (  ( self.currentOrientationState !== self.lastOrientationState ) ||
                    ( self.lastOrientationAngle === -2 && self.currentOrientationAngle !== -1 ) ||
                        ( self.currentOrientationAngle !== 0 && self.currentOrientationAngle === -self.lastOrientationAngle )  ) {

                if ( self.currentOrientationAngle === -1 ) self.currentOrientationAngle = 0;

                // Update static window.orientation value
                window.orientation = self.currentOrientationAngle;

                // Create and dispatch pseudo-orientationchange event
                var orientationEvent = window.document.createEvent( 'Event' );
                orientationEvent.initEvent( 'orientationchange', true, true );
                orientationEvent.orientation = this.currentOrientationAngle;
                orientationEvent.mode = this.currentOrientationState;
                window.dispatchEvent( orientationEvent );

                // Fire event to window.onorientationchange assigned handler (if any)
                if ( typeof window.onorientationchange == 'object' ) {
                    window.onorientationchange.call( this, orientationEvent );
                }

                // Check for onorientationevent handler on body element and execute
                var body = document.body;
                if( body && body.getAttribute('onorientationchange')) {
                    // Create new script and run function
                    var onorientationchange_script = document.createElement('script');
                    onorientationchange_script.type = "text/javascript";
                    onorientationchange_script.textContent = "//<![CDATA[\n" + body.getAttribute('onorientationchange') + "\n//]]>";
                    body.appendChild(onorientationchange_script);
                    onorientationchange_script.parentNode.removeChild( onorientationchange_script );
                }

                self.lastOrientationAngle = self.currentOrientationAngle;
                self.lastOrientationState = self.currentOrientationState;

            }

            window.requestAnimationFrame( self.manualOrientationChange.bind( self ) );

        };

        this.manualOrientationChange();

    };

    //*** WINDOW EVENTLISTENER SHIM
    var orientationHandler = new cOrientationChange();

    window.orientation = orientationHandler.currentOrientationAngle === -1 ? 0: orientationHandler.currentOrientationAngle;

    window.onorientationchange = function( e ) {};

})( window );