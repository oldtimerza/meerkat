const {
  app, BrowserWindow, ipcMain, Tray, Menu,
} = require('electron');
const path = require('path');
const url = require('url');

let tray;
let window;

const createWindow = () => {
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: true,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false,
    },
  });
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`);

  window.on('minimize', (event) => {
    event.preventDefault();
    window.hide();
  });

  window.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      window.hide();
    }

    return false;
  });

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  });

  // and load the index.html of the app.
  window.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  );
};

const showWindow = () => {
  window.center();
  window.show();
  window.focus();
};

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow();
  }
};

const contextMenu = Menu.buildFromTemplate([
  {
    label: 'Show App',
    click() {
      window.show();
    },
  },
  {
    label: 'Quit',
    click() {
      app.isQuiting = true;
      app.quit();
    },
  },
]);

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  tray.setContextMenu(contextMenu);
  tray.on('double-click', toggleWindow);
};

app.on('ready', () => {
  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('show-window', () => {
  showWindow();
});
