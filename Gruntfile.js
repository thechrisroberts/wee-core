/* global __dirname, global, path */

(function() {
	'use strict';

	module.exports = function(grunt) {
		var LessCssClean = require('less-plugin-clean-css'),
			rootPath = '../../';

		global.version = '3.0.0';

		global.browserSync = require('browser-sync');
		global.fs = require('fs-extra');
		global.path = require('path');
		global.Wee = require('./script/wee').Wee;

		require('./utils');

		global.config = {
			configPath: path.join(
				rootPath,
				grunt.option('config') || 'wee.json'
			),
			rootPath: rootPath
		};

		global.legacy = {};
		global.legacyBuild = [];
		global.legacyConvert = [];
		global.moduleLegacy = [];
		global.reloadPaths = [];
		global.server = {};

		grunt.loadTasks('./build/tasks');

		grunt.initConfig({
			less: {
				options: {
					modifyVars: '<%= config.style.vars %>',
					strictMath: true,
					paths: [
						'<%= config.paths.root %>'
					],
					plugins: [
						new LessCssClean()
					]
				},
				core: {
					files: [
						{
							dest: '<%= config.paths.temp %>wee.css',
							src: '<%= config.paths.temp %>wee.less'
						}
					]
				},
				lib: {
					files: [{
						expand: true,
						cwd: '<%= config.paths.cssSource %>lib',
						dest: '<%= config.paths.css %>lib',
						src: [
							'**/*.{css,less}',
							'!**/*.min.css'
						],
						rename: function(dest, src) {
							return Wee.getMinExtension(dest, src, '.min.css');
						}
					}]
				}
			},
			uglify: {
				options: {
					compress: {
						drop_debugger: false // jshint ignore:line
					}
				},
				core: {
					files: [{
						dest: '<%= config.paths.js %>script.min.js',
						src: '<%= config.script.files %>'
					}]
				},
				lib: {
					files: [{
						expand: true,
						cwd: '<%= config.paths.jsSource %>lib',
						dest: '<%= config.paths.js %>lib',
						src: [
							'**/*.js',
							'!**/*.min.js'
						],
						rename: function(dest, src) {
							return Wee.getMinExtension(dest, src, '.min.js');
						}
					}]
				}
			},
			concat: {
				style: {
					dest: '<%= config.paths.css %>style.min.css',
					src: '<%= config.style.concat %>'
				}
			},
			imagemin: {
				options: {
					progressive: true,
					svgoPlugins: [
						{
							removeViewBox: false
						},
						{
							convertPathData: false
						}
					]
				},
				core: {
					files: [
						{
							expand: true,
							cwd: '<%= config.paths.imgSource %>',
							dest: '<%= config.paths.img %>',
							src: [
								'**/*.{gif,jpg,png,svg}'
							]
						},
						{
							expand: true,
							cwd: '<%= config.paths.modulesSource %>',
							dest: '<%= config.paths.modules %>',
							src: [
								'**/*.{gif,jpg,png,svg}'
							]
						}
					]
				}
			},
			watch: {
				options: {
					spawn: false
				},
				imgCore: {
					files: [
						'<%= config.paths.imgSource %>**/*.{gif,jpg,png,svg}',
						'<%= config.paths.modulesSource %>**/*.{gif,jpg,png,svg}'
					],
					tasks: [
						'newer:imagemin',
						'notify:images'
					]
				},
				scriptCore: {
					files: '<%= config.script.files %>',
					tasks: [
						'uglify:core',
						'notify:script'
					]
				},
				scriptLib: {
					files: [
						'<%= config.paths.jsSource %>lib**/*.js',
						'!<%= config.paths.jsSource %>lib**/*.min.js'
					],
					tasks: [
						'uglify:lib',
						'notify:script'
					]
				},
				styleCore: {
					files: [
						'wee/style/**/*.less',
						'<%= config.paths.cssSource %>custom/**/*.less',
						'!<%= config.paths.temp %>wee.legacy.less'
					],
					tasks: [
						'less:core',
						'concat:style',
						'notify:style'
					]
				},
				styleLib: {
					files: [
						'<%= config.paths.cssSource %>lib/**/*.{css,less}',
						'!<%= config.paths.cssSource %>lib/**/*.min.css'
					],
					tasks: [
						'less:lib',
						'notify:style'
					]
				},
				styleBuild: {
					files: [
						'<%= config.paths.cssSource %>build/**/*.{css,less}'
					],
					tasks: [
						'buildStyle',
						'notify:style'
					],
					options: {
						event: [
							'added',
							'deleted'
						]
					}
				},
				styleBuildUpdate: {
					files: [
						'<%= config.paths.cssSource %>build/**/*.{css,less}'
					],
					tasks: [
						'less:core',
						'concat:style',
						'notify:style'
					],
					options: {
						event: [
							'changed'
						]
					}
				},
				styleConcat: {
					files: [
						'<%= config.paths.temp %>**/*.css'
					],
					tasks: [
						'concat:style',
						'notify:style'
					]
				},
				fontSync: {
					files: [
						'<%= config.paths.fontSource %>**/*.{eot,svg,ttf,woff,woff2}'
					],
					tasks: [
						'syncDirectory:fonts',
						'notify:fonts'
					]
				},
				imgSync: {
					files: [
						'<%= config.paths.imgSource %>**/*.{bmp,webp}'
					],
					tasks: [
						'syncDirectory:images',
						'notify:images'
					]
				},
				assetRemove: {
					files: [
						'<%= config.paths.source %>**/*.{css,less,js,gif,jpg,png,svg}'
					],
					tasks: [
						'rebuild'
					],
					options: {
						event: [
							'deleted'
						]
					}
				},
				project: {
					files: [
						'<%= config.path %>',
						'<%= config.paths.modulesSource %>*/module.json'
					],
					tasks: [
						'default',
						'notify:project'
					]
				}
			}
		});

		grunt.loadNpmTasks('grunt-contrib-concat');
		grunt.loadNpmTasks('grunt-contrib-imagemin');
		grunt.loadNpmTasks('grunt-contrib-less');
		grunt.loadNpmTasks('grunt-contrib-uglify');
		grunt.loadNpmTasks('grunt-contrib-watch');
		grunt.loadNpmTasks('grunt-newer');

		grunt.registerTask('default', [
			'init',
			'cleanup',
			'setup',
			'configStyle',
			'configScript',
			'configGenerator',
			'buildStyle',
			'buildModules',
			'buildLegacy',
			'uglify:core',
			'uglify:lib',
			'imagemin',
			'syncDirectory:fonts',
			'syncDirectory:images'
		]);

		/**
		 * Rebuild only
		 */
		grunt.registerTask('rebuild', [
			'cleanup',
			'setup',
			'buildStyle',
			'buildModules',
			'buildLegacy',
			'uglify:core',
			'uglify:lib',
			'imagemin',
			'syncDirectory:fonts',
			'syncDirectory:images'
		]);

		/**
		 * Build, watch
		 */
		grunt.registerTask('local', [
			'default',
			'proxy',
			'sync',
			'watch'
		]);

		/**
		 * Build, serve, open, watch
		 */
		grunt.registerTask('static', [
			'default',
			'server',
			'sync',
			'watch'
		]);

		/**
		 * Generate static sites
		 */
		grunt.registerTask('generate', [
			'init',
			'configGenerator'
		]);
	};
})();