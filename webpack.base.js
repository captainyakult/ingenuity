const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: './src/app.js',
	output: {
		filename: 'script.js'
	},
	resolve: {
		extensions: ['.js']
	},
	devServer:{
		contentBase: 'src',
		watchContentBase: true
	},
	watchOptions: {
		aggregateTimeout: 1000,
		poll: 1000,
	},
	module: {
		rules: [{
			test: /\.(css|svg|html)$/,
			use: 'raw-loader'
		}]
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [{
				from: 'src/index.html'
			}, {
				from: 'src/style.css'
			}, {
				from: 'src/config.js',
				noErrorOnMissing: true
			}, {
				from: 'src/assets',
				to: 'assets',
				noErrorOnMissing: true
			}]
		})
	]
};