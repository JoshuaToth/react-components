const extend = require('extend');
const UglifyPlugin = require('uglifyjs-webpack-plugin');
const _ = require('underscore');
const pkg = require("./package.json");
const webpack = require("webpack");
var baseConfig = require('./webpack.config');

module.exports = extend(true, baseConfig, {
	plugins: baseConfig.plugins.concat([
		new UglifyPlugin({
			comments: false,
			sourceMap: true,
			mangle: {
				props: {
					regex: /^__/
				}
			}
		}),
		new webpack.BannerPlugin('I totally didnt copy something as a reference. version ' + pkg.version)
	])
});