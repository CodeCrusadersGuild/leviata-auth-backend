import * as Path from 'path';
import * as FileSystem from 'fs';
import { CallSite } from 'callsites';
import { StackTrace } from './StackTrace';
import { OriginFunction } from '../types/origin.function.type';

export class Caller {
  static async getCallerModule(
    method: OriginFunction,
    level?: number,
  ): Promise<CallSite> {
    const stack = await StackTrace.getCallsites(level || 1, method);
    const caller = stack[stack.length - 1];
    return caller;
  }

  static async getModuleName(callerPath: string): Promise<string> {
    if (Path.basename(callerPath) === callerPath) {
      return callerPath;
    }

    if (!callerPath.includes('node_modules')) {
      const moduleRoot = await this.findModuleRoot(callerPath);
      return this.readPackageName(moduleRoot);
    } else {
      return this.extractNodeModuleName(callerPath);
    }
  }

  private static async findModuleRoot(callerPath: string): Promise<string> {
    let root = callerPath;
    let oldRoot = null;
    while (!this.isModuleRoot(root) && root !== oldRoot) {
      oldRoot = root;
      root = Path.resolve(root, '..');
    }
    return root;
  }

  private static isModuleRoot(fileName: string): boolean {
    const files = FileSystem.readdirSync(fileName).filter(
      value => !FileSystem.lstatSync(Path.join(fileName, value)).isDirectory(),
    );
    return files.includes('package.json');
  }

  private static async readPackageName(moduleRoot: string): Promise<string> {
    const packageJsonPath = Path.join(moduleRoot, 'package.json');
    const packageJsonContent = FileSystem.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    return packageJson.name;
  }

  private static extractNodeModuleName(callerPath: string): string {
    const pathTree = callerPath.split(Path.sep);
    const moduleFolderIndex = pathTree.indexOf('node_modules') + 1;
    return pathTree.slice(0, moduleFolderIndex + 1).join(Path.sep);
  }
}
