# Theia 开发指南（中文翻译）

本文件为 Theia 开发的入门与参考指南。若你需要快速上手，请参见[快速开始](#快速开始)。

# 如何构建 Theia 及示例应用

Theia 是一个用于构建 IDE 的框架，因此你无法直接“运行”Theia 本身，但你可以运行仓库中包含的示例应用：一个是基于浏览器的 IDE，另一个是基于 Electron 的等价应用。

以下说明适用于 Linux 和 macOS。

Windows 用户请[点击这里](#在-windows-上构建)。

- [**前置条件**](#前置条件)
- [**快速开始**](#快速开始)
- [**克隆仓库**](#克隆仓库)
- [**仓库结构**](#仓库结构)
- [**构建核心、扩展和示例包**](#构建核心扩展和示例包)
- [**单独构建扩展包**](#单独构建扩展包)
- [**运行浏览器示例应用**](#运行浏览器示例应用)
- [**运行 Electron 示例应用**](#运行-electron-示例应用)
- [**重新构建**](#重新构建)
- [**监听（watch）**](#监听watch)
- [**调试**](#调试)
- [**性能分析**](#性能分析)
- [**测试**](#测试)
- [**代码覆盖率**](#代码覆盖率)
- [**在 Windows 上构建**](#在-windows-上构建)
- [**故障排查**](#故障排查)

## 前置条件

- Node.js `>= 20` 且 `< 24`。
  - 若需使用 Theia 的 VS Code 扩展支持，建议使用与 VS Code 所用 Electron 版本兼容的 Node 版本。
- git（如需使用 Git 扩展，需 2.11.0 或更高版本）
- Python3（因 [`node-gyp`](https://github.com/nodejs/node-gyp/tree/v11.4.0#installation) 构建需要）

不同平台还需安装一些额外工具：

- Linux
  - [make](https://www.gnu.org/software/make/)
  - [gcc](https://gcc.gnu.org/)（或其他编译工具链）
  - [pkg-config](https://www.freedesktop.org/wiki/Software/pkg-config/)
  - `sudo apt-get install build-essential`
  - [`native-keymap`](#prerequisite_native_keymap) 依赖：
    - Debian: `sudo apt-get install libx11-dev libxkbfile-dev`
    - Red Hat: `sudo yum install libX11-devel.x86_64 libxkbfile-devel.x86_64`
    - FreeBSD: `sudo pkg install libX11`
  - [`keytar`](#prerequisite_keytar) 依赖：
    - Debian/Ubuntu: `sudo apt-get install libsecret-1-dev`
    - Red Hat: `sudo yum install libsecret-devel`
    - Arch Linux: `sudo pacman -S libsecret`
    - Alpine: `apk add libsecret-dev`

- Linux/MacOS
  - 推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node.js 版本。

- Windows
  - 推荐使用 [`scoop`](https://scoop.sh/)。详细步骤见[下文](#在-windows-上构建)。

## 快速开始

构建并运行浏览器示例：

```sh
git clone https://github.com/eclipse-theia/theia \
    && cd theia \
    && npm install \
    && npm run build:browser \
    && npm run download:plugins \
    && npm run start:browser
```

浏览器访问 <http://localhost:3000>。

构建并运行 Electron 示例：

```sh
git clone https://github.com/eclipse-theia/theia \
    && cd theia \
    && npm install \
    && npm run build:electron \
    && npm run download:plugins \
    && npm run start:electron
```

### 下载插件

运行以下命令下载插件：

```sh
npm run download:plugins
```

### 使用 SSL 运行浏览器示例

```sh
git clone https://github.com/eclipse-theia/theia \
    && cd theia \
    && npm install \
    && npm run download:plugins \
    && npm run build:browser \
    && npm run start:browser --ssl --cert /path/to/cert.crt --certkey /path/to/certkey.key
```

浏览器访问 <https://localhost:3000>。

### 使用 Gitpod 运行浏览器示例

[Gitpod](https://www.gitpod.io/) 是基于 Theia 的 IDE。

- 访问 <https://gitpod.io/#https://github.com/eclipse-theia/theia> 启动开发环境。
- Gitpod 会自动配置、克隆并构建 Theia 仓库。
- 构建完成后，在终端运行：

```sh
npm run start:browser ../.. --hostname 0.0.0.0
```

## 克隆仓库

```sh
git clone https://github.com/eclipse-theia/theia
```

假设仓库路径为 `$THEIA`，可设置环境变量方便后续操作：

```sh
THEIA=$PWD/theia
```

## 仓库结构

- `packages`：运行时包，包括核心包和扩展
- `dev-packages`：开发时包
  - [@theia/cli](../dev-packages/cli/README.md)：命令行工具
  - [@theia/ext-scripts](../dev-packages/private-ext-scripts/README.md)：共享脚本工具
- `examples`：示例应用（Electron 和浏览器）
- `doc`：文档
- `scripts`：npm 脚本用到的 JS 脚本
- 根目录：开发依赖和 [Lerna](https://lerna.js.org/) 配置

## 构建核心、扩展和示例包

安装依赖并构建 TypeScript 包：

```sh
npm install
npm run compile
```

构建示例应用：

```sh
npm run build:browser
npm run build:browser-only
npm run build:electron
# 一次性构建所有示例应用：
npm run build:applications
```

更多细节请查阅 [package.json](../package.json)。

## 一键构建

```sh
npm run all
```

此命令会安装依赖、链接并构建 TypeScript 包、lint 及构建示例应用。

## 构建 TypeScript 源码

需先安装依赖。

```sh
npm run compile
```

## 代码检查（Lint）

```sh
npm run lint # 检查 TypeScript 源码
```

`npm run all` 也会自动 lint。

## 单独构建扩展包

在根目录：

```sh
npx lerna run compile --scope @theia/core
```

在包目录：

```sh
npm run compile
```

## 运行浏览器示例应用

在 [examples/browser](../examples/browser) 目录下：

```sh
npm run start
```

应用监听 3000 端口，浏览器访问 <http://localhost:3000>。

如需回滚 Electron 的原生 Node.js 包，运行：

```sh
npm run rebuild:browser
```

## 运行 Electron 示例应用

```sh
npm start:electron
```

## 重新构建

```sh
npm run build
```

## 监听（watch）

### 监听核心和扩展包

```sh
npm run watch
```

### 监听示例应用

```sh
npm run watch:browser
# 或
npm run watch:electron
```

### 监听指定包

```sh
npx lerna run watch --scope @theia/package-name
```

### 监听指定包及其依赖

```sh
npx lerna run watch --scope @theia/navigator --include-filtered-dependencies --parallel
```

## 调试

### 调试浏览器示例后端

- 打开调试视图，运行 `Launch Browser Backend` 配置。

### 调试浏览器示例前端

- 先用 `npm run start` 启动后端。
- 浏览器访问 <http://localhost:3000/>，用开发者工具调试。
- 打开调试视图，运行 `Launch Browser Frontend` 配置。

### 同时调试浏览器前后端

- 先运行 `Launch Browser Backend`，再运行 `Launch Browser Frontend`。

### 调试 Electron 示例后端

- 打开调试视图，运行 `Launch Electron Backend` 配置。

### 调试 Electron 示例前端

- 启动 Electron 后端
  - 调试视图运行 `Launch Electron Backend` 或用 `npm run start`
- 附加到 Electron 前端
  - 调试视图运行 `Attach to Electron Frontend` 或 Electron 菜单 Help -> Toggle Electron Developer Tools

### 同时调试 Electron 前后端

- 打开调试视图，运行 `Launch Electron Backend & Frontend` 配置。

### 调试 IPC 服务器

- 启动时传递 `--${server-name}-inspect` 参数。
- 通过日志查找端口并附加调试器。

### 调试插件宿主（plugin host）

- 启动时传递 `--hosted-plugin-inspect=9339` 参数。
- 调试视图运行 `Attach to Plugin Host` 配置。
- 至少有一个插件被检测到时可连接，否则 60 秒后超时。
- 若需调试激活过程，启用 `stopOnEntry`。
- 打开浏览器页面。

---

### 插件源码调试

[原文链接](https://github.com/eclipse-theia/theia/issues/3251#issuecomment-468166533)

- 插件源码应放在 `${workspaceFolder}/plugins` 目录下
- 前端可从 <http://localhost:3030> 启动
- 建议在 launch.json 中配置如下：

```jsonc
{
    "name": "以 Theia 插件方式启动 VS Code 扩展",
    "type": "node",
    "request": "launch",
    "port": 9339,
    "timeout": 100000,
    "args": [
        "${workspaceFolder}/examples/browser/src-gen/backend/main.js",
        "${workspaceFolder}",
        "--port=3030",
        "--hosted-plugin-inspect=9339", // 以调试模式启动插件宿主
        "--plugins=local-dir:${workspaceFolder}/plugins"
    ],
    "stopOnEntry": false,
    "sourceMaps": true,
    "outFiles": [
        "${workspaceFolder}/**/*.js"
    ],
    "internalConsoleOptions": "openOnSessionStart",
    "outputCapture": "std"
}
```

#### 生成插件的 TypeScript 源码映射

在插件的 `tsconfig.json` 中启用 sourceMap：

```jsonc
{
    "compilerOptions": {
        "sourceMap": true
    }
}
```

如用 Webpack，需在 `package.json` 脚本中用 development 模式打包：

```sh
webpack --mode development
```

并在 **webpack.config.js** 启用 source-map：

```js
module.exports = {
    devtool: 'source-map'
}
```

#### 防止 TypeScript 向上查找父目录

如遇如下错误：

```sh
(parent folders)/index.d.ts: error TS2300: Duplicate identifier
```

可在 `tsconfig.json` 中添加：

```jsonc
{
    "compilerOptions": {
       "typeRoots": ["./node_modules/@types"]
    }
}
```

## 性能分析

- 前端：浏览器开发者工具
- 后端（Node.js）：chrome://inspect
- 采集内存快照前请先手动 GC
- 关闭浏览器扩展避免干扰
- 优化前后都要采集数据并记录复现方法

### 分析前端进程

- 浏览器：开发者工具
- Electron：Help -> Toggle Electron Developer Tools

### 分析后端进程

- 启动时加 `--inspect` 参数

### 分析 IPC 服务器

- 启动时加 `--${server-name}-inspect` 参数

### 分析插件宿主

- 启动时加 `--hosted-plugin-inspect` 参数

## 测试

- 见 [单元测试](Testing.md)
- 见 [API 集成测试](api-testing.md)

## 代码覆盖率

```sh
npm run test
```

默认会生成 HTML 格式的覆盖率报告，路径为 `packages/<package name>/coverage/index.html`。

## 在 Windows 上构建

- 安装 [`scoop`](https://github.com/lukesampson/scoop#installation)
- 用 scoop 安装 [`nvm`](https://github.com/coreybutler/nvm-windows)
- 用 nvm 安装 Node.js：`nvm install lts`，然后 `nvm use lts`
- 如需 `windows-build-tools`，见[下文](#安装-windows-build-tools)
- 如遇依赖问题，见 [`node-gyp` 文档](https://github.com/nodejs/node-gyp#on-windows)
- 需 Visual Studio [build tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022) 17
- 多版本 python/VS 时可手动指定版本

克隆、构建并运行 Theia：

```sh
git clone https://github.com/eclipse-theia/theia.git \
    && cd theia \
    && npm install \
    && npm run build:browser \
    && npm run start:browser
```

如无 Git Bash，[下载安装](https://gitforwindows.org/)，或用 scoop：`scoop install git`

### 安装 Windows Build Tools

- 以前需 [`windows-build-tools`](https://github.com/felixrieseberg/windows-build-tools)，现已弃用。
- 如需手动安装，管理员 PowerShell 执行：

```sh
npm --add-python-to-path install --global --production windows-build-tools
```

## 故障排查

> 首先确保你已正确按照[官方文档](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#run-the-browser-based-example-applicatio)操作。

### Linux

如遇 ENOSPC 错误，需增加 inotify 监听数：

```sh
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

### Windows

如遇 `LINK : fatal error LNK1104: cannot open file 'C:\\Users\\path\\to\\node.lib'`，用 `npm config set msvs_version 2017 --global` 指定 VS 版本。

如遇 `EPERM: operation not permitted` 或 `permission denied` 错误：
- 没有写权限
- 以管理员身份运行命令行
- 运行 `npm cache clean` 修复 NPM 缓存
- 如遇 `Error: EBUSY: resource busy or locked, rename`，尝试关闭杀毒软件
- 仍有问题请[提交 bug](https://github.com/eclipse-theia/theia/issues)

如用 Windows 10，建议开启 WSL 并用 Linux 子系统。

### macOS

需安装 Xcode 命令行工具：

```sh
xcode-select --install
```

如已安装 Xcode 但报错 `xcode-select: error: tool 'xcodebuild' requires Xcode`，运行：

```sh
sudo xcode-select --switch /Library/Developer/CommandLineTools
```

如升级到 10.14 (Mojave) 报 `gyp: No Xcode or CLT version detected!`，同上。

### Root 权限错误

如用 root 权限安装遇到 `cannot run in wd` 错误：
- 尽量不用 root
- 或加 `--unsafe-perm` 参数：`npm install --unsafe-perm`
