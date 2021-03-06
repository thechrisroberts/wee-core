define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		$el,
		el;

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'Chain',

		beforeEach: function() {
			el = document.createElement('div');

			el.id = 'wee';
			el.className = 'js-wee';

			document.body.appendChild(el);

			$el = $(el);
		},

		afterEach: function() {
			el.parentNode.removeChild(el);
		},

		register: {
			jquery: function() {
				$.fn.setId = function(id) {
					this.data('id', id);

					return this;
				};

				$el.setId(3);

				assert.strictEqual($el.data('id'), 3,
					'Chain was not registered successfully'
				);
			},

			regular: function() {
				Wee.$chain('setId', function(id) {
					this.attr('id', id);

					return this;
				});

				$el.setId('idTest');

				assert.strictEqual($el[0].id, 'idTest',
					'Chain was not registered successfully'
				);
			}
		},

		events: {
			on: {
				simple: function() {
					$el.on('click', function() {
						$el.addClass('test-class-1');
					});

					$el.trigger('click');

					assert.ok($el.hasClass('test-class-1'),
						'Event was not bound successfully'
					);
				},

				delegation: function() {
					$el.html(
						'<ul class="parent-list">' +
							'<li class="post">Item 1</li>' +
							'<li class="post">Item 2</li>' +
							'<li class="post">Item 3</li>' +
							'<li class="post">Item 4</li>' +
							'<li class="post">Item 5</li>' +
							'<li class="post">Item 6</li>' +
						'</ul>'
					);

					$('.post').on('click', function(e, el) {
						$(this).text("Clicked");
						e.preventDefault();
					}, {
						delegate: '.parent-list'
					});

					assert.strictEqual(Wee.events.bound('.parent-list')[0].ev, 'click',
						'Click event was not bound to parent element'
					);

					assert.strictEqual(Wee.events.bound('.parent-list')[0].targ[0].className, 'post',
						'Target element was not bound to parent element'
					);
				},

				'multiple events': function() {
					$el.on({
						click: function() {
							$el.addClass('test-class');
						},
						blur: function() {
							$el.removeClass('test-class')
								.addClass('test-class-2');
						}
					});

					$el.trigger('click')
						.trigger('blur');

					assert.ok($el.hasClass('test-class-2'),
						'Multiple events were not triggered successfully'
					);
				}
			},

			off: {
				target: function() {
					Wee.events.on({
						el: {
							click: function() {
								$el.addClass('test-class');
							},
							blur: function() {
								$el.addClass('test-class-2');
							}
						}
					});

					$el.off()
						.trigger('click')
						.trigger('blur');

					assert.notOk($el.hasClass('test-class'),
						'Event was not removed successfully'
					);

					assert.notOk($el.hasClass('test-class-2'),
						'Event was not removed successfully'
					);
				},

				'selection event': function() {
					Wee.events.on({
						'#wee': {
							click: function() {
								$el.addClass('test-class');
							},
							blur: function() {
								$el.addClass('test-class-2');
							}
						}
					});

					$el.off('blur')
						.trigger('click')
						.trigger('blur');

					assert.ok($el.hasClass('test-class'),
						'Event was not removed successfully'
					);

					assert.notOk($el.hasClass('test-class-2'),
						'Event was not removed successfully'
					);
				},

				'selection event callback': function() {
					var callbackFunction = function() {
						$el.removeClass('test-class');
					};

					$el.on('click', function() {
						$el.addClass('test-class');
					});

					$el.trigger('click')
						.off('click', callbackFunction());

					assert.notOk($el.hasClass('test-class-2'),
						'Callback function was not executed successfully'
					);
				}
			},

			trigger: function() {
				$el.on('click', function() {
					$el.addClass('test-class');
				});

				$el.trigger('click');

				assert.ok($el.hasClass('test-class'),
					'Event was not triggered successfully'
				);
			}
		},

		DOM: {
			addClass: {
				single: function() {
					$el.addClass('test-class');

					assert.ok($el.hasClass('test-class'),
						'Single class was not added successfully'
					);
				},

				multiple: function() {
					$el.addClass('test-class-1 test-class-2 test-class-3');

					assert.include($el.attr('class'),
						'test-class-1 test-class-2 test-class-3',
						'Multiple classes were not added successfully'
					);
				}
			},

			'$after': {
				markup: function() {
					$el.after('<span class="test"></span>');

					assert.ok($el.next().hasClass('test'),
						'Test element not added successfully'
					);
				},

				fn: function() {
					$el.after(function() {
						return '<div class="test"></div>';
					});

					assert.ok($el.next().hasClass('test'),
						'Function was not executed successfully'
					);
				}
			},

			append: {
				selection: function() {
					 $el.html('<div class="append-test">Testing</div>');

					 $el.append('<p>Hello</p>');

					 assert.strictEqual($el.text(), 'TestingHello',
					 	'Selection was not appended to correctly'
					 );
				},

				markup: function() {
					$el.append('<div id="test"></div>');

					assert.ok($el.contains('#test'),
						'Test element was not appended successfully'
					);
				},

				fn: function() {
					$el.append(function() {
						return '<div id="test"></div>';
					});

					assert.ok($el.contains('#test'),
						'Test function was not appended successfully'
					);
				}
			},

			appendTo: function() {
				var child = '<div id="test"></div>';

				$(child).appendTo(el);

				assert.ok($el.contains('#test'),
					'Element was not appended to element successfully'
				);
			},

			attr: {
				get: function() {
					assert.strictEqual($el.attr('id'), 'wee',
						'Attribute not was accessed successfully'
					);
				},

				single: function() {
					$el.attr('data-test', 'value');

					assert.strictEqual($el.attr('data-test'), 'value',
						'Attribute not was accessed successfully'
					);
				},

				multiple: function() {
					$el.attr({
						'data-one': 'value1',
						'data-two': 'value2'
					});

					assert.strictEqual($el.attr('data-one'), 'value1',
						'Attribute not was accessed successfully'
					);

					assert.strictEqual($el.attr('data-two'), 'value2',
						'Attribute was not accessed successfully'
					);
				}
			},

			'$before': {
				afterEach: function() {
					$('.test').remove();
				},

				markup: function() {
					$el.before('<span class="test"></span>');

					assert.ok($el.prev().hasClass('test'),
						'Test element not added successfully'
					);
				},

				fn: function() {
					$el.before(function() {
						return '<div class="test"></div>';
					});

					assert.ok($el.prev().hasClass('test'),
						'Function was not executed successfully'
					);
				}
			},

			children: {
				all: function() {
					$el.html('<div></div><div></div>');

					assert.strictEqual($el.children().length, 2,
						'Children were not selected successfully'
					);
				},

				filtered: function() {
					$el.html('<div></div><div></div><span></span>');

					assert.strictEqual($el.children('div').length, 2,
						'Filtered children were not selected successfully'
					);
				}
			},

			clone: function() {
				var $clone = $el.clone();

				assert.ok($clone.hasClass('js-wee'),
					'Element was not cloned successfully'
				);
			},

			closest: function() {
				$el.html('<div class="nav" id="div1"><a class="link__account">Your Account</a></div>' +
					'<div class="nav"><a class="link__about">About Us</a></div>');

				assert.strictEqual($('.link__account').closest('.nav')[0].id, 'div1',
					'Did not get unique closest ancestor'
				);
			},

			contains: function() {
				$el.html('<span id="test"></span>');

				assert.ok($el.contains('#test'),
					'Test element was not selected successfully'
				);
			},

			contents: function() {
				$el.html('<span></span><span></span>');

				assert.strictEqual($el.contents().length, 2,
					'Contents were not selected successfully'
				);
			},

			css: {
				'get value': function() {
					assert.strictEqual($el.css('paddingTop'), '0px',
						'Default value was not retrieved successfully'
					);
				},

				single: function() {
					$el.css('fontSize', '10px');

					assert.strictEqual($el.css('fontSize'), '10px',
						'Single property was not set correctly'
					);
				},

				multiple: function() {
					$el.css({
						marginTop: '10px',
						marginBottom: '5px'
					});

					assert.strictEqual($el.css('marginTop'), '10px',
						'Top margin was not set correctly'
					);

					assert.strictEqual($el.css('marginBottom'), '5px',
						'Bottom margin was not set correctly'
					);
				}
			},

			data: {
				get: {
					beforeEach: function() {
						$el.attr({
							'data-one': '1',
							'data-two': 'true',
							'data-three': 'string'
						});
					},

					all: function() {
						var obj = {
							'one': 1,
							'two': true,
							'three': 'string'
						};

						assert.deepEqual($el.data(), obj,
							'Data references were not selected successfully'
						);
					},

					single: function() {
						assert.strictEqual($el.data('one'), 1,
							'Data reference was not selected successfully'
						);
					}
				},

				set: {
					single: function () {
						$el.data('id', '250');

						assert.strictEqual($el.data('id'), 250,
							'Data reference was not set successfully'
						);
					},

					multiple: function() {
						var obj = {
							id: 350,
							ref: 'reference'
						};

						$el.data(obj);

						assert.deepEqual($el.data(), obj,
							'Data references were not set successfully'
						);
					}
				}
			},

			each: function() {
				$el.html(
					'<div class="test-each">1</div>' +
					'<div class="test-each">2</div>' +
					'<div class="test-each">3</div>'
				);

				$('.test-each').each(function(el, i) {
					$(this).html('Hello ' + i);
				});

				assert.strictEqual($('.test-each')[0].innerHTML, 'Hello 0',
					'Did not return "Hello!" as expected'
				);

				assert.strictEqual($('.test-each')[1].innerHTML, 'Hello 1',
					'Did not return "Hello!" as expected'
				);

				assert.strictEqual($('.test-each')[2].innerHTML, 'Hello 2',
					'Did not return "Hello!" as expected'
				);
			},

			empty: function() {
				$el.html('<span id="test"></span>');

				assert.strictEqual($el.html(), '<span id="test"></span>',
					'Element was not added successfully'
				);

				$el.empty();

				assert.strictEqual(Wee.$('#test').length, 0,
					'Element was not emptied successfully'
				);

				assert.notInclude($el.html(), '<span id="id"></span>',
					'Element was not emptied successfully'
				);
			},

			eq: {
				beforeEach: function() {
					$el.html(
						'<div class="test">1</div>' +
						'<div class="test">2</div>' +
						'<div class="test">3</div>'
					);
				},

				'positive index': function() {
					assert.strictEqual($('.test').eq(1).text(), '2',
						'Element at index 1 was not selected successfully.'
					);

				},

				'negative index': function() {
					assert.strictEqual($('.test').eq(-1).text(), '3',
						'Element with index 3 was not selected successfully.'
					);
				}
			},

			filter: function() {
				$el.html(
					'<span class="test filter"></span>' +
					'<span class="test filter"></span>' +
					'<span class="test"></span>'
				);

				assert.strictEqual($('.test').filter('.filter').length, 2,
					'Filtered elements not returned successfully'
				);
			},

			find: function() {
				$el.html(
					'<span class="test"></span>' +
					'<span class="test-2"></span>' +
					'<span class="test-2"></span>'
				);

				assert.strictEqual($el.find('.test').length, 1,
					'Element was not found successfully'
				);

				assert.strictEqual($el.find('.test-2').length, 2,
					'Elements were not found successfully'
				);
			},

			first: function() {
				$el.html('<div class="test-stuff">1</div><div class="test-stuff">2</div>');

				assert.strictEqual($('.test-stuff').first().text(), '1',
					'First element was not selected successfully.'
				);
			},

			hasClass: {
				single: function() {
					assert.ok($el.hasClass('js-wee'),
						'Class was not detected successfully'
					);
				},

				multiple: function() {
					$el.addClass('test test-2 test-3');

					assert.ok($el.hasClass('test test-2 test-3'),
						'Classes were not detected successfully'
					);
				}
			},

			get: function() {
				$el.html('<div class="get-test">First div</div><div class="get-test">Second div</div>');

				assert.strictEqual($('.get-test').get(0).textContent, 'First div',
					'Did not successfully get correct selection'
				);
			},

			height: {
				get: function() {
					$el.height(100);

					assert.strictEqual($el.height(), 100,
						'Element height not set successfully'
					);
				},

				set: function() {
					$el.height('150px');

					assert.strictEqual($el.height(), 150,
						'Element height not set successfully'
					);
				},

				fn: function() {
					$el.height(100);

					$el.height(function(i, height) {
						return height + 50;
					});

					assert.strictEqual($el.height(), 150,
						'Element height not set successfully'
					);
				}
			},

			hide: function() {
				$el.hide();

				assert.ok($el.hasClass('js-hide'),
					'Element was not hidden successfully'
				);
			},

			html: {
				get: {
					single: function() {
						$el.html('<i>test</i>');

						assert.strictEqual($el.html().toLowerCase(),
							'<i>test</i>',
							'HTML value was not set correctly'
						);
					},

					multiple: function() {
						$el.html('<div></div><div></div>');

						$el.find('div').html('1');

						assert.strictEqual($el.html().toLowerCase(),
							'<div>1</div><div>1</div>',
							'HTML span values not returned successfully'
						);
					}
				},

				set: {
					single: function() {
						$el.html('<h1>test</h1>');

						assert.strictEqual($el.html(),
							'<h1>test</h1>',
							'HTML was not set successfully'
						);
					}
				},

				fn: function() {
					$el.html('test');

					$el.html(function(i, html) {
						return html.toUpperCase();
					});

					assert.strictEqual($el.html(),
						'TEST',
						'Function was not executed successfully'
					);
				}
			},

			index: function() {
				$el.html(
					'<div id="one"></div>' +
					'<div id="two"></div>' +
					'<div id="three"></div>'
				);

				assert.strictEqual($('#three').index(), 2,
					'Incorrect element index returned'
				);

			},

			insertAfter: function() {
				$('<div class="test"></div>').insertAfter($el);

				assert.ok($el.next().hasClass('test'),
					'Element was not added after successfully.'
				);
			},

			insertBefore: function() {
				$('<div class="test"></div>').insertBefore($el);

				assert.ok($el.prev().hasClass('test'),
					'Element was not added before successfully'
				);
			},

			'is': {
				'selection': function() {
					$el.addClass('one');

					assert.ok($el.is('.one'),
						'Element was not successfully identified with "one" class'
					);

					assert.isFalse($el.is(),
						'$is returned false instead of true'
					);
				},

				fn: function() {
					$el.html(
						'<ul class="people">' +
							'<li data-hidden="false">Charlie Kelly</li>' +
							'<li>Dennis Reynolds</li>' +
							'<li>Mac</li>' +
							'<li>Dee Reynolds</li>' +
						'</ul>'
					);

					assert.isTrue($('.people li').is(function(i, el) {
							return $(el).data('hidden') === false;
						}), 'Function executed successfully'
					);
				}
			},

			last: function() {
				$el.html('<div>1</div><div>2</div><div>3</div>');

				assert.strictEqual($el.children().last().text(), '3',
					'Last element content was not returned successfully'
				);
			},

			map: {
				array: function() {
					var mapTest = [1, 2, 3];

					assert.isArray(
						mapTest.map(function(val) {
							return val + 1;
						}), true);

					assert.deepEqual(
						mapTest.map(function(val, i) {
							return val + i;
						}), [1, 3, 5],
					'Did not return correct array');
				},

				selection: function() {
					$el.html('<div class="map-test2">1</div>');

					assert.isArray(
						$('.map-test2').map(function() {
							return 'Map test passed'
						}), 'Map test passed',
						"Did not correctly map selection"
					);

					assert.deepEqual(
						$('.map-test2').map(function() {
							return 'mapping'
						}), ['mapping'],
						"Did not correctly map selection"
					);
				}
			},

			next: function() {
				$el.append('<div id="wee-chain"></div><div id="wee-chain-1"></div>');

				assert.strictEqual($('#wee-chain').next()[0].id, 'wee-chain-1',
					'Next element was not returned successfully'
				);

				$('#wee-chain-1').remove();
			},

			not: {
				'selection': function() {
					$el.html(
						'<span class="testing-not one">1</span>' +
						'<span class="testing-not two">2</span>' +
						'<span class="testing-not three">3</span>'
					);

					assert.isObject($('.testing-not').not('.two'));

					assert.strictEqual($('.testing-not').not('.two')[0].textContent, '1',
						'Filtered elements not returned successfully'
					);
				},

				'fn': function() {
					$el.html(
						'<ul class="people">' +
							'<li>Charlie Kelly</li>' +
							'<li data-hidden="true">Dennis Reynolds</li>' +
							'<li>Mac</li>' +
							'<li>Dee Reynolds</li>' +
						'</ul>'
					);

					var arr = $('.people li').not(function(i, el) {
						return $(el).data('hidden') === true;
					});

					assert.strictEqual(arr.length, 3,
						'Did not filter out selected element'
					);
				}
			},

			'offset': {
				'beforeEach': function() {
					$el.css({
						position: 'absolute',
						top: '-10000px',
						left: '-10000px'
					});
				},

				'get': function() {
					assert.deepEqual($el.offset(), {
						top: -10000,
						left: -10000
					},
						'Offset not returned successfully'
					);
				},

				'set': function() {
					$el.offset({
						top: 100,
						left: 20
					});

					assert.deepEqual($el.offset(), {
						top: 100,
						left: 20
					},
						'Offset value was not set successfully'
					);
				}
			},

			'parent': {
				'selection': function() {
					$el.html('<div id="parent"><p id="child"></p></div>');

					assert.deepEqual($('#child').parent()[0].id, 'parent',
						'Parent was not returned successfully'
					);
				},

				'filtered': function() {
					$el.html('<div id="parent"><p id="child"></p></div>');

					assert.deepEqual($('#child').parent('div')[0].id, 'parent',
						'Parent was not returned successfully'
					);
				}
			},

			'parents': function() {
				$el.html(
					'<span id="child">' +
						'<span id="child-2">' +
							'<span id="child-3"></span>' +
						'</span>' +
					'</span>'
				);

				assert.strictEqual($('#child-3').parents().length, 5,
					'Parents were not returned successfully'
				);
			},

			position: function() {
				var positionValue = {
					top: -10000,
					left: -10000
				};

				$el.css({
					position: 'absolute',
					top: '-10000px',
					left: '-10000px'
				});

				assert.deepEqual($el.position(), positionValue,
					'Position not returned successfully'
				);
			},

			'prepend': {
				'prepend as first element': function() {
					$el.prepend('<span class="testing">First span</span>');

					assert.strictEqual($el.children().first()[0].textContent, 'First span',
						'Element was not correctly prepended as first element'
					);
				},
				'prepend before selection': function() {
					$el.prepend('<span class="testing2">Second span</span>', '<span class="testing"></span>');

					assert.strictEqual($el.children().first()[0].textContent, 'Second span',
						'Element was not correctly prepended as first element'
					);
				},

				fn: function() {
					$el.html(
						'<h1 id="list-heading"></h1>' +
						'<ul id="wee-list">' +
							'<li>Dee Reynolds</li>' +
							'<li>Frank Reynolds</li>' +
						'</ul>'
					);

					$('#list-heading').prepend(function() {
						return '<span>New span</span>';
					});

					assert.strictEqual($('#list-heading').children()[0].textContent, 'New span',
						'Function was not executed successfully'
					);
				}
			},

			'prependTo': function() {
				$el.html('<div id="wee-inner"></div>');

				$('<div id="test1"></div>').prependTo('#wee-inner');
				$('<div id="test2"></div>').prependTo('#wee-inner');

				assert.ok($('#wee-inner').children()[0].id, 'test2',
					'Element was not appended to element successfully'
				);
			},

			'prev': function() {
				$el.append('<div id="wee-chain"></div><div id="wee-chain-1"></div>');

				assert.strictEqual($('#wee-chain-1').prev()[0].id, 'wee-chain',
					'Next element was not returned successfully'
				);

				$('#wee-chain-1').remove();
			},

			'prop': {
				'get': function() {
					$el.html('<input type="radio" class="testing" value="" checked>');

					assert.isTrue($('.testing').prop('checked'),
						'Property was not selected successfully (should have returned as true)'
					);
				},

				'single': function() {
					$el.html('<input id="testProp" type="radio" class="testing" value="">');

					$('.testing').prop('disabled', true);

					assert.isTrue($('.testing').prop('disabled'),
						'Property was not selected successfully'
					);
				},

				'multiple': function() {
					$el.html('<input id="testProp" type="radio" class="testing" value="">');

					$('.testing').prop({
						disabled: true,
						required: true
					});

					assert.isTrue($('.testing').prop('disabled'),
						'Disabled property was not selected successfully'
					);

					assert.isTrue($('.testing').prop('required'),
						'Required property was not selected successfully'
					);
				}
			},

			remove: function() {
				$el.html('<div id="wee-inner"></div>');

				$('#wee-inner').remove();

				assert.strictEqual($('#wee-inner').length, 0,
					'Element was not removed successfully'
				);
			},

			'removeAttr': function() {
				$el.attr('data-test', 'value');

				assert.strictEqual($el.attr('data-test'), 'value',
					'Attribute was not added successfully'
				);

				$el.removeAttr('data-test');

				assert.strictEqual($el.attr('data-test'), null,
					'Attribute was not removed successfully'
				);
			},

			removeClass: {
				single: function() {
					$el.removeClass('js-wee');

					assert.notOk($el.hasClass('js-wee'),
						'Single class was not removed successfully'
					);
				},

				multiple: function() {
					$el.addClass('test test2');

					$el.removeClass('test test2');

					assert.strictEqual($el.attr('class'), 'js-wee',
						'Multiple classes were not removed successfully'
					);
				}
			},

			replaceWith: function() {
				$el.html('<div id="test"></div>');

				$('#test').replaceWith('<span id="test2"></span>');

				assert.ok($el.contains('#test2'),
					'Element was not replaced successfully'
				);
			},

			reverse: function() {
				var revArray = [1, 2, 3];

				assert.deepEqual(revArray.reverse(), [3, 2, 1],
					'Array was not reversed'
				);
			},

			setRef: function() {
				$el.html('<div data-ref="testElement1">1</div>');

				$el.setRef();

				assert.strictEqual($('ref:testElement1')[0].textContent, '1',
					'Reference element was successfully selected.'
				);
			},

			setVar: function() {
				$el.html('<div data-set="testSet" data-value="yes">1</div>');

				$el.setVar();

				assert.strictEqual(Wee.$get('testSet'), 'yes',
					'Data-set variable was not added to datastore'
				);
			},

			'scrollLeft': {
				'get': function() {
					assert.strictEqual($('body').scrollLeft(), 0,
						'Scroll left value not retrieved successfully'
					);
				},

				'set': function() {
					$('body').css('width', '15000px');

					$('body').scrollLeft(10);

					assert.strictEqual($('body').scrollLeft(), 10,
						'Scroll left value not set successfully'
					);
				}
			},

			'scrollTop': {
				'get': function() {
					assert.strictEqual($el.scrollTop(), 0,
						'Scroll top value not retreived successfully'
					);
				},

				'set': function() {
					$('body').css('height', '500px');

					$('body').scrollTop(10);

					assert.strictEqual($('body').scrollTop(), 10,
						'Scroll top value not set successfully'
					);
				}
			},

			'serialize': {
				'standard': function() {
					$el.html(
						'<form action="#" id="wee-chain-id-form">' +
							'<input type="text" name="input" value="inputValue">' +
							'<input type="checkbox" name="checkbox" value="checkboxValue" checked>' +
							'<input type="radio" name="radio1" value="radioValue" checked>' +
							'<select name="select">' +
								'<option value="selectValue1" checked>Option 1</option>' +
								'<option value="selectValue2">Option 2</option>' +
							'</select>' +
							'<select name="optgroup">' +
								'<optgroup>' +
									'<option value="optgroupValue1" checked>Optgroup 1</option>' +
									'<option value="optgroupValue2">Optgroup 2</option>' +
								'</optgroup>' +
							'</select>' +
							'<textarea name="textarea">Text Area</textarea>' +
						'</form>'
					);

					var serializedValue = 'input=inputValue&checkbox=checkboxValue' +
						'&radio1=radioValue&select=selectValue1&' +
						'optgroup=optgroupValue1&textarea=Text+Area';

					assert.strictEqual($('#wee-chain-id-form').serialize(), serializedValue,
						'Form was not serialized successfully'
					);
				},

				'json': function() {
					$el.html(
						'<form action="#" id="wee-chain-id-form">' +
							'<input type="text" name="input" value="inputValue">' +
							'<input type="checkbox" name="checkbox" value="checkboxValue" checked>' +
							'<input type="radio" name="radio1" value="radioValue" checked>' +
							'<select name="select">' +
								'<option value="selectValue1" checked>Option 1</option>' +
								'<option value="selectValue2">Option 2</option>' +
							'</select>' +
							'<select name="optgroup">' +
								'<optgroup>' +
									'<option value="optgroupValue1" checked>Optgroup 1</option>' +
									'<option value="optgroupValue2">Optgroup 2</option>' +
								'</optgroup>' +
							'</select>' +
							'<textarea name="textarea">Text Area</textarea>' +
						'</form>'
					);

					var serializedValue = {
						"input": "inputValue",
						"checkbox": "checkboxValue",
						"radio1": "radioValue",
						"select": "selectValue1",
						"optgroup": "optgroupValue1",
						"textarea": "Text Area"
					};

					assert.deepEqual($('#wee-chain-id-form').serialize(true), serializedValue,
						'Form was not serialized in JSON format successfully'
					);


				}
			},

			'show': function() {
				$el.hide(el);

				assert.ok($el.hasClass('js-hide'),
					'Element was not hidden successfully'
				);

				$el.show();

				assert.notOk($el.hasClass('js-hide'),
					'Element was not shown successfully'
				);
			},

			'siblings': {
				'all': function() {
					$el.html(
						'<p>Sibling paragraph</p>' +
						'<span>Sibling span</span>' +
						'<div id="target-div">Target div</div>'
					);

					assert.strictEqual($('#target-div').siblings().length, 2,
						'All siblings were not retrieved successfully'
					);

					assert.deepEqual($('#target-div').siblings()[0].textContent, 'Sibling paragraph',
						'Expected result did not match actual result'
					);
				},

				'filtered': function() {
					$el.html(
						'<p>Sibling paragraph</p>' +
						'<span>Sibling span</span>' +
						'<div id="target-div">Target div</div>'
					);

					assert.strictEqual($('#target-div').siblings('p').length, 1,
						'All siblings were not retrieved successfully'
					);

					assert.deepEqual($('#target-div').siblings('p')[0].textContent, 'Sibling paragraph',
						'Expected result did not match actual result'
					);
				}
			},

			'slice': {
				'array': function() {
					var arr = [1, 2, 3, 4, 5, 6];

					assert.deepEqual(arr.slice(1, 3), [2, 3],
						'Slice was not performed correctly'
					);
				},

				'string': function() {
					$el.html(
						'<ul class="list">' +
							'<li class="list__item">Red</li>' +
							'<li class="list__item">Green</li>' +
							'<li class="list__item">Blue</li>' +
							'<li class="list__item">Orange</li>' +
						'</ul>'
					);

					assert.strictEqual($('.list__item').slice(0, 2)[1].innerText, 'Green',
						'Second element was not selected successfully'
					);
				}
			},

			'text': {
				'get': function() {
					$el.html('<p>This is some text</p>');

					assert.strictEqual($el.text(), 'This is some text',
						'Text was not retrieved successfully'
					);
				},

				'set': function() {
					$el.html('<span class="text-test"></span>');

					$('.text-test').text('Test 123');

					assert.strictEqual($('.text-test').text(), 'Test 123',
						'Element text was not set successfully'
					);
				},

				'function': function() {
					$el.html(
						'<ul class="list">' +
							'<li class="list__item one">Red</li>' +
							'<li class="list__item two">Green</li>' +
							'<li class="list__item three">Blue</li>' +
							'<li class="list__item four">Orange</li>' +
						'</ul>'
					);

					$('.three').text(function() {
						return 'Purple';
					});

					$('.list__item').text(function(i, text) {
						return text.toUpperCase();
					});

					assert.strictEqual($('.three').text(), 'PURPLE',
						'Text was not changed as expected'
					);
				}
			},

			'toggle': function() {
				$el.toggle();

				assert.ok($el.hasClass('js-hide'),
					'Element was not hidden successfully'
				);

				$el.toggle();

				assert.notOk($el.hasClass('js-hide'),
					'Element was not shown successfully'
				);
			},

			'toggleClass': {
				'single': function() {
					$el.toggleClass('test-class');

					assert.ok($el.hasClass('test-class'),
						'Class was not added successfully'
					);

					$el.toggleClass('test-class');

					assert.notOk($el.hasClass('test-class'),
						'Class was not removed successfully'
					);
				},

				'multiple': function() {
					$el.toggleClass('test-class test-class-2');

					assert.strictEqual($el.attr('class'),
						'js-wee test-class test-class-2',
						'Multiple classes were not toggled successfully'
					);

					$el.toggleClass('test-class test-class-2');

					assert.notStrictEqual($el.attr('class'),
						'js-wee test-class test-class-2',
						'Multiple classes were not toggled successfully'
					);

					assert.notOk($el.hasClass('test-class'),
						'Multiple classes were not toggled successfully'
					);

					assert.notOk($el.hasClass('test-class-2'),
						'Multiple classes were not toggled successfully'
					);
				},

				'fn': function() {
					$el.html('<div class="toggle-test"></div>');

					$('.toggle-test').toggleClass(function(i, className) {
						return ' -is-active';
					});

					assert.isTrue($('.toggle-test').hasClass('-is-active'),
						'Class was not toggled on'
					);

					$('.toggle-test').toggleClass(function(i, className) {
						return ' -is-active';
					});

					assert.isFalse($('.toggle-test').hasClass('-is-active'),
						'Class was not toggled off'
					);
				}
			},

			toArray: function() {
				$el.html(
					'<div class="test-arr">1</div>' +
					'<div class="test-arr">2</div>' +
					'<div class="test-arr">3</div>'
				);

				assert.isArray($('.test-arr').toArray(), true);

				assert.lengthOf($('.test-arr').toArray(), 3,
					'Array was not created properly'
				);
			},

			val: {
				beforeEach: function() {
					$el.html('<input type="text" class="testing" value="test">');
				},

				get: function() {
					assert.strictEqual($('.testing').val(), 'test',
						'Value was not retrieved successfully'
					);
				},

				set: function() {
					$('.testing').val('2');

					assert.strictEqual($('.testing').val(), '2',
						'Value was not set successfully'
					);
				},

				fn: function() {
					$('.testing').val(function(i, value) {
						if (value.length > 3) {
							return 'success';
						}
					});

					assert.ok($('.testing').val(), 'success',
						'Function was not executed successfully'
					);
				}
			},

			width: {
				get: function() {
					$el.width(100);

					assert.strictEqual($el.width(), 100,
							'Element width not set successfully'
					);
				},

				set: function() {
					$el.width('150px');

					assert.strictEqual($el.width(), 150,
							'Element width not set successfully'
					);
				},

				fn: function() {
					$el.width(100);

					$el.width(function(i, width) {
						return width + 50;
					});

					assert.strictEqual($el.width(), 150,
							'Element width not set successfully'
					);
				}
			},

			wrap: function() {
				$el.html(
					'<ul class="list">' +
						'<li class="list__item">Red</li>' +
						'<li class="list__item">Green</li>' +
						'<li class="list__item">Blue</li>' +
						'<li class="list__item">Orange</li>' +
					'</ul>'
				);

				$('.list').wrap('<div class="wrapper"></div>');

				assert.strictEqual($('.list')[0].parentElement.className, 'wrapper',
					'Element was not wrapped successfully'
				);
			},

			wrapInner: function() {
				$el.wrapInner('<div id="test"></div>');

				assert.ok($el.contains('#test'),
					'Element was not wrapped successfully'
				);
			}
		},
		view: {
			render: function() {
				var template = 'My name is {{ firstName }} {{ lastName }}',
					data = {
						firstName: 'John',
						lastName: 'Smith'
					};

				$el.text(template);
				$el.render(data);

				assert.strictEqual($el.text(),
					'My name is John Smith',
					'Template was not parsed successfully'
				);
			}
		}
	});
});