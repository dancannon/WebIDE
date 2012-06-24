define(['jquery'], function($) {
	var mouseHandled = false;
	$(document).mouseup(function(e) {
		mouseHandled = false;
	});

	// the semi-colon before function invocation is a safety net against concatenated 
	// scripts and/or other plugins which may not be closed properly.
	;
	(function($, window, document, undefined) {

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.
		// window and document are passed through as local variables rather than globals
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).
		// Create the defaults once
		var pluginName = 'mousetools',
			defaults = {
				distance: 1,
				delay: 0,
				onMouseCapture: function() {
					return true;
				},
				onMouseDown: function() {
					return true;
				},
				onMouseDrag: function() {
					return true;
				},
				onMouseUp: function() {
					return true;
				}
			};

		// The actual plugin constructor

		function MouseTools(element, options) {
			this.element = element;

			// jQuery has an extend method which merges the contents of two or 
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.options = $.extend({}, defaults, options);

			this._defaults = defaults;
			this._name = pluginName;

			this.init();
		}

		MouseTools.prototype.init = function() {
			var that = this;
			$(this.element).bind('mousedown.mousetools', function(event) {
				return that._mouseDown(event);
			}).bind('click.mousetools', function(event) {
				if (true === $.data(event.target, 'preventClickEvent.mousetools')) {
					$.removeData(event.target, 'preventClickEvent.mousetools');
					event.stopImmediatePropagation();
					return false;
				}
			});

			this.started = false;
		};

		MouseTools.prototype.destroy = function() {
			$(this.element).unbind('.mousetools');
		};

		MouseTools.prototype._mouseDown = function(event) {
			// don't let more than one widget handle mouseStart
			if (mouseHandled) return;

			// we may have missed mouseup (out of window)
			(this._mouseStarted && this._mouseUp(event));

			this._mouseDownEvent = event;
			var that = this,
				btnIsLeft = (event.which == 1);

			if (!btnIsLeft || !this.options.onMouseCapture(event)) {
				return true;
			}

			this.mouseDelayMet = !this.options.delay;
			if (!this.mouseDelayMet) {
				this._mouseDelayTimer = setTimeout(function() {
					that.mouseDelayMet = true;
				}, this.options.delay);
			}

			if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
				this._mouseStarted = (this.options.onMouseDown(event) !== false);
				if (!this._mouseStarted) {
					event.preventDefault();
					return true;
				}
			}

			this.startPosition = {
				pageX: event.pageX,
				pageY: event.pageY
			};
			this.lastPosition = this.startPosition;

			// Click event may never have fired (Gecko & Opera)
			if (true === $.data(event.target, 'preventClickEvent.mousetools')) {
				$.removeData(event.target, 'preventClickEvent.mousetools');
			}

			// these delegates are required to keep context
			_mouseMoveDelegate = function(event) {
				return that._mouseMove(event);
			};
			_mouseUpDelegate = function(event) {
				return that._mouseUp(event);
			};
			$(document).bind('mousemove.mousetools', _mouseMoveDelegate).bind('mouseup.mousetools', _mouseUpDelegate);

			event.preventDefault();

			mouseHandled = true;
			return true;
		};

		MouseTools.prototype._mouseMove = function(event) {
			// IE mouseup check - mouseup happened when mouse was out of window
			if ($.browser.msie && document.documentMode < 9 && !event.button) {
				return this._Up(event);
			}

			if (this._mouseStarted) {
				this.triggerMouseDrag(event);

				this.lastPosition = {
					pageX: event.pageX,
					pageY: event.pageY
				};
				
				return event.preventDefault();
			}

			if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
				this._mouseStarted = (this.options.onMouseDown(this._mouseDownEvent, event) !== false);

				if (this._mouseStarted) {
					this.triggerMouseDrag(event);
				} else {
					this._mouseUp(event);
				}

				this.lastPosition = {
					pageX: event.pageX,
					pageY: event.pageY
				};
			}

			return !this._mouseStarted;
		};

		MouseTools.prototype._mouseUp = function(event) {
			$(document).unbind('mousemove.mousetools', this._mouseMoveDelegate).unbind('mouseup.mousetools', this._mouseUpDelegate);

			if (this._mouseStarted) {
				this._mouseStarted = false;

				if (event.target == this._mouseDownEvent.target) {
					$.data(event.target, 'preventClickEvent.mousetools', true);
				}

				this.options.onMouseUp(event);
			}

			return false;
		};

		MouseTools.prototype.triggerMouseDrag = function(event) {
			this.options.onMouseDrag(event);

			var dragEvent = new Event("mousedrag");
			dragEvent.startPosition = this.startPosition;
			dragEvent.lastPosition  = this.lastPosition;
			dragEvent.endPosition   = {
				pageX: event.pageX,
				pageY: event.pageY
			};

			$(this.element).trigger(dragEvent);
		};

		MouseTools.prototype._mouseDistanceMet = function(event) {
			return (Math.max(
			Math.abs(this._mouseDownEvent.pageX - event.pageX), Math.abs(this._mouseDownEvent.pageY - event.pageY)) >= this.options.distance);
		};

		MouseTools.prototype._mouseDelayMet = function(event) {
			return this.mouseDelayMet;
		};

		// A really lightweight plugin wrapper around the constructor, 
		// preventing against multiple instantiations
		$.fn[pluginName] = function(options) {
			return this.each(function() {
				if (!$.data(this, 'plugin_' + pluginName)) {
					$.data(this, 'plugin_' + pluginName, new MouseTools(this, options));
				}
			});
		};
	})(jQuery, window, document);
});