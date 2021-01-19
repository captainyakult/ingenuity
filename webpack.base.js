const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: './src/index.js',
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
				from: 'browserconfig.xml'
			},
			{
				from: 'src/config.js',
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