const { start } = require("./core/core");
const {
  projectList,
  suffixReg,
  gitProjectMap,
  outputPutDir,
  outputFileName,
  buildName,
  compressType,
  workSpacesPath,
  isConcurrentExecute,
  defaultNodeVersion,
} = require("./config/index");

start({
  gitProjectMap,
  suffixReg,
  defaultNodeVersion,
  outputFileName,
  compressType,
  buildName,
  outputPutDir,
  workSpacesPath,
  projectList,
  isConcurrentExecute
});
