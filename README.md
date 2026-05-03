# ClassPet Client (桌面端)

ClassPet 的跨平台桌面客户端，基于 **Tauri v2** 和 **Next.js** 构建。

## ✨ 功能特性

- **透明悬浮球**：支持在桌面上随意拖动的透明悬浮窗口，实时展示应用状态。
- **高性能架构**：利用 Rust 构建后端，确保极低的内存占用和极快的响应速度。
- **现代化 UI**：前端采用 Next.js + shadcn/ui，界面精致且支持响应式。
- **服务器选择**：内置官方服务器快速选择，支持自定义实例地址。
- **托盘管理**：完善的系统托盘菜单，支持主窗口与悬浮球的快速切换。
- **权限管理**：预设 macOS 麦克风与摄像头权限声明，开箱即用。

## 🛠️ 技术栈

- **后端**: [Tauri v2](https://v2.tauri.app/) (Rust)
- **前端**: [Next.js](https://nextjs.org/) (React, Tailwind CSS, shadcn/ui)
- **构建工具**: npm + cargo

## 🚀 快速开始

### 开发环境准备

1. 安装 [Rust](https://www.rust-lang.org/tools/install)。
2. 安装 Node.js (建议 v18+)。
3. 安装 Tauri 依赖（具体参考 [Tauri 官方文档](https://v2.tauri.app/start/prerequisites/)）。

### 启动开发服务器

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd web
npm install
cd ..

# 启动 tauri 开发环境
npm run tauri dev
```

### 构建发布版本

```bash
npm run tauri build
```

## 📂 项目结构

- `src-tauri/`: Rust 后端代码及配置。
- `web/`: Next.js 前端项目。
- `.github/workflows/`: GitHub Actions 自动构建脚本。

## 📄 许可证

MIT License
