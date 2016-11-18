define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		el;

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'Screen',

		setup: function() {
			el = document.createElement('style');
			el.textContent = 'html {font-family: "5"}';

			document.head.appendChild(el);
		},

		teardown: function() {
			document.head.removeChild(el);
		},

		size: function() {
			assert.strictEqual(Wee.screen.size(), 5,
				'Screen size should return 5'
			);
		},

		map: {
			single: function() {
				var num = 0;

				$('html').css('font-family', '"2"');

				Wee.screen.map({
					size: 1,
					callback: function() {
						num++;
					}
				});

				assert.strictEqual(num, 0,
					'Screen was not mapped correctly ("num" should be 0)'
				);

				Wee.screen.map({
					size: 2,
					callback: function() {
						num++;
					}
				});

				assert.strictEqual(num, 1,
					'Screen was not mapped correctly ("num" should be 0)'
				);
			},

			once: function() {
				var num = 0;

				$('html').css('font-family', '"2"');

				Wee.screen.map({
					min: 4,
					callback: function() {
						num++;
					},
					once: true
				});

				$('html').css('font-family', '"5"');

				Wee.screen.run();
				Wee.screen.run();

				assert.strictEqual(num, 1,
					'Mapping ran more than once ("num" should equal 1)'
				);
			}
		},

		run: function() {
			var num = 0;

			$('html').css('font-family', '"2"');

			Wee.screen.map({
				min: 5,
				callback: function() {
					num++;
				}
			});

			assert.strictEqual(num, 0,
				'Did not evaluate breakpoint ("num" should be 0)'
			);

			$('html').css('font-family', '"6"');

			Wee.screen.run();

			assert.strictEqual(num, 1,
				'Did not evaluate breakpoint ("num" should be 1)'
			);
		},

		reset: function() {
			var num = 0;

			Wee.screen.map({
				min: 1,
				callback: function() {
					num++;
				},
				namespace: 'testing'
			});

			Wee.screen.reset('testing');

			Wee.screen.run();

			assert.strictEqual(num, 1,
				'Did not evaluate breakpoint ("num" should be 1)'
			);
		},

		run: function() {
			var num = 0;

			Wee.screen.map({
				size: 5,
				callback: function() {
					console.log(num);
					num++;
				}
			});

			Wee.screen.run();

			assert.strictEqual(num, 2,
				'Did not evaluate breakpoint ("num" should be 2)'
			);
		}
	});
});