/* jshint maxparams: 5 */

(function(W) {
	'use strict';

	var bound = [],
		custom = {},

		/**
		 * Attach specific event logic to element
		 *
		 * @private
		 * @param {(Array|HTMLElement|object|string)} els
		 * @param {object} obj
		 * @param {object} options
		 */
		_bind = function(els, obj, options) {
			// Redefine variables when delegating
			if (options && options.delegate) {
				options.targ = els;
				els = options.delegate;
			}

			// For each element attach events
			W.$each(els, function(el) {
				// Loop through object events
				for (var key in obj) {
					var evts = key.split(' '),
						i = 0;

					for (; i < evts.length; i++) {
						var conf = W.$extend({
								args: [],
								once: false,
								scope: el
							}, options),
							fn = obj[key],
							evt = evts[i],
							ev = evt,
							parts = ev.split('.'),
							f = fn;
						evt = parts[0];

						if (parts.length == 1 && conf.namespace) {
							ev += '.' + conf.namespace;
						}

						// Prepend element to callback arguments if necessary
						if (conf.args[1] !== el) {
							conf.args.unshift(0, el);
						}

						(function(el, evt, fn, f, conf) {
							var cb = function(e) {
								var cont = true;
								conf.args[0] = e;

								// If watch within ancestor make sure the target
								// matches the selector
								if (conf.targ) {
									var targ = conf.targ,
										sel = targ._$ ? targ.sel : targ;

									// Update refs when targeting ref
									if (typeof sel == 'string' &&
										sel.indexOf('ref:') > -1) {
										W.$setRef(el);
									}

									cont = W.$toArray(W.$(sel)).some(function(el) {
										return el.contains(e.target) && (targ = el);
									});

									// Ensure element argument is the target
									conf.args[1] = conf.scope = targ;
								}

								if (cont) {
									W.$exec(fn, conf);

									// Unbind after first execution
									if (conf.once) {
										_off(el, evt, f);
									}
								}
							};

							// Ensure the specified element, event, and function
							// combination hasn't already been bound
							if (evt != 'init' && ! W.events.bound(el, ev, f, conf.targ).length) {
								// Determine if the event is native or custom
								if ('on' + evt in el) {
									el.addEventListener(evt, cb, false);
								} else if (custom[evt]) {
									custom[evt][0](el, fn, conf);
								}

								bound.push({
									el: el,
									ev: ev,
									evt: evt,
									cb: cb,
									fn: f,
									targ: conf.targ
								});
							}

							if (evt == 'init' || conf.init === true) {
								cb();
							}
						})(el, evt, fn, f, conf);
					}
				}
			}, options);
		},

		/**
		 * Detach event(s) from element
		 *
		 * @private
		 * @param {(HTMLElement|string)} [sel]
		 * @param {string} [evt]
		 * @param {function} [fn]
		 */
		_off = function(sel, evt, fn) {
			W.$each(W.events.bound(sel, evt, fn), function(e) {
				if ('on' + e.evt in W._doc) {
					e.el.removeEventListener(e.evt, e.cb);
				} else if (custom[e.evt]) {
					custom[e.evt][1](e.el, e.cb);
				}

				bound.splice(bound.indexOf(e), 1);
			});
		};

	W.events = {
		/**
		 * Bind event function to element
		 *
		 * @param {(HTMLElement|object|string)} target
		 * @param {(object|string)} a - event name or object of events
		 * @param {(function|object)} [b] - event callback or options object
		 * @param {(object|string)} [c] - event options
		 * @param {Array} [c.args] - callback arguments
		 * @param {(HTMLElement|string)} [c.context=document]
		 * @param {(HTMLElement|string)} [c.delegate]
		 * @param {boolean} [c.once=false] - remove event after first execution
		 * @param {object} [c.scope]
		 */
		on: function(target, a, b, c) {
			var evts = [];

			if (W.$isObject(target) && ! target._$) {
				var keys = Object.keys(target),
					i = 0;

				for (; i < keys.length; i++) {
					var key = keys[i];
					evts = target[key];

					_bind(key, evts, a);
				}
			} else {
				if (typeof a == 'string') {
					evts[a] = b;
				} else {
					evts = a;
					c = b;
				}

				_bind(target, evts, c);
			}
		},

		/**
		 * Remove specified event from specified element
		 *
		 * @param {(HTMLElement|string)} [target]
		 * @param {(object|string)} a - event name or object of events
		 * @param {function} [b] - specific function to remove
		 */
		off: function(target, a, b) {
			var obj = a;

			if (a) {
				if (typeof a == 'string') {
					obj = [];
					obj[a] = b;
				}

				for (var key in obj) {
					var evts = key.split(' '),
						i = 0;

					for (; i < evts.length; i++) {
						var evt = evts[i],
							fn = obj[evt];

						_off(target, evt, fn);
					}
				}
			} else {
				_off(target);
			}
		},

		/**
		 * Get currently bound events to optional specified element and event|function
		 *
		 * @param {(boolean|HTMLElement|string)} [target]
		 * @param {string} [event] - event name to match
		 * @param {function} [fn] - specific function to match
		 * @param {HTMLElement} [delegateTarg] - targets of delegated event
		 * @returns {Array} matches
		 */
		bound: function(target, event, fn, delegateTarg) {
			var segs = (event || '').split('.'),
				matches = [];
			target = target || [0];

			W.$each(target, function(el) {
				Object.keys(bound).forEach(function(e) {
					var binding = bound[e],
						parts = binding.ev.split('.'),
						match = true;

					if (el && el !== binding.el) {
						match = false;
					}

					if (event &&
						(
							segs[0] !== '' &&
							segs[0] != parts[0]
						) ||
						(
							segs[1] &&
							segs[1] != parts[1]
						)) {
						match = false;
					}

					if (fn && String(fn) !== String(binding.fn)) {
						match = false;
					}

					// If delegated event, check against target element
					if ((delegateTarg && binding.targ) && delegateTarg.sel !== binding.targ.sel) {
						match = false;
					}

					if (match) {
						matches.push(binding);
					}
				});
			});

			return target ? matches : bound;
		},

		/**
		 * Execute bound event for each matching selection
		 *
		 * @param {(HTMLElement|string)} target
		 * @param {string} name
		 */
		trigger: function(target, name) {
			var fn = function() {};

			this.bound(target, name).forEach(function(e) {
				e.cb({
					target: e.el,
					preventDefault: fn,
					stopPropagation: fn
				});
			});
		},

		/**
		 * Add a custom event
		 *
		 * @param {string} name
		 * @param {function} on
		 * @param {function} off
		 */
		addEvent: function(name, on, off) {
			custom[name] = [on, off];
		}
	};
})(Wee);