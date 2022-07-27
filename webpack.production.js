// @ts-nocheck
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.base.js');
const TerserPlugin = require('terser-webpack-plugin');
const CSSAssetsPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common, {
	mode: 'none',
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					keep_classnames: true
				}
			}),
			new CSSAssetsPlugin({})
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		})
	]
});
