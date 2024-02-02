import { ProjectItem, GitProjectMap, StartOption } from "../model/index";
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { spawn } = require("child_process");
const chalkUtil = require("../util/index");
const fse = require("fs-extra");

// 默认配置项由外层调用传入
let _option: StartOption = {
  suffixReg: /\.tar\.gz/, //打包后匹配后缀
  gitProjectMap: {} as GitProjectMap, //项目映射
  outputPutDir: "", //输入目录
  outputFileName: "", //输入文件名
  buildName: "", //打包文件名
  compressType: "", //压缩类型
  workSpacesPath: "", //工作空间目录
  defaultNodeVersion: "", //node默认版本
  isConcurrentExecute: false, //是否并发执行
  isClearWorkSpace: false, //是否需要清理工作空间(优先级高于单个项目配置的清理字段isClearCache)
  isZipBundleFile: false, //是否打包后压缩打包文件并且删除文件夹
};
const timeCache = {
  startTime: 0,
  endTime: 0,
};
// 根据文件名获取执行环境地址
function getCwdPath(fileName: string) {
  return path.resolve(_option.workSpacesPath, fileName);
}
// 执行shell脚本
async function execCommand(command: string, cwd: string) {
  return new Promise((resolve, reject) => {
    if (!command) {
      reject("shell脚本不能为空");
    }
    let dirCommand = spawn(command, [], {
      shell: true,
      cwd: cwd || path.resolve(__dirname),
    });
    let logInfo: string[] = [];
    // 处理标准输出
    dirCommand.stdout.on("data", (data: string) => {
      logInfo.push(data.toString());
      chalkUtil.logInfo(data.toString());
    });
    // 处理标准错误输出
    dirCommand.stderr.on("data", (data: string) => {
      chalkUtil.logInfo(data.toString());
    });
    // 处理命令执行结果
    dirCommand.on("close", () => {
      resolve(logInfo);
    });
  });
}
// 文件拷贝
async function copyFile(project: ProjectItem, fileName: string) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const targetPath = path.resolve(
        _option.outputPutDir,
        _option.outputFileName
      );
      if (!fs.existsSync(targetPath)) {
        // 不存在文件夹创建文件夹
        fs.mkdirSync(targetPath);
      }
      const matchedFiles = fs.readdirSync(
        path.resolve(_option.workSpacesPath, fileName + "/" + _option.buildName)
      );
      let hasCopy = false;
      // 存在压缩文件则拷贝压缩文件
      for (let i = 0; i < matchedFiles.length; i++) {
        if (hasCopy) continue;
        const file = matchedFiles[i];
        // 压缩包文件
        const originSourcePath = path.resolve(
          _option.workSpacesPath,
          fileName + "/" + _option.buildName + "/" + file
        );
        const targetSourcePath = path.resolve(targetPath, "./" + file);
        if (_option.suffixReg.test(file)) {
          //复制文件
          fs.copyFileSync(originSourcePath, targetSourcePath);
          console.log(
            "target-outpath",
            path.resolve(targetSourcePath, "./" + file)
          );
          hasCopy = true;
          resolve();
        } else {
          // 拷贝文件夹(不存在压缩文件的情况下),需要拷贝文件的则拷贝文件
          if (project.isBundleFile || i === matchedFiles.length - 1) {
            fse.copySync(originSourcePath, targetSourcePath);
            console.log(
              "target-outpath",
              path.resolve(targetSourcePath, "./" + file)
            );
            hasCopy = true;
            resolve();
          }
        }
      }
      // 没有压缩文件，拷贝文件夹
    } catch (error) {
      reject(error);
    }
  });
}
// 打包项目
async function bundle(project: ProjectItem, fileName: string) {
  return new Promise(async (resolve, reject) => {
    try {
      // 当前环境执行目录
      const cwd = getCwdPath(fileName);
      // 当前项目执行node版本
      const currentProjectNodeVersion =
        project.nodeVersion || _option.defaultNodeVersion;
      chalkUtil.logSuccess("当前环境执行目录");
      await execCommand("cd", cwd);
      if (project.branch) {
        // 当前所处分支
        chalkUtil.logSuccess("current branch");
        await execCommand("git branch --show-current", cwd);
      } else if (project.tag) {
        // 当前所处tag
        chalkUtil.logSuccess("current tag");
        await execCommand("git describe --tags --exact-match", cwd);
      }
      //  切换node版本
      chalkUtil.logSuccess("start nvm check -node -version");
      await execCommand("nvm use" + " " + currentProjectNodeVersion, cwd);
      chalkUtil.logSuccess("end nvm check -node -version");
      // 获取node版本
      chalkUtil.logSuccess("node -v");
      await execCommand("node -v", cwd);
      //   yarn 版本
      chalkUtil.logSuccess("yarn -v");
      await execCommand("yarn -v", cwd);
      //  依赖安装
      chalkUtil.logSuccess("yarn start....");
      chalkUtil.spinner.start();
      await execCommand("yarn", cwd);
      chalkUtil.logSuccess("yarn end....");
      //   开始打包
      chalkUtil.logSuccess("start build....");
      await execCommand("yarn build", cwd);
      chalkUtil.logSuccess("end build....");
      // 拷贝打包文件
      chalkUtil.logSuccess("start copy file..");
      await copyFile(project, fileName);
      chalkUtil.logSuccess("end copy file..");
      resolve("");
    } catch (error) {
      reject(error);
    }
  });
}
// 更新tag或者分支
async function updateLocalBranchOrTag(project: ProjectItem, fileName: string) {
  return new Promise<void>(async (resolve, reject) => {
    // 当前环境执行目录
    const cwd = getCwdPath(fileName);
    try {
      // 更新代码
      if (project.branch) {
        // 当前为分支的情况
        chalkUtil.logSuccess(" start git pull");
        const updateBranchShell = "git pull";
        await execCommand(updateBranchShell, cwd);
        chalkUtil.logSuccess(" end git pull");
      } else if (project.tag) {
        // 当前为tag的情况
        chalkUtil.logSuccess(" start git reset tag");
        const updateTagShell = "git pull origin " + project.tag;
        await execCommand(updateTagShell, cwd);
        chalkUtil.logSuccess(" end git reset tag");
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
// git clone项目
async function cloneProject(project: ProjectItem, fileName: string) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const cwd = getCwdPath(fileName);
      // 克隆项目
      chalkUtil.logSuccess("start git  clone " + fileName);
      const cloneShell = "git clone " + project.gitUrl;
      await execCommand(cloneShell, _option.workSpacesPath);
      chalkUtil.logSuccess("end git  clone " + fileName);
      if (project.branch) {
        // 设置上游分支和本地的联系
        // chalkUtil.logSuccess("start set-upstream" + fileName);
        // const currentUpStreamBranchShell = ` git branch --set-upstream-to=origin/${project.branch}  ${project.branch}`;
        // await execCommand(currentUpStreamBranchShell, cwd);
        // 切换分支
        chalkUtil.logSuccess("start git  checkout branch " + fileName);
        const currentCheckoutBranchShell = `git checkout  ${project.branch}`;
        await execCommand(currentCheckoutBranchShell, cwd);
        await updateLocalBranchOrTag(project, fileName);
      } else if (project.tag) {
        // 切换tag
        chalkUtil.logSuccess("start git  checkout tag " + fileName);
        const currentCheckoutTagShell = `git checkout  ${project.tag}`;
        await execCommand(currentCheckoutTagShell, cwd);
        await updateLocalBranchOrTag(project, fileName);
      }
      // 是否需要合并分支
      const mergeBranch = project.mergeBranch;
      if (mergeBranch) {
        chalkUtil.logSuccess("start merge branch " + mergeBranch);
        const mergeBranchShell = `git merge ${mergeBranch}`;
        await execCommand(mergeBranchShell, cwd);
      }
      // 是否需要合并tag
      const mergeTag = project.mergeTag;
      if (mergeTag) {
        chalkUtil.logSuccess("merge tag " + mergeTag);
        // 获取所有tag
        await execCommand("git fetch origin --tags", cwd);
        // 合并tag
        const mergeTagShell = `git merge ${mergeTag}`;
        await execCommand(mergeTagShell, cwd);
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
// 本地已存在项目则直接使用，不用拉取了
async function existProjectCheckoutBranchOrTag(
  project: ProjectItem,
  fileName: string
) {
  return new Promise<void>(async (resolve, reject) => {
    // 当前环境执行目录
    const cwd = getCwdPath(fileName);
    try {
      // 先fetch远程最新仓库更新
      chalkUtil.logSuccess("start git  fetch " + fileName);
      const fetchShell = "git fetch";
      await execCommand(fetchShell, cwd);
      // 切换分支或者tag
      const cloneShell = "git checkout " + (project.branch || project.tag);
      await execCommand(cloneShell, cwd);
      // 更新代码
      await updateLocalBranchOrTag(project, fileName);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// 压缩文件
function zipAsset() {
  return new Promise((resolve, reject) => {
    // 创建可写流来写入数据
    const output = fs.createWriteStream(
      path.resolve(
        _option.outputPutDir,
        "./" + _option.outputFileName + "." + _option.compressType
      )
    );
    const archive = archiver(_option.compressType, {
      zlib: { level: 9 },
    });
    archive.on("finish", () => {
      resolve("");
    });
    archive.on("error", () => {
      reject("文件压缩失败");
    });
    // 建立管道连接
    archive.pipe(output);
    // 将指定目录下的所有文件打包压缩到压缩包中，而这些文件在压缩包的根目录，而非子目录中
    archive.directory(
      path.resolve(_option.outputPutDir, "./" + _option.outputFileName),
      false
    );
    // 完成压缩
    archive.finalize();
  });
}
// 删除对应文件或者文件夹内容文件
function removeDir(removePath: string) {
  return new Promise((resolve, reject) => {
    fse.remove(removePath, (err: string) => {
      if (err) {
        reject(err);
      }
      resolve("");
    });
  });
}

// 创建工作空间
async function createWorkSpaces() {
  return new Promise<void>((resolve, reject) => {
    if (!fs.existsSync(_option.workSpacesPath)) {
      fs.mkdir(_option.workSpacesPath, function (err: string) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}
// 打包完成后输出文件的操作
async function afterBundleOutPutResolve() {
  return new Promise<void>(async (resolve, reject) => {
    try {
      if (_option.isZipBundleFile) {
        // 最后压缩文件
        chalkUtil.logSuccess("start zip file..");
        await zipAsset();
        chalkUtil.logSuccess("end zip file..");
        // 删除原来打包生成文件夹只保留压缩包
        chalkUtil.logSuccess("start del bundle file..");
        await removeDir(
          path.resolve(_option.outputPutDir, _option.outputFileName)
        );
        chalkUtil.logSuccess("end del bundle file..");
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
//清理工作区
async function clearWorkSpace() {
  return new Promise<void>(async (resolve, reject) => {
    try {
      if (_option.isClearWorkSpace) {
        chalkUtil.logSuccess("start clear workSpace...");
        const removePath = path.resolve(_option.workSpacesPath);
        await removeDir(removePath);
        chalkUtil.logSuccess("end clear workSpace...");
      } else {
        chalkUtil.logSuccess("workSpace has  cached...");
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
// 并发执行
async function concurrentExecute() {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let cloneProjectAsyncList = [];
      let bundleAsyncList = [];
      for (let fileName in _option.gitProjectMap) {
        const project = _option.gitProjectMap[fileName];
        if (!fs.existsSync(getCwdPath(fileName))) {
          // 不存在就克隆
          cloneProjectAsyncList.push(() => {
            return cloneProject(project, fileName);
          });
        } else {
          // 存在直接更新
          chalkUtil.logSuccess(
            "local workSpace exist clone project " + fileName
          );
          // 切换分支或者tag
          await existProjectCheckoutBranchOrTag(project, fileName);
        }
        // 追加到打包队列
        bundleAsyncList.push(() => {
          return bundle(project, fileName);
        });
      }
      // 批量克隆项目
      if (cloneProjectAsyncList.length) {
        chalkUtil.logSuccess("batch clone  project start-----------");
        await Promise.all(cloneProjectAsyncList.map((fn) => fn()));
        chalkUtil.logSuccess("batch clone  project end-----------");
      }
      //  批量打包
      chalkUtil.logSuccess("batch bundle project start-----------");
      await Promise.all(bundleAsyncList.map((fn) => fn()));
      chalkUtil.logSuccess("end bundle project end-----------");
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
// 删除打包文件
async function removeBundleFile(project: ProjectItem, fileName: string) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // 清除本地缓存文件（删除整个克隆的项目）
      if (project.isClearCache) {
        chalkUtil.logSuccess("start remove cache file " + fileName);
        await removeDir(getCwdPath(fileName));
        chalkUtil.logSuccess("end remove cache file " + fileName);
      } else {
        // 只删除build文件夹
        chalkUtil.logSuccess("start remove bundle file " + fileName);
        await removeDir(
          path.resolve(
            _option.workSpacesPath,
            fileName + "/" + _option.buildName
          )
        );
        chalkUtil.logSuccess("end remove bundle file " + fileName);
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
// 批量删除缓存文件
async function batchRemoveBundleFile() {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let batchPromiseList: (() => any)[] = [];
      for (let fileName in _option.gitProjectMap) {
        batchPromiseList.push(function () {
          return removeBundleFile(_option.gitProjectMap[fileName], fileName);
        });
      }
      let bachListLen = batchPromiseList.length;
      let fulfilled = 0;
      while (batchPromiseList.length && fulfilled < bachListLen) {
        let bufferItem: any = batchPromiseList.shift();
        bufferItem().finally(() => {
          fulfilled++;
          if (fulfilled === bachListLen) {
            resolve();
          }
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}
// 重置分支
// function resetBranch(fileName) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       // 当前环境执行目录
//       const cwd = getCwdPath(fileName);
//       chalkUtil.logSuccess("start reset branch..");
//       // 切换分支或者tag
//       const cloneShell = "git checkout master";
//       await execCommand(cloneShell, cwd);
//       chalkUtil.logSuccess("end  reset branch....");
//       resolve();
//     } catch (error) {
//       reject(error);
//     }
//   });
// }
// 输出成功的日志
function outputBundleProjectLog() {
  return new Promise<void>((resolve) => {
    console.log("bundle completed list-------------------");
    for (let fileName in _option.gitProjectMap) {
      chalkUtil.spinner.succeed(fileName);
    }
    console.log("bundle completed list-------------------");
    resolve();
  });
}
// 检测是否设置node-sass下载源
function checkIsSetSassMirror() {
  return new Promise<void>(async (resolve) => {
    const sassBinaryAddress = "https://npm.taobao.org/mirrors/node-sass";
    const sassBinarySite: string[] = (await execCommand(
      "npm config get sass_binary_site",
      path.resolve(__dirname)
    )) as any;
    if (
      !sassBinarySite.find(
        (logInfo: string) => logInfo.indexOf(sassBinaryAddress) !== -1
      )
    ) {
      // 设置node-sass下载源，不然很容易出错
      chalkUtil.logSuccess("npm  config set sass_binary_site");
      await execCommand(
        "npm  config set sass_binary_site " + sassBinaryAddress,
        path.resolve(__dirname)
      );
      chalkUtil.logSuccess("yarn  config set sass_binary_site");
      await execCommand(
        "yarn  config set sass_binary_site " + sassBinaryAddress,
        path.resolve(__dirname)
      );
    } else {
      chalkUtil.logSuccess("yarn and npm  sass_binary_site has been set");
    }
    resolve();
  });
}
// 启动入口
async function start(option: StartOption) {
  if (option) {
    _option = option;
  }
  try {
    const projectLen = Object.keys(_option.gitProjectMap).length;
    if (!projectLen) {
      throw Error("请传入打包项目！");
    }
    timeCache.startTime = Date.now();
    // 检测是否设置node-sass下载源
    await checkIsSetSassMirror();
    // 检查工作空间文件夹是否存在不存在先创建
    await createWorkSpaces();
    // 并发打包
    if (_option.isConcurrentExecute) {
      await concurrentExecute();
    } else {
      // 串行打包
      for (let fileName in _option.gitProjectMap) {
        const currentProjectItem = _option.gitProjectMap[fileName];
        // 检查本地工作空间是否存在克隆的项目,存在则原基础上进行操作
        if (fs.existsSync(getCwdPath(fileName))) {
          chalkUtil.logSuccess(
            "local workSpace exist clone project " + fileName
          );
          // 切换分支或者tag
          await existProjectCheckoutBranchOrTag(currentProjectItem, fileName);
        } else {
          // 克隆项目
          await cloneProject(currentProjectItem, fileName);
        }
        // 开始打包
        await bundle(currentProjectItem, fileName);
        // 然后分支切换重置到master
        // resetBranch(fileName);
      }
    }
    // 清理工作空间、压缩代码
    await Promise.all([clearWorkSpace(), afterBundleOutPutResolve()]);
    // 批量删除build文件
    if (!_option.isClearWorkSpace) {
      await batchRemoveBundleFile();
    }
    // 输出打包完后的日志
    await outputBundleProjectLog();
    timeCache.endTime = Date.now();
    chalkUtil.spinner.succeed("success");
    chalkUtil.spinner.succeed(
      chalkUtil.generateDurationTime(timeCache.startTime, timeCache.endTime)
    );
  } catch (error) {
    chalkUtil.logError(error);
  }
}

module.exports = {
  start,
};
