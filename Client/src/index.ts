import { app, BrowserWindow } from "electron"

let mainWindow

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1024,
		height: 1024,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
		transparent: true
	});
	mainWindow.loadURL(`http://localhost:3000`);
}

app.whenReady().then(createWindow)