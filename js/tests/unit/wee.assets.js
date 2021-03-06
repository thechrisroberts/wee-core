define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'Assets',

		afterEach: function() {
			Wee.$set('sampleJsLoaded', false);
			Wee.$set('sampleJsLoadedAgain', false);

			Wee.assets.remove([
				'/js/tests/support/sample-files/sample.js',
				'/js/tests/support/sample-files/sample-2.js',
				'/js/tests/support/sample-files/logo.png',
				'/js/tests/support/sample-files/sample.css'
			]);
		},

		// TODO: File path is relative to wee-core. Need solution that
		// TODO: uses conditional path that works with Browsersync as well.
		root: {
			set: function() {
				Wee.assets.root(
					'/js/tests/support/sample-files/'
				);

				assert.strictEqual(Wee.assets.root(),
					'/js/tests/support/sample-files/',
					'Asset root not set successfully'
				);
			},

			get: function() {
				assert.strictEqual(Wee.assets.root(),
					'/js/tests/support/sample-files/',
					'Asset root not retrieved successfully'
				);
			}
		},

		load: {
			'single file': {
				file: function() {
					var promise = this.async(1000);

					Wee.assets.load({
						root: '/js/tests/support/sample-files/',
						files: 'sample.js',
						success: promise.callback(function() {
							assert.isTrue(Wee.$get('sampleJsLoaded'),
								'Sample file not loaded successfully'
							);

							Wee.assets.remove(
								'/js/tests/support/sample-files/sample.js'
							);
						})
					});
				},

				js: function() {
					var promise = this.async(1000);

					Wee.assets.load({
						root: '/js/tests/support/sample-files/',
						js: 'sample.js',
						success: promise.callback(function() {
							assert.isTrue(Wee.$get('sampleJsLoaded'),
								'Sample file not loaded successfully'
							);

							Wee.assets.remove(
								'/js/tests/support/sample-files/sample.js'
							);
						})
					});

					Wee.$set('sampleJsLoaded', false);

					Wee.assets.load({
						root: '/js/tests/support/sample-files/',
						js: 'sample.js',
						cache: false,
						success: promise.callback(function() {
							assert.isTrue(Wee.$get('sampleJsLoaded'),
								'Sample file not loaded successfully'
							);

							Wee.assets.remove(
								'/js/tests/support/sample-files/sample.js'
							);
						})
					});

					Wee.assets.load({
						root: '/js/tests/support/sample-files/',
						js: '404.js',
						group: 'errorGroup',
						error: promise.callback(function() {
							assert.isTrue(true,
								'Error callback executed erroneously'
							);
						})
					});
				},

				twice: function() {
					var promise = this.async(1000);

					Wee.assets.load({
						root: '/js/tests/support/sample-files/',
						js: 'sample.js',
						success: promise.callback(function() {
							assert.isTrue(Wee.$get('sampleJsLoaded'),
								'Sample file not loaded successfully'
							);
						})
					});

					Wee.assets.load({
						root: '/js/tests/support/sample-files/',
						js: 'sample.js',
						success: promise.callback(function() {
							assert.isTrue(Wee.$get('sampleJsLoaded'),
								'Sample file not loaded successfully'
							);
						})
					});
				},

				css: function() {
					var promise = this.async(1000);

					var container = document.createElement('div');

					container.className = 'container';

					document.body.appendChild(container);

					Wee.assets.load({
						root: '/js/tests/support/sample-files/',
						css: 'sample.css',
						success: promise.callback(function() {
							assert.equal(Wee.$css('.container', 'backgroundColor'),
								'rgb(255, 0, 0)',
								'Sample file not loaded successfully'
							);

							Wee.$remove('.container');

							Wee.assets.remove(
								'/js/tests/support/sample-files/sample.css'
							);
						})
					});

					Wee.assets.load({
						root: '/js/tests/support/sample-files/',
						css: '404.css',
						group: 'errorGroup',
						error: promise.callback(function() {
							assert.isTrue(true,
								'Error callback executed erroneously'
							);
						})
					});
				},

				img: function() {
					var promise = this.async(1000);

					Wee.assets.load({
						root: '/js/tests/support/sample-files/',
						img: 'logo.png',
						success: promise.callback(function() {
							Wee.assets.remove(
								'/js/tests/support/sample-files/logo.png'
							);
						})
					});

					var promise = this.async(1000);

					Wee.assets.load({
						root: '/js/tests/support/sample-files/',
						img: '404.png',
						error: promise.callback(function() {
							assert.isTrue(true,
								'Error callback executed erroneously'
							);
						})
					});
				}
			},

			'multiple files': function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/js/tests/support/sample-files/',
					files: [
						'sample.js',
						'sample-2.js'
					],
					success: promise.callback(function() {
						assert.isTrue(Wee.$get('sampleJsLoaded'),
							'Multiple files not loaded successfully'
						);

						assert.isTrue(Wee.$get('sampleJsLoadedAgain'),
							'Multiple files not loaded successfully'
						);

						Wee.assets.remove([
							'/js/tests/support/sample-files/sample.js',
							'/js/tests/support/sample-files/sample-2.js'
						]);
					})
				});
			},

			group: function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/js/tests/support/sample-files/',
					files: 'sample.js',
					group: 'assetsGroup',
					success: promise.callback(function() {
						assert.ok(Wee.assets.ready('assetsGroup'),
							'Asset group not created successfully'
						);

						Wee.assets.remove(
							'/js/tests/support/sample-files/sample.js'
						);

					})
				});
			}
		},

		ready: {
			check: function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/js/tests/support/sample-files/',
					files: 'sample.js',
					success: promise.callback(function() {
						assert.isTrue(Wee.$get('sampleJsLoaded'),
							'Asset was not set successfully'
						);

						Wee.assets.remove(
							'/js/tests/support/sample-files/sample.js'
						);
					})
				});
			},

			'check and set': function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/js/tests/support/sample-files/',
					files: 'sample.js',
					group: 'assetsGroup',
					success: promise.callback(function() {
						Wee.assets.ready('assetsGroup', {
							success: promise.callback(function() {
								assert.ok(Wee.assets.ready('assetsGroup'),
									'Asset group was not created successfully'
								);

								Wee.assets.remove(
									'/js/tests/support/sample-files/sample.js'
								);
							})
						});
					})
				});
			},

			poll: function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/js/tests/support/sample-files/',
					files: 'sample.js',
					group: 'assetsGroup',
					success: promise.callback(function() {
						Wee.assets.ready('assetsGroup', {
							success: promise.callback(function() {
								assert.ok(Wee.assets.ready('assetsGroup'),
									'Asset group was not created successfully'
								);

								Wee.assets.remove(
									'/js/tests/support/sample-files/sample.js'
								);
							})
						}, true);
					})
				});
			}
		}
	});
});