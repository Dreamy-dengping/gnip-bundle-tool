declare interface ProjectItem {
  gitUrl: string;
  branch?: string;
  tag?: string;
  isBundleFile?: boolean;
  isClearCache?: boolean;
  nodeVersion?: string;
  mergeBranch?: string;
  mergeTag?: string;
}
declare interface GitProjectMap {
  [key: string]: ProjectItem;
}
declare interface StartOption {
  suffixReg: RegExp;
  gitProjectMap: GitProjectMap;
  outputPutDir: string;
  outputFileName: string;
  buildName: string;
  compressType: string;
  workSpacesPath: string;
  defaultNodeVersion: string;
  isConcurrentExecute: boolean;
  isClearWorkSpace: boolean;
  isZipBundleFile: boolean;
}
declare const start: (option: StartOption) => void;
