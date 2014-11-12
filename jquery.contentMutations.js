;(function ( $ ) {

    var pluginName = 'contentMutations',
        defaults = {
            attributes: false,
            childList: true,
            subtree: true,
            fallbackTimer: 1000,
            debounceTime: 50
        };

    function Plugin( element, options ) {
        
        this.element    = element;
        this.$element   = $(element);

        this.options    = $.extend( {}, defaults, options );
        this._defaults  = defaults;
        this._name      = pluginName;
        
        this.init();
    }
    
    
    var debounce = function( func, wait, immediate ) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if ( !immediate ) func.apply( context, args );
            };
            var callNow = immediate && !timeout;
            clearTimeout( timeout );
            timeout = setTimeout( later, wait );
            if ( callNow ) func.apply( context, args );
        };
    };
    

    Plugin.prototype.init = function () {
        
        this.MutationObserver = (function () {
            var prefixes = [ 'WebKit', 'Moz', 'O', 'Ms', '' ];
            
            for( var i=0; i < prefixes.length; i++ ) {
                if( prefixes[i] + 'MutationObserver' in window ) {
                    return window[ prefixes[i] + 'MutationObserver' ];
                }
            }
            return false;
        }());
        
    
        if(this.MutationObserver) {
            this.observer = new this.MutationObserver($.proxy(function( mutations ) {
                mutations.forEach( debounce($.proxy(function( mutation ) {
                    if ( typeof this.options.callback === 'function' ) {
                        this.options.callback.call();
                    }
                }, this )), this.options.debounceTime );
            }, this ));
            
            this.observer.observe( this.element, this.options );
        }
        else {
            setInterval( $.proxy(function() {
                if ( typeof this.options.callback === 'function' ) {
                    this.options.callback.call();
                }
            }, this), this.options.fallbackTimer );
        }
    };
    
    
    Plugin.prototype.destroy = function () {
        this.observer.disconnect();
    };

    $.fn[ pluginName ] = function ( arg ) {
        
        var args = arguments;
        
        return this.each(function () {
            var d = $.data( this, pluginName );
            
            if ( !d && ( typeof arg === 'object' || typeof arg === 'undefined' )) {
                $.data( this, pluginName, 
                new Plugin( this, arg ));
            }
            else if ( d && typeof arg === 'string' && typeof d[arg] === 'function' ) {
                d[ arg ].apply( d, Array.prototype.slice.call( args, 1 ));
            }
            
            return this;
        });
    };

})( jQuery );
