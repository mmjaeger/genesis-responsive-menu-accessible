// Responsive menu(s) for HTML5 Genesis themes - with updating skip links - the skip links must follow the pattern established in Genesis core.
// Based on http://robincornett.com/genesis-responsive-menu/
// Usage: $( '.nav-primary' ).ResponsiveNavigation() or $( 'nav' ).ResponsiveNavigation() for all navigations
// Allows to enable closeMenuOnClick outside menu and sticky navigation

( function ( window, document, $, undefined ) {

	var pluginName = 'ResponsiveNavigation';
	var defaults   = {
	
		mainMenuButtonClass	: 'menu-toggle',
		mainMenuButtonText	: 'Menu',
		subMenuButtonClass	: 'sub-menu-toggle',
		subMenuButtonText	: 'Menu',
		animSpeed		: 'fast',
		closeOnClickOutside	: true,
		collapseOnClose		: true,
		enableStickyNav		: true, 
		stickyNavSelector	: 'nav-primary'
	
	};
	
	
	function Plugin( element, options ) {
		
		this.element 			= element;
		this.options 			= $.extend( {}, defaults, options );
		
		if ( typeof NavigationL10n != 'undefined' ) {
			this.options.mainMenuButtonText = NavigationL10n.mainMenu || this.options.mainMenuButtonText;
			this.options.subMenuButtonText  = NavigationL10n.subMenu  || this.options.subMenuButtonText;
		}
		
		this.isVisibleMobile	= false;
		this.navElOffsetTop		= false;
		
		this.init();
	
	}
	
	
	Plugin.prototype = {
		
		init: function() {
		
			self = this;
						
			var menuButton = $( '<button />', {
				'class' 		: self.options.mainMenuButtonClass,
				'aria-expanded'	: false,
				'aria-pressed' 	: false,
				'role' 			: 'button'
				} )
				.append( this.options.mainMenuButtonText );
				
			var subMenuButton = $( '<button />', {
				'class' 		: self.options.subMenuButtonClass,
				'aria-expanded' : false,
				'aria-pressed' 	: false,
				'role' 			: 'button'
				} )
				.append( $( '<span />', {
					'class' 	: 'screen-reader-text',
					text 		: self.options.subMenuButtonText
				} ) );
							
			// Add btns to DOM	
			this.element.before( menuButton );
			$( '.sub-menu', this.element ).before( subMenuButton );
			
			// No mobile menu found
			if ( ! $( '.' + self.options.mainMenuButtonClass ).length )
				return;	
			
			
			self.addClassID();
			self.addSticky();			
			self.addEvents();
			
		},
		
		
		// Wrap all nav elements (text, button, nav) for sticky navigation
		addSticky: function() {
		
			if ( self.options.enableStickyNav ) {			
				$( '.' + self.options.stickyNavSelector )
					.add( $( '.' + self.options.stickyNavSelector )
					.prev( '.screen-reader-text' ) )
					.wrapAll( '<div class="'+self.options.stickyNavSelector+'-container"></div>' );
			}
		
		},
		
		
		// Add nav class and ID to mainMenuButton
		addClassID: function() {
			
			// Array with btnIDs
			var arr = [];
			
			$( '.' + this.options.mainMenuButtonClass ).each( function() {
				
				var nav  = $( this ).next( 'nav' );								
				var attr = 'class';
				
				// Add class to button				
				$( this ).addClass( $( nav ).attr( 'class' ) );
				
				if ( $( nav ).attr( 'id' ) )
					attr = 'id';
				
				// Set btnID and check for duplicates
				var btnID = 'mobile-' + $( nav ).attr( attr );
				
				// Add btnID to Array and check for duplicates
				arr.push( btnID );
				
				var cnt = arr.filter( function( value ) {
					return value == btnID;
				}).length -1;
				
				if ( cnt > 0 )
					btnID = btnID + '-' + cnt;											
								
				// Add btnID to button				
				$( this ).attr( 'id', btnID ); 
			
			});
			
		},
		
		
		// Add events
		addEvents: function() {
						
			$( window ).on( 'resize', function(e) { self.doResize(); }).triggerHandler( 'resize' );
			
			if ( self.options.enableStickyNav )
				$( window ).on( 'scroll', function(e) { self.doSticky(); });
			
			if ( self.options.closeOnClickOutside )
				$( document ).on( 'click', function(e) { self.menuOutside( e ) });
			
			$( '.' + this.options.mainMenuButtonClass ).on( 'click', function(e) { self.mainmenuToggle( e ) });
			$( '.' + this.options.subMenuButtonClass ).on( 'click', function(e) { self.submenuToggle( e ) });
		
		},
		
		
		// Close menu on document click
		menuOutside: function( e ) {
						
			var btn = $( '.' + self.options.mainMenuButtonClass + '.activated' );
			
			if ( ! $( btn ).length )
				return;
			
			if ( ! $( btn ).is( $( e.target ) ) && ! $( e.target ).closest( 'nav' ).length )
				$( btn ).trigger( 'click' );
			
		},
		
		
		// Change skiplinks and superfish
		doResize: function() {
			
			var btn = $( '.' + self.options.mainMenuButtonClass ).get(0);
			if ( ! $( btn ).length )
				return;
				
			this.isVisibleMobile = $( btn ).is( ':visible' );
									
			self.superfishToggle();
			self.changeSkipLink();
			self.breakpointChange();
			
		},
		
		
		// Add sticky navigation
		doSticky: function() {
		
			var navEl 		= $( '.' + self.options.stickyNavSelector + '-container' );
			var stickClass	= self.options.stickyNavSelector + '-stick';
			
			if ( ! this.navElOffsetTop )
				this.navElOffsetTop	= $( navEl ).offset().top;
			
			var scrollTop = $( window ).scrollTop();
			
			if ( scrollTop > this.navElOffsetTop ) {
				if ( ! navEl.hasClass( stickClass ) ) {
					$( 'body' ).css( 'padding-top', navEl.height() );
					navEl.addClass( stickClass );
				}
			} else {
				if ( navEl.hasClass( stickClass ) ) {
					$( 'body' ).removeAttr( 'style' );
					navEl.removeClass( stickClass );
					this.navElOffsetTop = false;
				}
			}
		
		},
		
		
		// Action to happen when mainMenuButton is clicked
		mainmenuToggle: function(e) {
			
			var btn = e.target;
			
			if ( $( btn ).hasClass( 'activated' ) && self.options.collapseOnClose )
				self.collapseOnClose( btn );
						 
			self.toggleAria( btn, 'aria-pressed' );
			self.toggleAria( btn, 'aria-expanded' );
			$( btn ).toggleClass( 'activated' ).next( 'nav' ).slideToggle( self.options.animSpeed );
						
		},
		
		
		// Action to happen when subMenuButton is clicked
		submenuToggle: function(e) {

			var btn = e.target;
			
			self.toggleAria( btn, 'aria-pressed' );
			self.toggleAria( btn, 'aria-expanded' );
			$( btn ).toggleClass( 'activated' ).next( '.sub-menu' ).slideToggle( self.options.animSpeed );
	
			var others = $( btn ).closest( '.menu-item' ).siblings();
			others
				.find( '.' + self.options.subMenuButtonClass )
				.removeClass( 'activated' )
				.attr( 'aria-pressed', 'false' )
				.attr( 'aria-expanded', 'false' );
			
			others.find( '.sub-menu' ).slideUp( self.options.animSpeed );
								
		},
		
		
		// Collapse submenu on close
		collapseOnClose: function( btn ) {
						
			var activeSubs = $( btn ).next( 'nav' ).find( '.' + self.options.subMenuButtonClass + '.activated' );
			$( activeSubs ).each( function() {
			
				$( this )
					.removeClass( 'activated' )
					.attr( 'aria-pressed', false )
					.attr( 'aria-expanded', false )
					.next( '.sub-menu' )
					.removeAttr( 'style' );
			
			});
					
		},
		
		
		// Activate/deactivate superfish
		superfishToggle: function () {
			
			// Check for superfish
			if ( typeof $( '.js-superfish' ).superfish !== 'function' )
				return;
			
			if ( ! this.isVisibleMobile ) {				
				
				$( '.js-superfish' ).superfish( {
					'delay'			: 100,
					'animation'		: { 'opacity': 'show', 'height': 'show' },
					'dropShadows'	: false
				});
				
			} else {
			
				$( '.js-superfish' ).superfish( 'destroy' );

			}
				
		},
		
		
		// Modify skiplinks to match mobile buttons
		changeSkipLink: function( btnID ) {
			
			var startLink = 'genesis-nav';
			var	endLink   = 'mobile-genesis-nav';
			
			if ( ! this.isVisibleMobile ) {
				startLink = 'mobile-genesis-nav';
				endLink   = 'genesis-nav';
			}
			
			$( '.genesis-skip-link a[href^="#' + startLink + '"]' ).each( function() {
				var link = $( this ).attr( 'href' );
				link = link.replace( startLink, endLink );
				$( this ).attr( 'href', link );
			});
					
		},
		
		
		// Breakpoint change
		breakpointChange: function() {
					
			if ( this.isVisibleMobile )
				return;
										
			$( [ $( '.' + self.options.mainMenuButtonClass ), $( '.' + self.options.subMenuButtonClass ) ] ).each( function() {
				$( this ).removeClass( 'activated' )
				.attr( 'aria-expanded', false )
				.attr( 'aria-pressed',  false );			
			});			
				
			
			$( [ self.element, $( '.sub-menu', self.element ) ] ).each(function(){
				$( this ).removeAttr( 'style' );
			});
						
		},
		
		
		// Toggle aria attributes
		toggleAria: function( el, attr ) {
			
			$( el ).attr( attr, function( index, value ) {
				return self.ariaReturn( value );
			});
			
		},
		
		
		// Update aria attribute value
		ariaReturn: function( value ) {
			return 'false' === value ? 'true' : 'false';
		}
	
	};
	
	
	$.fn[pluginName] = function( options ) {
	
		if ( ! $.data( this, 'plugin_' + pluginName ) )
			$.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
			
		return this;
		
	}
	
	// Document ready
	/*$( document ).ready( function() {
			
		$( '.nav-primary' ).ResponsiveNavigation();
		
	});*/

})( window, document, jQuery );
