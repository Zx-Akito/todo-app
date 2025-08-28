# 📝 Todo App - Tauri Edition  

A simple and fast **cross-platform Todo App** built with [Tauri](https://tauri.app/).  
This project combines a lightweight **Rust backend** with a modern **web frontend** to create a desktop application that is:  

✨ **Secure** – Powered by Rust’s memory safety and Tauri’s secure APIs  
⚡ **Lightweight** – App size in just a few MB (unlike heavy Electron apps)  
🖥 **Cross-Platform** – Runs on Windows, macOS, and Linux  
🔒 **Private** – Your data stays on your device, no cloud required  

---

## 🚀 Features
- Add, edit, and delete todos  
- Mark tasks as completed  
- Persistent storage (local database or JSON file)  
- Clean and responsive UI  
- Cross-platform desktop build with Tauri  

---

## 🛠 Tech Stack
- **Frontend**: React / Vue / Svelte (choose your favorite)  
- **Backend**: Rust + Tauri  
- **Storage**: Local JSON / SQLite  

---

## 📦 Getting Started
```bash
# clone the repo
git clone https://github.com/Zx-Akito/todo-app.git
cd todo-tauri

# install dependencies
npm install   # or pnpm/yarn

# run in development mode
npm run tauri dev

# build for production
npm run tauri build
