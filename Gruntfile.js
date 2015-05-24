module.exports = function(grunt) {

  grunt.initConfig({
    nodewebkit: {
      options: {
        version: '0.12.2',
        platforms: ['win', 'linux'],
        credits: './build_files/Credits.html',
        macIcns: './build_files/icon.icns',
        buildDir: '/Users/pavel/postbird_build',
        cacheDir: '/Users/pavel/postbird_build/cache',
      },
      src: ['./**/*', '!./node_modules/grunt/**/*', '!./node_modules/grunt-node-webkit-builder/**/*',
            '!./build_files/**/*', '!./node_modules/fibers/**/*', '!./tests/**/*']
    },
  });

  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.registerTask('default', ['nodewebkit']);
};
