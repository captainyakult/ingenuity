const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'script.js'
	},
	resolve: {
		alias: {
			'es6-ui-library': path.resolve(__dirname, '../es6-ui-library'),
			'pioneer': path.resolve(__dirname, '../pioneer/engine'),
			'pioneer-scripts': path.resolve(__dirname, '../pioneer/scripts')
		}
	},
	devServer: {
		static: [
			{ directory: '../pioneer/assets', publicPath: '/assets/static' },
			{ directory: '../bh3/data', publicPath: '/assets/dynamic', watch: false }
		]
	},
	stats: {
		assets: false,
	},
	module: {
		rules: [
			{
				test: /\.(svg|html)$/,
				use: 'raw-loader'
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							url: false
						}
					}
				]
			}
		]
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [{
				from: 'src/index.html',
			},
			{
				from: 'src/info.html',
			},
			{
				from: 'src/android-chrome-192x192.png'
			},
			{
				from: 'src/android-chrome-384x384.png'
			},
			{
				from: 'src/apple-touch-icon-precomposed.png'
			},
			{
				from: 'src/apple-touch-icon.png'
			},
			{
				from: 'src/mstile-150x150.png'
			},
			{
				from: 'src/favicon-194x194.png'
			},
			{
				from: 'src/favicon-32x32.png'
			},
			{
				from: 'src/favicon-16x16.png'
			},
			{
				from: 'src/safari-pinned-tab.svg'
			},
			{
				from: 'src/favicon.ico'
			},
			{
				from: 'src/site.webmanifest'
			},
			{
				from: 'src/browserconfig.xml'
			},
			{
				from: 'src/config.js',
				noErrorOnMissing: true
			},
			{
				from: '../es6-ui-library/src/themes/default',
				to: 'assets/themes/default',
				noErrorOnMissing: true
			},
			{
				from: '../es6-ui-library/src/themes/solar-system',
				to: 'assets/themes/solar-system',
				noErrorOnMissing: true
			},
			{
				from: 'src/assets',
				to: 'assets',
				noErrorOnMissing: true
			}]
		}),
		new MiniCssExtractPlugin({
			filename: 'mars2020.css',
			chunkFilename: '[id].css'
		})
	]
};