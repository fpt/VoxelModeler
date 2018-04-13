import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';


interface Config extends webpack.Configuration {
  module: {
    rules: NewUseRule[]
  };
}

interface NewUseRule extends webpack.NewUseRule {
  use: webpack.NewLoader | webpack.NewLoader[];
}

const rules: NewUseRule[] = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: {
      loader: "ts-loader"
    }
  }
];

const config: Config = {
  entry: path.join(__dirname, "./src/App.ts"),
  devtool: "inline-source-map",
  output: {
    path: path.join(__dirname, "./dist"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: `${__dirname}/static/index.html`,
    }),
  ],
  module: { rules }
};

export default config;
