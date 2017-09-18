const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const DtsBundlerPlugin = require('dtsbundler-webpack-plugin');
const glob = require("glob");
const moduleName = "index";
const entry = {};
entry[moduleName] = './src/index.tsx';

module.exports = {
	entry: entry,
	output: {
		filename: '[name].js'
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.ts(x?)$/,
				exclude: [/node_modules/],
				loader: 'ts-loader'
			},
			{
				test: /\.sass/,
				exclude: [/node_modules/],
				use: ['style-loader', 'css-loader?minimize=true', 'sass-loader']
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({template: './src/index.html'}),
		new ScriptExtHtmlWebpackPlugin({defaultAttribute: 'async'}),
		new DtsBundlerPlugin({out: moduleName + '.d.ts'})
	],
	resolve: {
		extensions: ['.html', '.ts', '.tsx', '.js', '.scss', '.css']
	}
};