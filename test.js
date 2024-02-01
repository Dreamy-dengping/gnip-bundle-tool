//导入包
const path = require("path");
const { start } = require("gnip-bundle-tool");
// const { start } = require("./index");
// 政企项目
// const gitProjectMap = {
//   // "utils-project-test": {
//   //   gitUrl: "https://git.cisdigital.cn/ping.a.deng/utils-project-test.git",
//   //   branch: "master",
//   //   nodeVersion: "",
//   //   isClearCache: true,
//   // },
//   "fe-qbee-layout": {
//     gitUrl: "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-qbee-layout.git",
//     branch: "private/dsep",
//     nodeVersion: "",
//     isBundleFile: true,
//   },
//   "dsep-web-home-page": {
//     gitUrl:
//       "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/dsep-web-home-page.git",
//     branch: "develop",
//     nodeVersion: "",
//     // isClearCache: true,
//   },
//   "dsep-web-auth-manage": {
//     gitUrl:
//       "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/dsep-web-auth-manage.git",
//     branch: "develop",
//     // tag: "release-1.5.0",
//     // isClearCache: true,
//     nodeVersion: "",
//   },
//   "desp-web-nedrp": {
//     gitUrl:
//       "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/desp-web-nedrp.git",
//     branch: "develop",
//     // tag: "release-1.5.0",
//     // isClearCache: true,
//     nodeVersion: "",
//   },
//   "dsep-web-se": {
//     gitUrl:
//       "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/dsep-web-se.git",
//     branch: "develop",
//     // tag: "release-1.5.1",
//     // isClearCache: true,
//     nodeVersion: "",
//   },
// };

// 资产项目
const gitProjectMap = {
  "dsep-web-home-page": {
    gitUrl:
      "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/dsep-web-home-page.git",
    branch: "develop",
    nodeVersion: "",
    // isClearCache: true,
  },
  "dsep-web-auth-manage": {
    gitUrl:
      "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/dsep-web-auth-manage.git",
    branch: "develop",
    // tag: "release-1.5.0",
    // isClearCache: true,
    nodeVersion: "",
  },
  "desp-web-nedrp": {
    gitUrl:
      "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/desp-web-nedrp.git",
    // branch: "develop",
    tag: "release-1.5.0",
    // isClearCache: true,
    nodeVersion: "",
  },
  "dsep-web-se": {
    gitUrl:
      "https://git.cisdigital.cn/gzjg/dsep/frontend/desp-web-plus/dsep-web-se.git",
    // branch: "develop",
    tag: "release-1.5.1",
    // isClearCache: true,
    nodeVersion: "",
  },
  "fe-cisdigital-interactive-analyze": {
    gitUrl:
      "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-interactive-analyze.git",
    branch: "qa",
    isBundleFile: true,
    nodeVersion: "",
  },
  "fe-qbee-layout": {
    gitUrl: "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-qbee-layout.git",
    branch: "private/merge-test",
    nodeVersion: "",
    mergeBranch: "",
    // isClearCache: true,
    isBundleFile: true,
  },

  "fe-cisdigital-assets-config-management": {
    gitUrl:
      "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-assets-config-management.git",
    branch: "qa",
    nodeVersion: "16.20.2",
  },
  "fe-cisdigital-data-security": {
    gitUrl:
      "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-data-security.git",
    branch: "qa",
    nodeVersion: "16.20.2",
  },
  "fe-cisdigital-data-standard": {
    gitUrl:
      "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-data-standard.git",
    branch: "qa",
    nodeVersion: "",
  },
  "fe-cisdigital-dw-builder": {
    gitUrl:
      "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-dw-builder.git",
    branch: "qa",
    nodeVersion: "",
  },
  "fe-cisdigital-data-service": {
    gitUrl:
      "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-data-service.git",
    branch: "qa",
    nodeVersion: "",
  },
  "fe-cisdigital-assets-manager": {
    gitUrl:
      "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-assets-manager.git",
    branch: "qa",
    nodeVersion: "",
  },
  "fe-cisdigital-metadata-management": {
    gitUrl:
      "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-metadata-management.git",
    branch: "qa",
    nodeVersion: "",
  },
  "fe-cisdigital-data-quality": {
    gitUrl:
      "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-data-quality.git",
    branch: "qa",
    nodeVersion: "",
  },

  "fe-cisdigital-dinky": {
    gitUrl:
      "https://git.cisdigital.cn/qt/qbee/fe/fe-qbee/fe-cisdigital-dinky.git",
    tag: "release-3.2.0-6_30-20230907",
    nodeVersion: "",
  },
};

start({
  gitProjectMap, //项目配置项
  projectList: Object.keys(gitProjectMap), //项目名映射
  suffixReg: /\.tar\.gz/, //最后项目打包后需要归并的文件后缀（公司项目为.tar.gz的压缩包)
  defaultNodeVersion: "14.21.3", //默认node版本
  outputFileName: "测试全量打包", //输出的文件名称
  compressType: "zip", //压缩包类型
  buildName: "build", //单个脚手架项目打包后的输入的文件名
  outputPutDir: path.resolve("D:\\bundles"), //输入的项目目录（自行复制文件目录输出位置）
  workSpacesPath: path.resolve("D:\\workspaces"), //工作空间路径(git clone 、打包的暂存区，打包完成输出后，会清空对应文件)
  isConcurrentExecute: false, //是否并发执行(默认串联执行),注意：并发执行效率更高,cpu占用资源更多，可能过多项目会出现主机卡死情况（node版本不同可能存在问题）
  isClearWorkSpace: false, //是否需要清理工作空间
  isZipBundleFile: false, //是否打包后压缩打包文件并且删除文件夹
});
