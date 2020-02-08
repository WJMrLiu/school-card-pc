module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  outputDir: "docs",
  // assetsDir: "./static",
  productionSourceMap: false,
  configureWebpack: {
    // 关闭 webpack 的性能提示
    performance: {
      hints: false,
    },
  },
  css: {
    loaderOptions: {
      sass: {
        javascriptEnabled: true,
      },
    },
  },
  devServer: {
    open: true,
    disableHostCheck: true,
    proxy: {
      "/api": {
        // target: "http://107.22.221.120:29818",
        target: "http://107.22.205.8:29818",
        changeOrigin: true,
        pathRewrite: {
          "/api": "",
        },
      },
    },
  },
};
