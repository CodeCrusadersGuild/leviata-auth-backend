import { Injectable } from '@nestjs/common';
import * as Path from 'path';
import * as FileSystem from 'fs';
import { CallSite } from 'callsites';
import { StackTraceService } from './stack.trace.service';
import { OriginFunction } from '../types/origin.function.type';

@Injectable()
export class CallerService {
  constructor(private readonly stackTraceService: StackTraceService) {}

  async getCallerModule(
    method: OriginFunction,
    level?: number,
  ): Promise<{ name: string; root: string; path: string }> {
    const stack = await this.stackTraceService.getCallsites(level || 1, method);
    const caller = stack[stack.length - 1];
    return this.resolveModuleInfo(caller);
  }

  private async resolveModuleInfo(
    caller: CallSite,
  ): Promise<{ name: string; root: string; path: string }> {
    const callerPath = caller.getFileName();
    const moduleName = await this.getModuleName(callerPath);
    const moduleRoot = Path.dirname(callerPath);
    return {
      name: moduleName,
      root: moduleRoot,
      path: callerPath,
    };
  }

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

  private async findModuleRoot(callerPath: string): Promise<string> {
    let root = callerPath;
    let oldRoot = null;
    while (!this.isModuleRoot(root) && root !== oldRoot) {
      oldRoot = root;
      root = Path.resolve(root, '..');
    }
    return root;
  }

  private isModuleRoot(fileName: string): boolean {
    const files = FileSystem.readdirSync(fileName).filter(
      value => !FileSystem.lstatSync(Path.join(fileName, value)).isDirectory(),
    );
    return files.includes('package.json');
  }

  private async readPackageName(moduleRoot: string): Promise<string> {
    const packageJsonPath = Path.join(moduleRoot, 'package.json');
    const packageJsonContent = FileSystem.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    return packageJson.name;
  }

  private extractNodeModuleName(callerPath: string): string {
    const pathTree = callerPath.split(Path.sep);
    const moduleFolderIndex = pathTree.indexOf('node_modules') + 1;
    return pathTree.slice(0, moduleFolderIndex + 1).join(Path.sep);
  }
}
