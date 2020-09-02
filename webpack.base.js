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
		contentBase: ['src', '../pioneer-assets', '../cmts_creator/out/'],
		contentBasePublicPath: ['/', '/assets/static', '/cmts/']
	},
	watchOptions: {
		ignored: '../cmts_creator/out'
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
				from: 'src/favicon.ico'
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