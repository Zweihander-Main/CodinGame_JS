const path = require('path');

module.exports = {
	entry: './unleashTheGeek/main.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'unleashTheGeek.js',
	},
	mode: 'none',
};
