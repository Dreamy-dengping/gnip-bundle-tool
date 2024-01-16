## 描述

nodejs 脚本工具，动态可配置灵活批量打包，解放手动打包的痛苦和出错的可能性

## 安装

```
yarn add gnip-bundle-tool
```

## 使用
最后使用node xxx.js （对应的这个文件）
```js
//导入包
const { start } = require("gnip-bundle-tool");
const path = require("path");

// 需要打包项目的git分支，git地址，node版本映射信息
/**
 * @Description
 * @Author dengping
 * @Date 2023/12/22 13:48:36
 * @param { string }  gitUrl git项目克隆地址
 * @param { string }  branchOrTag 需要拉取的分支或者tag
 * @param { string }  nodeVersion node版本，默认14.21.3
 * @param { string }  mergeBranch 拉取后需要合并的远程分支名注意（带origin/xxx)
 * @param { string }  mergeTag 拉取后需要合并的远程tag
 **/
// 资产项目（必改）
const gitProjectMap = {
  "dsep-web-home-page": {
    gitUrl:
      "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/dsep-web-home-page.git",
    branchOrTag: "master",
    nodeVersion: "",
  },
  "fe-cisdigital-data-standard": {
    gitUrl:
      "https:git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-data-standard.git",
    branchOrTag: "release-3.7.0-11_30-20231218",
    nodeVersion: "",
  },
  "fe-cisdigital-assets-config-management": {
    gitUrl:
      "https:git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-assets-config-management.git",
    branchOrTag: "release-3.7.0-11_30-20231218",
    nodeVersion: "16.14.0",
  },
  "fe-qbee-layout": {
    gitUrl: "https:git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-qbee-layout.git",
    branchOrTag: "private/merge-test",
    nodeVersion: "",
    mergeBranch: "",
    //mergeTag: "release_3.1.8.0-2_20231218",
  },
};
// 默认node版本（必改）
const defaultNodeVersion = "14.21.3";
// 输入的项目目录，自行复制文件目录输出位置（必改）
const outputPutDir = path.resolve("C:\\Users\\Y00043\\Desktop");
/* 
--------以下配置可根据自身项目条件更改
 */
//最后项目打包后需要归并的文件后缀（公司项目为.tar.gz的压缩包)
const suffixReg = /\.tar\.gz/;
// 输入的文件名称
const outputFileName = "dsep";
// 输入压缩包类型
const compressType = "zip";
// 单个脚手架项目打包后的输入的文件名
const buildName = "build";
//工作空间路径(git clone 、打包的暂存区，打包完成输出后，会清空对应文件)
const workSpacesPath = path.resolve(__dirname, "../../workspaces");
// 项目名映射
const projectList = Object.keys(gitProjectMap);
// 是否并发执行(默认串联执行),注意：并发执行效率更高,cpu占用资源更多，可能过多项目会出现主机卡死情况（node版本不同可能存在问题）
const isConcurrentExecute = false;
start({
  projectList,
  suffixReg,
  outputPutDir,
  outputFileName,
  compressType,
  buildName,
  workSpacesPath,
  gitProjectMap,
  isConcurrentExecute,
  defaultNodeVersion,
});
```

## 支持功能

- 动态 node 版本
- 打包输入到本机任意目录
- 动态根据分支或者 tag 打包
- 支持合并分支、tag
- 可配置并发执行或者链式执行
- 拉取远程代码在打包后不占用本地磁盘空间，打包完成后自动清空工作空间
- 支持串行或者并发打包

## 后续即将支持的功能

- 自动化上传服务器进行部署（暂未支持）
- 可视化配置（暂未支持）
- docker 容器隔绝技术（暂未支持）

## 注意事项

- 使用 node 切换版本的需要提前下载 nvm 工具
- 对应项目自己的 git 账户一定要有权限拉取
- 依赖下载报错需自己检查日志处理
- 并发执行，自己电脑的配置要够高才行，不然直接卡死机（慎用）
