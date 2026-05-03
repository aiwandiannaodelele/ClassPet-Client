# ClassPet Client (Desktop)

A cross-platform desktop client for ClassPet, built with **Tauri v2** and **Next.js**.

## ✨ Features

- **Transparent Floating Ball**: A movable, transparent floating window on your desktop to display real-time app status.
- **High-Performance Architecture**: Powered by Rust (Tauri) for minimal memory footprint and blazing fast performance.
- **Modern UI**: Frontend built with Next.js and shadcn/ui for a polished, responsive user experience.
- **Server Selection**: Built-in official server selection and support for custom instance URLs.
- **System Tray Integration**: Full-featured system tray menu for quick toggling between the main window and the floating ball.
- **Permission Management**: Pre-configured privacy descriptions for macOS microphone and camera access.

## 🛠️ Tech Stack

- **Backend**: [Tauri v2](https://v2.tauri.app/) (Rust)
- **Frontend**: [Next.js](https://nextjs.org/) (React, Tailwind CSS, shadcn/ui)
- **Build Tool**: npm + cargo

## 🚀 Getting Started

### Prerequisites

1. Install [Rust](https://www.rust-lang.org/tools/install).
2. Install Node.js (v18+ recommended).
3. Install Tauri dependencies (see [Tauri Documentation](https://v2.tauri.app/start/prerequisites/)).

### Development

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd web
npm install
cd ..

# Start development environment
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

## 📂 Project Structure

- `src-tauri/`: Rust backend logic and configuration.
- `web/`: Next.js frontend application.
- `.github/workflows/`: GitHub Actions for automated builds.

## 📄 License

This project is licensed under the **AGPL-3.0 License**.
