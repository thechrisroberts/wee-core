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

		map: function() {
			// TODO: Complete
			assert.strictEqual(Wee.screen.map({
					size: 1,
					callback: function() {}
				}), undefined,
				'Single event was not mapped successfully'
			);

			assert.strictEqual(Wee.screen.map([{
					size: 1,
					callback: function() {}
				}, {
					size: 2,
					callback: function() {}
				}]), undefined,
				'Multiple events were not mapped successfully'
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