/* global config, fs, project */

module.exports = function(grunt) {
	grunt.registerTask('setup', function() {
		// Ensure asset directory exists
		fs.ensureDirSync(config.paths.assets);

		// Create target asset directories
		fs.mkdirsSync(config.paths.css);
		fs.mkdirsSync(config.paths.js);

		// Copy fonts and images as-is for later optimization
		if (fs.existsSync(config.paths.fontsSource)) {
			fs.copySync(config.paths.fontsSource, config.paths.fonts);
		}

		if (fs.existsSync(config.paths.imgSource)) {
			fs.copySync(config.paths.imgSource, config.paths.img);
		}

		// Create source map directory if needed
		if (project.script.sourceMaps === true) {
			fs.mkdirsSync(config.paths.jsMaps);
		}

		// Watch for changes to validate
		if (project.script.validate.watch) {
			grunt.event.on('watch', function(action, file) {
				if (action !== 'deleted') {
					Wee.validate(config, grunt, file);
				}
			});
		}
	});
};