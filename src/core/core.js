const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { spawn } = require("child_process");
const chalkUtil = require("../util/index");
const fse = require("fs-extra");

// 默认配置项由外层调用传入
let _option = {
  projectList: "", //项目名列表
  suffixReg: "", //打包后匹配后缀
  gitProjectMap: "", //项目映射
  outputPutDir: "", //输入目录
  outputFileName: "", //输入文件名
  buildName: "", //打包文件名
  compressType: "", //压缩类型
  workSpacesPath: "", //工作空间目录
  isConcurrentExecute: "", //是否并发执行
  defaultNodeVersion: "", //node默认版本
};
// 执行shell脚本
async function execCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    if (!command) {
      reject("shell脚本不能为空");
    }
    let dirCommand = spawn(command, [], {
      shell:true,
      cwd: cwd || path.resolve(__dirname),
    });
    // 处理标准输出
    dirCommand.stdout.on("data", (data) => {
      chalkUtil.logInfo(data.toString());
    });
    // 处理标准错误输出
    dirCommand.stderr.on("data", (data) => {
      chalkUtil.logInfo(data.toString());
    });
    // 处理命令执行结果
    dirCommand.on("close", (data) => {
      resolve("");
    });
  });
}
// 文件拷贝
async function copyFile(fileName) {
  return new Promise(async (resolve, reject) => {
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
          // 拷贝文件夹(不存在压缩文件的情况下)
          if (i === matchedFiles.length - 1) {
            fse.copySync(originSourcePath, targetSourcePath);
            console.log(
              "target-outpath",
              path.resolve(targetSourcePath, "./" + file)
            );
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
async function bundle(fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      // 当前环境执行目录
      const cwd = path.resolve(_option.workSpacesPath, fileName);
      // 当前项目执行node版本
      const currentProjectNodeVersion =
        _option.gitProjectMap[fileName].nodeVersion ||
        _option.defaultNodeVersion;
      chalkUtil.logSuccess("当前环境执行目录");
      console.log("cwd---------", cwd);
      await execCommand("cd", cwd);
      // 当前所处分支
      chalkUtil.logSuccess("current branch");
      await execCommand("git branch --show-current", cwd);
      chalkUtil.logSuccess("current tag");
      await execCommand("git describe --tags --exact-match", cwd);
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
      await copyFile(fileName);
      chalkUtil.logSuccess("end copy file..");
      resolve("");
    } catch (error) {
      reject(error);
    }
  });
}
// git clone项目
async function cloneProject(fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      // 克隆项目
      chalkUtil.logSuccess("start git  clone " + fileName);
      const cloneShell =
        "git clone " +
        _option.gitProjectMap[fileName].gitUrl +
        " --branch " +
        _option.gitProjectMap[fileName].branchOrTag;
      await execCommand(cloneShell, _option.workSpacesPath);
      chalkUtil.logSuccess("end git  clone " + fileName);
      // 是否需要合并分支
      const mergeBranch = _option.gitProjectMap[fileName].mergeBranch;
      if (mergeBranch) {
        chalkUtil.logSuccess("start merge branch " + mergeBranch);
        const mergeBranchShell = `git merge ${mergeBranch}`;
        await execCommand(
          mergeBranchShell,
          path.resolve(_option.workSpacesPath, fileName)
        );
      }
      // 是否需要合并tag
      const mergeTag = _option.gitProjectMap[fileName].mergeTag;
      if (mergeTag) {
        chalkUtil.logSuccess("merge tag " + mergeTag);
        // 获取所有tag
        await execCommand(
          "git fetch origin --tags",
          path.resolve(_option.workSpacesPath, fileName)
        );
        // 合并tag
        const mergeTagShell = `git merge ${mergeTag}`;
        await execCommand(
          mergeTagShell,
          path.resolve(_option.workSpacesPath, fileName)
        );
      }
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
function removeDir(removePath) {
  return new Promise((resolve, reject) => {
    fs.rmdir(removePath, { recursive: true, force: true }, (err) => {
      if (err) {
        reject(err);
      }
      resolve("");
    });
  });
}
// 创建工作空间
async function createWorkSpaces() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(_option.workSpacesPath)) {
      fs.mkdir(_option.workSpacesPath, function (err) {
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
// 打包完成后输入文件的操作
async function afterBundleOutPutResolve() {
  return new Promise(async (resolve, reject) => {
    try {
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
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
//清理工作区
async function clearWorkSpace() {
  return new Promise(async (resolve, reject) => {
    try {
      chalkUtil.logSuccess("start clear workSpace...");
      await removeDir(path.resolve(_option.workSpacesPath));
      chalkUtil.logSuccess("end clear workSpace...");
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
// 并发执行
async function concurrentExecute() {
  return new Promise(async (resolve, reject) => {
    try {
      const cloneProjectAsyncList = _option.projectList.map((fileName) => {
        return () => {
          return cloneProject(fileName);
        };
      });
      const bundleAsyncList = _option.projectList.map((fileName) => {
        return () => {
          return bundle(fileName);
        };
      });
      // 批量克隆项目
      await Promise.all(cloneProjectAsyncList.map((fn) => fn()));
      //  批量打包
      await Promise.all(bundleAsyncList.map((fn) => fn()));
      //后续操作
      await Promise.all([clearWorkSpace(), afterBundleOutPutResolve()]);
      chalkUtil.logSuccess("success");
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// 启动入口
async function start(option) {
  if (option) {
    _option = option;
  }
  try {
    // 设置node-sass下载源，不然很容易出错
    chalkUtil.logSuccess("npm  config set sass_binary_site");
    await execCommand(
      "npm  config set sass_binary_site https://npm.taobao.org/mirrors/node-sass",
      path.resolve(__dirname)
    );
    chalkUtil.logSuccess("yarn  config set sass_binary_site");
    await execCommand(
      "yarn  config set sass_binary_site https://npm.taobao.org/mirrors/node-sass",
      path.resolve(__dirname)
    );
    // 检查工作空间文件夹是否存在不存在先创建
    await createWorkSpaces();
    // 并发打包
    if (_option.isConcurrentExecute) {
      await concurrentExecute();
    } else {
      // 串行打包
      for (let i = 0; i < _option.projectList.length; i++) {
        // 克隆项目
        await cloneProject(_option.projectList[i]);
        // 开始打包
        await bundle(_option.projectList[i]);
        // 打包完成后续处理
        if (i === _option.projectList.length - 1) {
          //后续操作
          await Promise.all([clearWorkSpace(), afterBundleOutPutResolve()]);
        }
      }
    }
    chalkUtil.spinner.succeed("success");
  } catch (error) {
    chalkUtil.logError(error);
  }
}

module.exports = {
  start,
};
