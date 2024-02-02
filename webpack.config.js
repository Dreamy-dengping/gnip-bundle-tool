const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "index.js",
    clean: true,
    libraryTarget: "commonjs",
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.m?js$/, // 匹配.mjs文件
        // include: /src/,
        use: "babel-loader",
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: /src/,
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  mode: "production",
};
