const path = require("path");

module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "index.js",
    clean: true,
    libraryTarget: "commonjs",
    // library: {
    //   name: "bundleUtil",
    //   type: "commonjs",
    // },
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: /src/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  mode: "production",
};
