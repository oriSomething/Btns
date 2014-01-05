/*!
 * Btns.js
 * http://www.orilivni.com
 * @author: Ori Livni
 * @version: 0.0.1
 * @description: Build awesome launchers!
 * @last build: 2014-01-05 UPC:21:13
 * (c) All right reserved. 2014. MIT licensed.
 */
;(function ( root, window, document, undefined ) {
    'use strict';



    // ---
    // ---
    // --- Private scope - Consts
    // ---
    // ---


    // There is an IE bug with `requestAnimationFrame`.
    // Needs to detect if IE to remove the use of `requestAnimationFrame`
    var IS_IE = (function() {
        var isIE = false;

        [/\bMSIE\b/, /\bTrident\b/, /\bIE\b/, /\bIEMobile\b/ ]
            .some( function(v) {
                if ( v.test(navigator.userAgent) ) {
                    return (isIE = true); // NOTE: assign;
                } } );

        return isIE;
    } ());



    var USE_REQUESTANIMATIONFRAME = ( (! IS_IE) && (('requestAnimationFrame' in window) || ('webkitRequestAnimationFrame' in window)) );



    var BUTTON_CLASS           = 'button',
        BUTTON_CONTAINER_CLASS = 'button-container',
        BUTTON_BUTTON_CLASS    = 'button-button',
        BUTTON_TITLE_CLASS     = 'button-title',

        LABELLEDBY_ID_PREFIX   = 'button-label-uid-',

        IS_HAS_MENU_CLASS      = 'is-has-menu',
        IS_MENU_ITEMS_LEN      = 'is-menu-items-length-',

        MENU_CLASS             = 'button-menu',
        SUM_MENU_CLASS         = 'button-menu-item',

        IS_HAS_NO_PARENT_CLASS = 'is-has-no-parent';



    var ELELMENTS = {
        "container"        : "el",
        "button container" : "elContainer",
        "button"           : "elButton",
        "title"            : "elButtonTitle",
        "menu"             : "elMenu" };



    var DOM = [ {
        name: ELELMENTS.container,
        tag: "div",
        attr: {
            "class": [BUTTON_CLASS, IS_HAS_NO_PARENT_CLASS].join(' '),
        },

        children: [ {
            name: ELELMENTS["button container"],
            tag: "div",
            attr: {
                "class": BUTTON_CONTAINER_CLASS,
            },

            children: [{
                name: ELELMENTS.button,
                tag: "button",
                attr: {
                    "aria-labelledby": "{{uid}}",
                    "class": BUTTON_BUTTON_CLASS
                }

            }, {
                name: ELELMENTS.title,
                tag: "span",
                attr: {
                    "id": "{{uid}}",
                    "aria-hidden": "true",
                    "class": BUTTON_TITLE_CLASS
                }
            } ]

        }, {
            name: ELELMENTS.menu,
            tag: "ul",
            attr: {
                "aria-labelledby": "{{uid}}",
                "class": MENU_CLASS } } ] } ];


    var DOM_MENU_ITEM = {
            tag: 'li',
            attr: {
                'role': 'menuitem',
                'class': SUM_MENU_CLASS } };





    // ---
    // ---
    // --- Private scope - Render Object
    // ---
    // ---

    var requestAnimationFrame = (function() {
        return window.requestAnimationFrame        ||
               window.webkitRequestAnimationFrame  ||
               function() {};
    } ()).bind(window);





    // the paint function to be used in `window.requestAnimationFrame`
    function renderPaint( renderList ) {
        return function() {
            var v,
                len = renderList.length;


            for (;len--;) {
                v = renderList.shift();
                v.el[v.fn].apply( v.el, v.args );
            }
        };
    }



    // the `object` to be use to store `functions` to render at once
    var render = {
        _renderList: [],


        append: function( el, fn, args ) {
            this._renderList.push( {
                el: el,
                fn: fn,
                args: (Array.isArray(args) ? args : [args])
            } );

            return this;
        },


        render: function() {
            var renderFn = renderPaint(this._renderList);

            if ( USE_REQUESTANIMATIONFRAME ) {
                requestAnimationFrame( renderFn );
            } else {
                renderFn();
            }

            // console.log( 'no. of DOM elements that being changed: ' + this._renderList.length ); // NOTE: testing how much DOM manipulation functions run in one `requestAnimationFrame`

            return this;
        }
    };





    // ---
    // ---
    // --- Private scope - Functions
    // ---
    // ---



    // allow easily aplly recurse without making another function
    // function recurse( obj, fn ) { if ( obj !== undefined ) recurse( fn( obj ), fn ); }



    // addes prefix to private properties name
    function privatePrefix( str ) { return '_' + str; }



    // create DOM element from spec
    function createElement( props, data ) {
        var i,
            el, // DOM element
            attr, // attr value to be add in the dom
            matchProp; // if {{template}} is used

        if ( ! ('tag' in props) ) throw "ERROR - createElement() - missing `tag` key in `props`";

        data = data || {};
        el = document.createElement( props.tag );

        for (i in props.attr) {
            attr = ''+props.attr[i];

            // check if there is a data template ( {{value}} )
            if ( /^{{.+}}$/.test( props.attr[i]) ) {
                matchProp = props.attr[i].match(/^{{(:?.+)}}$/)[1];
                if ( matchProp in data ) attr = data[matchProp];
            }

            // ... BUG ?: maybe class should be made in a defferent function (needs to check in IE10)
            el.setAttribute( i, attr );
        }

        return el;
    }



    // create DOM element from spec and adds them to a given object
    function createElementsTo( self, dom, data, parent ) {
        dom.forEach( function(v) {
            var el = createElement( v, data );

            // add to object the dom element
            if ( 'name' in v && typeof self === 'object' ) self[ privatePrefix(v.name) ] = el;

            // add to DOM
            if ( parent !== undefined ) parent.appendChild( el );

            // if children ...
            if ( 'children' in v && Array.isArray(v.children) ) createElementsTo( self, v.children, data, el );
        } );
    }



    // create DOM element that wraps given DOM elment
    function surroundElement( el, props ) {
        var surroundEl = createElement( props );

        surroundEl.appendChild( el );

        return surroundEl;
    }



    // classList operation to given element
    function skinSelector( self, fnName, c, selector) {
        if ( typeof c !== 'string' && ! Array.isArray(c) ) throw "ERROR - skinSelector() - selector expected to be `undefined` or `string` or `array`";

        // Make sure `c` will be Array
        c = Array.prototype.slice.call( [c] );


        // selector is represent the DOM element in Btn object
        if (selector===undefined) {
            selector = ELELMENTS.button;
        } else if ( typeof selector === 'string' ) {
            if ( ! (selector in ELELMENTS) ) throw "ERROR - skinSelector() - unknown selector";
            selector = ELELMENTS[selector];
        }

        selector = privatePrefix(selector);


        // call the fnName operation
        c.forEach( function(v) {
            if ( selector in self ) self[selector].classList[fnName](v);
        } );
    }



    // Adds reference vars to parent and child
    // plus Adds classes to DOM for enabling styling
    function setParent( self, child ) {
        // Adds to parent a refernce to child Btn object
        self._children.push( child );

        // Adds to child a refernce to parent Btn object
        child._parent = self;

        // Removes child container element
        child.get().classList.remove( IS_HAS_NO_PARENT_CLASS ); // remove class that indicates that no parent exists

        // adds DOM reference for having a menu
        self.get().classList.add( IS_HAS_MENU_CLASS );
    }



    // Adds to DOM element(s) class that indecates the number of children
    function setMenuChildrenLengthClass( self ) {
        var elementsToStyle = [self.get(), self.get('menu')];

        // Adds class to the `base element` and `menu element` with the number of children in menu
        if ( self._children.length === 1 ) {

            elementsToStyle.forEach( function(v) {
                    v.classList.add( IS_MENU_ITEMS_LEN + self._children.length );
                } );

            self.get('menu').setAttribute( 'role', 'menu' ); // accessibility

        } else if ( self._children.length > 1 ) {

            elementsToStyle.forEach( function(v) {
                    v.classList.remove( IS_MENU_ITEMS_LEN + (self._children.length-1) );
                    v.classList.add( IS_MENU_ITEMS_LEN + self._children.length );
                } );
        }
    }



    // default on click operation of btn element
    function onclick( self, e ) {
        e.stopPropagation();

        // … it smells like a future BUG
        // It's ment for making sure the `open` / `close` will be triggired only if contains menu
        if ( self.get().classList.contains( IS_HAS_MENU_CLASS ) ) {
            self.toggle();
            render.render();
        }
    }




    // ---
    // ---
    // --- Public scope
    // ---
    // ---



    // constractor
    var Btn = function( title ) {
        // initialize local variables
        this._children = [];
        this._events   = [];
        this._uid      = Math.random() * 999999 | 0; // for `aria-labelledby`


        // create DOM elements
        createElementsTo( this, DOM, { "uid": (LABELLEDBY_ID_PREFIX+this._uid) } );


        this
        // set properties
            .title( title )
            .close()
        // delegate events
            .on( 'click', onclick.bind(null, this) );

        render.render();

        return this; // chaining
    };



    Btn.prototype.title = function( title ) {
        // get
        if ( arguments.length === 0 ) return this._elButtonTitle.textContent;

        // set
        if ( typeof title === 'string' ) {
            this._elButton.setAttribute( 'data-title', title ); // IE :(
            this._elButtonTitle.textContent = title;
        }

        // chaining
        return this;
    };



    Btn.prototype.addClass = function( c, selector ) {
        skinSelector( this, 'add', c, selector );

        // Chaining
        return this;
    };



    Btn.prototype.removeClass = function( c, selector ) {
        skinSelector( this, 'remove', c, selector );

        // Chaining
        return this;
    };



    Btn.prototype.toggleClass = function( c, selector ) {
        skinSelector( this, 'toggle', c, selector );

        // Chaining
        return this;
    };



    // return the container DOM element
    Btn.prototype.get = function( selector ) {
        if ( selector === undefined ) {
            return this._el; // likeprivatePrefix( ELELMENTS[ 'container' ] )
        } else {
            if ( selector in ELELMENTS ) return this[ privatePrefix(ELELMENTS[selector]) ];
        }

        throw "ERROR - Btn.prototype.get() - selector - unknown property";
    };



    // el - selector / Node / Btn
    Btn.prototype.append = function( child ) {
        if ( ! (child instanceof Btn) ) throw "ERROR - Btn.prototype.append() - child expected to be instance of Btn";

        // set parent child relation + class handler
        setParent( this, child );

        // adds class to the `menu` element with the number of children in menu
        setMenuChildrenLengthClass( this );

        // - Adds child to the DOM of `this`
        this._elMenu.appendChild( surroundElement( child._el, DOM_MENU_ITEM ) );

        // Chaining
        return this;
    };



    // Need to create
    // …
    // Btn.prototype.removeChild = function( child ) {};
    // …



    // el - selector / Node / Btn
    // also allows to append to pure DOM element
    Btn.prototype.appendTo = function( selector ) {
        var el;


        // if selector is instanceof Btn
        if (selector instanceof Btn) {
            return el.append( this );

        // else if, appendTo selector which is element node or string
        } else if (selector instanceof Node) {
            el = selector;
        } else if (typeof selector === 'string') {
            el = document.querySelector( selector );
        }


        // throw error when selector isn't of the right types
        if (el === undefined) throw "ERROR - Btn.prototype.append() - selcetor isn't from expected type or not found";

        // DOM append operation
        el.appendChild( this.get() );

        // Chaining
        return this;
    };



    // Need to create
    // …
    // Btn.prototype.detachFrom = function( selector ) {} // for DOM elements
    // …



    Btn.prototype.close = function() {
        // el - children
        // closing all children
        // chilren are first because of the way the DOM tree works
        // … this might need to rework because off masive DOM calculation that children effected from
        // … for now it ignore children that have `is-close` state
        this._children.forEach( function(child) {
            if ( child.get().classList.contains('is-open') ) child.close();
        } );


        // el
        render.append( this._el.classList, 'add', 'is-close' );
        render.append( this._el.classList, 'remove', 'is-open' );
        render.append( this._el, 'setAttribute', ['aria-pressed', false] );


        // el - parent
        if ( this._parent ) {
            render.append( this._parent._el.classList, 'remove', 'is-submenu-open' );
            render.append( this._parent._elMenu.classList, 'remove', 'is-submenu-open' );
        }


        return this; // chaining
    };



    Btn.prototype.open = function() {
        // el
        render.append( this._el.classList, 'remove', 'is-close' );
        render.append( this._el.classList, 'add', 'is-open' );
        render.append( this._el, 'setAttribute', ['aria-pressed', true] );

        // parent
        if ( this._parent ) {
            render.append( this._parent._el.classList, 'add', 'is-submenu-open' );
            render.append( this._parent._elMenu.classList, 'add', 'is-submenu-open' );
        }

        return this; // chaining
    };



    Btn.prototype.toggle = function() {
        var state = this._el.classList.contains('is-open');

        if ( state ) return this.close();

        // else
        return this.open();
    };



    Btn.prototype.on = function( event, fn, capture ) {
        if ( typeof event !== 'string' ) throw "ERROR - Btn.prototype.on - event expected to be string";
        if ( typeof fn !== 'function' ) throw "ERROR - Btn.prototype.on - fn expected to be function";
        if ( typeof capture !== 'boolean' ) capture = false;


        // save record of events if removeEventListener is needed
        this._events.push( {
            event: event,
            fn: fn,
            capture: capture } );


        this._elButton.addEventListener( event, fn, capture );


        // Chaining
        return this;
    };



    // when using general off or `click` event with no `fn` value
    // it will off also the default `onclick` function for openning
    // sub menus!
    Btn.prototype.off = function( /* event, fn, capture */ ) {
        var EVENT_INDEX = 0,
            FN_INDEX = 1,
            CAPTURE_INDEX = 2;


        var self    = this,
            args    = arguments, // NOTE: cached for `.filter()`
            // NOTE: These vars are used for filtering
            // no arguments equals to `event = fn = capture = true`
            event   = (EVENT_INDEX.toString()   in args),
            fn      = (FN_INDEX.toString()      in args),
            capture = (CAPTURE_INDEX.toString() in args);


        // check for correct types
        if ( event && (typeof args[EVENT_INDEX] !== 'string') ) throw "ERROR - Btn.prototype.off() - event expected to be string";
        if ( fn && (typeof args[FN_INDEX] !== 'function') ) throw "ERROR - Btn.prototype.off() - fn expected to be function";
        if ( capture && (typeof args[CAPTURE_INDEX] !== 'boolean') ) throw "ERROR - Btn.prototype.off() - capture expected to be boolean";


        // remove events - (array+eventListenrs)
        this._events =
            this._events
                .filter( function(v) {
                    // NOTE: removeEventListener will always return undefined so it's like false
                    // and it will clean the cell from the array
                    return (
                        // if statement
                        ((!event) || v.event === args[EVENT_INDEX]) &&
                        ((!fn) || v.fn === args[FN_INDEX]) &&
                        ((!capture) || v.capture === args[CAPTURE_INDEX]) ?

                        // if statement true
                        self._elButton.removeEventListener(
                            v.event,
                            v.fn,
                            v.capture ) :

                        // if statement false
                        true );
                } );


        // Chaining
        return this;
    };





    // ---
    // ---
    // --- Adds to global scope
    // ---
    // ---

    root.Btn = Btn;


} (this, window, document) );