const {
  app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut,
} = require('electron');
const path = require('path');
const url = require('url');
const Datastore = require('nedb-promises');

let tray;
let window;

const todosdb = Datastore.create('./todos.db');

const createWindow = () => {
  window = new BrowserWindow({
    width: 640,
    height: 480,
    show: true,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false,
      nodeIntegration: true,
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


  globalShortcut.register('Alt+Space', () => {
    toggleWindow();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

const orderedTodos = () => todosdb.find({}).sort({ created: 1 });

ipcMain.on('show-window', () => {
  showWindow();
});

ipcMain.on('request-todos', () => {
  orderedTodos()
    .then((docs) => {
      window.webContents.send('todos', docs);
    });
});

ipcMain.on('add-todo', (event, arg) => {
  todosdb.insert(arg)
    .then(() => orderedTodos())
    .then((docs) => window.webContents.send('todos', docs));
});

ipcMain.on('update-todo', (event, arg) => {
  todosdb.update({ _id: arg._id }, { $set: { done: arg.done } }, { multi: true })
    .then(() => orderedTodos())
    .then((docs) => window.webContents.send('todos', docs));
});

ipcMain.on('remove-todo', (event, arg) => {
  todosdb.remove({ _id: arg._id }, { multi: true })
    .then(() => orderedTodos())
    .then((docs) => window.webContents.send('todos', docs));
});
