const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain, globalShortcut} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow

// Listen for app to be ready
app.on('ready', function() {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  // Load HTML into window.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Quit app when closed
  mainWindow.on('closed', function() {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);

  // Register global shortcut to quit
  globalShortcut.register(process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q', () => app.quit());
});

// Handle create add window
function createAddWindow() {
  addWindow = new BrowserWindow({
    height: 200,
    width: 300,
    title: 'Add Shopping List Item',
    webPreferences: {
      nodeIntegration: true
    }
  });
  // Load HTML into window.
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Remove menubar from addWindow when in production
  if(process.env.NODE_ENV == 'production') {
    addWindow.setMenu(null);
  }
  // Garbage collection handle
  addWindow.on('close', function() {
    addWindow = null;
  });
}

// Catch item:add
ipcMain.on('item:add', function(e, item) {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        click() {
          app.quit();
        }
      }
    ]
  }
];

// If mac, add empty object to menu
if(process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if (process.env.NODE_ENV != 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}
