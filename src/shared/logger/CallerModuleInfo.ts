export class CallerModuleInfo {
  name: string;
  filePath: string;
  rootDir: string;

  constructor(name: string, filePath: string, rootDir: string) {
    this.name = name;
    this.filePath = filePath;
    this.rootDir = rootDir;
  }
}
