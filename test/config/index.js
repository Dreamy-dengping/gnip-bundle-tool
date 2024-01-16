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
// 政企项目
const gitProjectMap = {
  "dsep-web-home-page": {
    gitUrl:
      "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/dsep-web-home-page.git",
    branchOrTag: "master",
    nodeVersion: "",
  },
  // "dsep-web-auth-manage": {
  //   gitUrl:
  //     "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/dsep-web-auth-manage.git",
  //   branchOrTag: "develop",
  //   nodeVersion: "",
  // },
  // "desp-web-nedrp": {
  //   gitUrl:
  //     "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/desp-web-nedrp.git",
  //   branchOrTag: "develop",
  //   nodeVersion: "",
  // },
  // "dsep-web-se": {
  //   gitUrl:
  //     "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/dsep-web-se.git",
  //   branchOrTag: "develop",
  //   nodeVersion: "",
  // },
  // "fe-qbee-layout": {
  //   gitUrl: "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-qbee-layout.git",
  //   branchOrTag: "private/dsep",
  //   nodeVersion: "",
  // },
};

// 资产项目
// const gitProjectMap = {
//   "fe-cisdigital-data-standard": {
//     gitUrl:
//       "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-data-standard.git",
//     branchOrTag: "release-3.7.0-11_30-20231218",
//     nodeVersion: "",
//   },
//   "fe-cisdigital-assets-config-management": {
//     gitUrl:
//       "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-assets-config-management.git",
//     branchOrTag: "release-3.7.0-11_30-20231218",
//     nodeVersion: "16.14.0",
//   },
//   "fe-cisdigital-dw-builder": {
//     gitUrl:
//       "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-dw-builder.git",
//     branchOrTag: "release-3.8.0-11_30-20231218",
//     nodeVersion: "",
//   },
//   "fe-cisdigital-data-security": {
//     gitUrl:
//       "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-data-security.git",
//     branchOrTag: "release-3.8.0-11_30-20231218",
//     nodeVersion: "16.14.0",
//   },
//   "fe-cisdigital-data-service": {
//     gitUrl:
//       "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-data-service.git",
//     branchOrTag: "release-3.8.0-11_30-20231218",
//     nodeVersion: "",
//   },
//   "fe-cisdigital-assets-manager": {
//     gitUrl:
//       "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-assets-manager.git",
//     branchOrTag: "release-3.8.0-11_30-20231218",
//     nodeVersion: "",
//   },
//   "fe-cisdigital-metadata-management": {
//     gitUrl:
//       "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-metadata-management.git",
//     branchOrTag: "release-3.8.0-11_30-20231218",
//     nodeVersion: "",
//   },
//   "fe-cisdigital-data-quality": {
//     gitUrl:
//       "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-data-quality.git",
//     branchOrTag: "release-3.7.0-11_30-20231218",
//     nodeVersion: "",
//   },
//   "fe-qbee-layout": {
//     gitUrl: "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-qbee-layout.git",
//     branchOrTag: "private/merge-test",
//     nodeVersion: "",
//     mergeBranch: "",
//     // mergeTag: "release_3.1.8.0-2_20231218",
//   },
// };
//最后项目打包后需要归并的文件后缀（公司项目为.tar.gz的压缩包)
const suffixReg = /\.tar\.gz/;
// 默认node版本
const defaultNodeVersion = "14.21.3";
// 输入的文件名称
const outputFileName = "dsep";
// 输入压缩包类型
const compressType = "zip";
// 单个脚手架项目打包后的输入的文件名
const buildName = "build";
// 输入的项目目录
const outputPutDir = path.resolve("C:\\Users\\Y00043\\Desktop");
//工作空间路径(git clone 、打包的暂存区，打包完成输出后，会清空对应文件)
const workSpacesPath = path.resolve(__dirname, "../../workspaces");
// 项目名映射
const projectList = Object.keys(gitProjectMap);
// 是否并发执行(默认串联执行),注意：并发执行效率更高,cpu占用资源更多，可能过多项目会出现主机卡死情况（node版本不同可能存在问题）
const isConcurrentExecute = false;
module.exports = {
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
};
