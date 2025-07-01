const { app, BrowserWindow, WebContentsView, ipcMain, Tray, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// --- Configuration Management ---
const configPath = path.join(__dirname, 'config.json');

function getConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Missing config.json. Please create one in the project root.`);
    }
    const savedConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (!savedConfig.chatUrl || !savedConfig.slackUrl) {
      throw new Error(`config.json must include \"chatUrl\" and \"slackUrl\".`);
    }
    return savedConfig;
  } catch (error) {
    console.error(error.message);
    app.quit();
    process.exit(1);
  }
}

const config = getConfig();

let tray = null;
let win = null;

function createWindow () {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets', 'chatdock-logo.png'), // Set custom window icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    }
  });

  // Create two WebContentsView instances
  const chatView = new WebContentsView();
  const slackView = new WebContentsView();

  // Open external links in default browser for both views
  [chatView, slackView].forEach(view => {
    view.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
    view.webContents.on('will-navigate', (event, url) => {
      // Only intercept if navigating away from the original domain
      if (url !== view.webContents.getURL()) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });
  });

  win.contentView.addChildView(chatView);
  win.contentView.addChildView(slackView);

  chatView.webContents.loadURL(config.chatUrl);
  slackView.webContents.loadURL(config.slackUrl);

  const topBarHeight = 40; // Height of your tab bar

  const updateViewBounds = () => {
    const [width, height] = win.getSize();
    const bounds = { x: 0, y: topBarHeight, width: width, height: height - topBarHeight };
    chatView.setBounds(bounds);
    slackView.setBounds(bounds);
  };

  // Set initial bounds and update on resize
  updateViewBounds();
  win.on('resize', updateViewBounds);

  // Initially, show chat and hide slack
  slackView.setBounds({ x: -2000, y: topBarHeight, width: 0, height: 0 });

  // Listen for tab switching messages
  ipcMain.on('show-view', (event, viewName) => {
    const [width, height] = win.getSize();
    const activeBounds = { x: 0, y: topBarHeight, width: width, height: height - topBarHeight };
    const inactiveBounds = { x: -2000, y: topBarHeight, width: 0, height: 0 };

    if (viewName === 'chat') {
      chatView.setBounds(activeBounds);
      slackView.setBounds(inactiveBounds);
    } else if (viewName === 'slack') {
      slackView.setBounds(activeBounds);
      chatView.setBounds(inactiveBounds);
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile('index.html');

  // --- Tray Integration ---
  // Use a default icon if you don't have your own
  const trayIcon = path.join(__dirname, 'assets', 'chatdock-logo.png'); // Use custom tray icon
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => win.show() },
    { label: 'Minimize to Tray', click: () => win.hide() },
    { label: 'Quit', click: () => { app.quit(); } }
  ]);
  tray.setToolTip('ChatDock');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => win.show());

  win.on('close', (event) => {
    // Hide window instead of closing (unless quitting)
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }
  });
}

// Set the dock icon on macOS
if (process.platform === 'darwin') {
  app.whenReady().then(() => {
    app.dock.setIcon(path.join(__dirname, 'assets', 'chatdock-logo.png'));
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
});
