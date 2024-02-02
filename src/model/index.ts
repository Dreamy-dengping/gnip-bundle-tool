export interface ProjectItem {
  gitUrl: string;
  branch?: string;
  tag?: string;
  isBundleFile?: boolean;
  isClearCache?: boolean;
  nodeVersion?: string;
  mergeBranch?: string;
  mergeTag?: string;
}

export interface GitProjectMap {
  [key: string]: ProjectItem;
}
export interface StartOption {
  suffixReg: RegExp; //打包后匹配后缀
  gitProjectMap: GitProjectMap; //项目映射
  outputPutDir: string; //输入目录
  outputFileName: string; //输入文件名
  buildName: string; //打包文件名
  compressType: string; //压缩类型
  workSpacesPath: string; //工作空间目录
  defaultNodeVersion: string; //node默认版本
  isConcurrentExecute: boolean; //是否并发执行
  isClearWorkSpace: boolean; //是否需要清理工作空间(优先级高于单个项目配置的清理字段isClearCache)
  isZipBundleFile: boolean; //是否打包后压缩打包文件并且删除文件夹
}
