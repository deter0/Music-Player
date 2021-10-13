"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var mainWindow;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1024,
        height: 1024,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        transparent: true
    });
    mainWindow.loadURL("http://localhost:3000");
}
electron_1.app.whenReady().then(createWindow);
