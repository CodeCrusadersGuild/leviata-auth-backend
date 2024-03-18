import { Injectable } from '@nestjs/common';
import * as Path from 'path';
import * as FileSystem from 'fs';
import { CallSite } from 'callsites';
import { StackTraceService } from './stack.trace.service';
import { OriginFunction } from '../types/origin.function.type';

@Injectable()
export class CallerService {
  constructor(private readonly stackTraceService: StackTraceService) {}

  /**
   * Retrieves information about the module that called a specified method at a given stack trace level.
   * @param method The method whose caller module information is to be determined.
   * @param level The stack trace level at which the caller module is to be determined. Defaults to 1.
   * @returns A promise that resolves to an object containing the name, root, and path of the caller module.
   */
  async getCallerModule(
    method: OriginFunction,
    level?: number,
  ): Promise<CallSite> {
    const stack = await this.stackTraceService.getCallsites(level || 1, method);
    const caller = stack[stack.length - 1];
    return caller;
  }

  /**
   * Retrieves the name of the module based on the provided file path.
   * @param callerPath The file path of the caller.
   * @returns A promise that resolves to the name of the module.
   */
  private async getModuleName(callerPath: string): Promise<string> {
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

  /**
   * Finds the root directory of the module based on the provided file path.
   * @param callerPath The file path of the caller.
   * @returns A promise that resolves to the root directory of the module.
   */
  private async findModuleRoot(callerPath: string): Promise<string> {
    let root = callerPath;
    let oldRoot = null;
    while (!this.isModuleRoot(root) && root !== oldRoot) {
      oldRoot = root;
      root = Path.resolve(root, '..');
    }
    return root;
  }

  /**
   * Determines whether the provided directory is the root of a module.
   * @param fileName The name of the directory to be checked.
   * @returns A boolean indicating whether the directory is the root of a module.
   */
  private isModuleRoot(fileName: string): boolean {
    const files = FileSystem.readdirSync(fileName).filter(
      value => !FileSystem.lstatSync(Path.join(fileName, value)).isDirectory(),
    );
    return files.includes('package.json');
  }

  /**
   * Reads the package name from the package.json file located in the module root.
   * @param moduleRoot The root directory of the module.
   * @returns A promise that resolves to the name of the module.
   */
  private async readPackageName(moduleRoot: string): Promise<string> {
    const packageJsonPath = Path.join(moduleRoot, 'package.json');
    const packageJsonContent = FileSystem.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    return packageJson.name;
  }

  /**
   * Extracts the module name from the node_modules path.
   * @param callerPath The file path of the caller.
   * @returns The module name extracted from the node_modules path.
   */
  private extractNodeModuleName(callerPath: string): string {
    const pathTree = callerPath.split(Path.sep);
    const moduleFolderIndex = pathTree.indexOf('node_modules') + 1;
    return pathTree.slice(0, moduleFolderIndex + 1).join(Path.sep);
  }
}
