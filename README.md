## 描述

nodejs 脚本工具，动态可配置灵活批量打包，解放手动打包的痛苦和出错的可能性

## 安装

```
新建一个项目目录
npm init -y
yarn add gnip-bundle-tool
```

## 使用

新建 test.js，加入以下代码，自行更改部分必要配置

```js
//导入包
const { start } = require("gnip-bundle-tool");
const path = require("path");

/**
 * @Description
 * @param { string }  gitUrl git项目克隆地址(https的地址)
 * @param { string }  branch 需要拉取的分支
 * @param { string }  tag 需要拉取的tag(tag和branch二者都存在则使用branch)
 * @param { boolean }  isBundleFile 打包后取文件夹还是压缩包
 * @param { boolean }  isClearCache 打包是否清理缓存文件
 * @param { string }  nodeVersion node版本，默认14.21.3
 * @param { string }  mergeBranch 拉取后需要合并的远程分支名注意（带origin/xxx)
 * @param { string }  mergeTag 拉取后需要合并的远程tag
 **/
// 项目映射（必改）
const gitProjectMap = {
  xxx: {
    gitUrl: "https://xxx.git",
    branch: "private/merge-test",
    nodeVersion: "",
    mergeBranch: "",
    isBundleFile: true,
    isClearCache: true,
  },
  git项目名: {
    gitUrl: "远程分支克隆地址",
    tag: "需要拉取的分支或者tag",
    nodeVersion: "node版本，默认14.2.3",
    mergeTag: "拉取后需要合并的远程tag",
  },
};
// 启动函数
start({
  gitProjectMap, //项目配置项
  suffixReg: /\.tar\.gz/, //最后项目打包后需要归并的文件后缀（公司项目为.tar.gz的压缩包)
  defaultNodeVersion: "14.21.3", //默认node版本
  outputFileName: "数据治理-3.10正式-test", //输出的文件名称
  compressType: "zip", //压缩包类型
  buildName: "build", //单个脚手架项目打包后的输入的文件名
  outputPutDir: path.resolve("D:\\bundles"), //输入的项目目录（自行复制文件目录输出位置）
  workSpacesPath: path.resolve(__dirname, "./workspaces"), //工作空间路径(git clone 、打包的暂存区，打包完成输出后，会清空对应文件)
  isConcurrentExecute: false, //是否并发执行(默认串联执行),注意：并发执行效率更高,cpu占用资源更多，可能过多项目会出现主机卡死情况
  isClearWorkSpace: false, //是否需要清理工作空间(优先级高于单个项目配置的清理字段isClearCache)
  isZipBundleFile: false, //是否打包后压缩打包文件并且删除文件夹
});
```

## 支持功能

- 动态 node 版本
- 打包输入到本机任意目录
- 动态根据分支或者 tag 打包
- 支持合并分支、tag
- 可配置并发执行或者链式执行
- 拉取远程代码在打包后不占用本地磁盘空间，打包完成后自动清空工作空间
- 支持串行或者并发打包(并发打包不支持缓存)
- 支持可配置缓存打包文件或者清理工作空间（大大减少打包时间,同时缓存会占用一定的磁盘空间）
- 支持可配置是否自动压缩替换打包后的项目

## 后续即将支持的功能

- 自动化上传服务器进行部署（暂未支持）
- docker 容器隔绝技术（暂未支持）

## 注意事项（使用必读）

- 使用 node 切换版本的需要提前下载 nvm 工具
- 对应项目自己的 git 账户一定要有权限拉取
- 依赖下载报错需自己检查日志处理
- 并发执行，自己电脑的配置要够高才行，不然直接卡死机（慎用）
- 并发执行的项目请确保 node 版本一致，不同 node 版本批量打包会出现环境冲突等问题，可多次分批次批量打包 node 版本相同的项目
- 使用的 node 版本确保自己本地一定要有，不然直接报错
- 工作空间最好不要和脚本文件同级，依赖下载和打包后，可能会出现文件缓存清理不干净的问题出现
