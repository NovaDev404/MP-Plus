const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const getStudentLevel = require('./getStudentLevel');
const path = require('path');
const fs = require('fs');
const os = require('os');

const configPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'mp-plus');
const filePath = path.join(configPath, 'class.json');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "MP+",
    icon: path.join(__dirname, 'logo.png'),
    backgroundColor: "#071019",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false,
    autoHideMenuBar: true
  });

    // Inject login-page "New Class" button
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.executeJavaScript(`
        (() => {
          const checkAndInject = () => {
            const isLoginPage = location.pathname === '/login' || 
                                location.pathname.endsWith('/login') ||
                                location.href.includes('/login');
            if (!isLoginPage) {
              const existing = document.getElementById('mpplus-new-class-btn');
              if (existing) existing.remove();
              return;
            }
  
            if (document.getElementById('mpplus-new-class-btn')) return; // already added
  
            const a = document.createElement('a');
            a.id = 'mpplus-new-class-btn';
            a.href = 'javascript:void(0)';
            a.textContent = 'Switch Class';
            a.style.cssText = \`
              position: fixed;
              top: 12px;
              right: 20px;
              color: red !important;
              text-decoration: none !important;
              font-weight: bold;
              font-size: 14px;
              cursor: pointer;
              padding: 6px 10px;
              border: 2px solid red;
              border-radius: 6px;
              background: rgba(255,255,255,0.95);
            \`;
            a.onclick = async () => {
              const confirmed = await window.mpplus.showConfirm({
                title: 'MP+',
                message: 'Are you sure you want to switch class?'
              });
              if (confirmed) {
                await window.mpplus.clearClassAndReload();
              }
            };
            document.body.appendChild(a);
          };
  
          checkAndInject();
  
          // Also handle SPA navigation (history.pushState / replaceState)
          const observer = new MutationObserver(checkAndInject);
          observer.observe(document, { childList: true, subtree: true });
  
          // Fallback for pushState/replaceState
          const origPush = history.pushState;
          const origReplace = history.replaceState;
          history.pushState = function(...args) {
            origPush.apply(this, args);
            setTimeout(checkAndInject, 100);
          };
          history.replaceState = function(...args) {
            origReplace.apply(this, args);
            setTimeout(checkAndInject, 100);
          };
          window.addEventListener('popstate', () => setTimeout(checkAndInject, 100));
        })();
      `).catch(err => console.error('Inject failed', err));
    });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load saved config URL or default classLogin.html
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (data && data.url) {
        mainWindow.loadURL(data.url).catch(err => {
          console.error('Failed to load saved URL, falling back to classLogin.html:', err);
          mainWindow.loadFile('classLogin.html').catch(e => console.error('Failed to load classLogin.html', e));
        });
        return;
      }
    } catch (err) {
      console.error('Error reading class.json', err);
    }
  }

  mainWindow.loadFile('classLogin.html').catch(err => console.error('Failed to load classLogin.html', err));
}

app.whenReady().then(createWindow);

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Recreate window on macOS when dock icon clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC handlers for saving/loading/opening URL
ipcMain.handle('save-url', async (_, url) => {
  try {
    if (!fs.existsSync(configPath)) fs.mkdirSync(configPath, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ url }), 'utf-8');
    return { ok: true };
  } catch (err) {
    console.error('Failed to save URL', err);
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('load-url', async () => {
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return { ok: true, url: data.url || null };
    }
    return { ok: true, url: null };
  } catch (err) {
    console.error('Failed to load URL', err);
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('open-url', async (_, url) => {
  try {
    if (mainWindow) {
      await mainWindow.loadURL(url);
      return { ok: true };
    }
    return { ok: false, error: 'No main window' };
  } catch (err) {
    console.error('Failed to open URL', err);
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('show-confirm-dialog', async (_, options) => {
  if (!mainWindow) return false;
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Yes', 'No'],
    defaultId: 1,
    cancelId: 1,
    title: options.title || 'Confirm',
    message: options.message || 'Are you sure?',
  });
  return result.response === 0;
});

ipcMain.handle('get-branding-code', async () => {
  try {
    // adjust path if you store injectBranding.js in a different folder
    const p = path.join(__dirname, 'injectBranding.js');
    const code = fs.readFileSync(p, 'utf8');
    return { ok: true, code };
  } catch (err) {
    console.error('[MP+] failed to read injectBranding.js', err);
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('fetch-student-level', async (_, classSubdomain) => {
  try {
    const res = await getStudentLevel(mainWindow, classSubdomain);
    
    if (res.ok && res.number) {
      const currentUrl = mainWindow.webContents.getURL();
      if (currentUrl.includes('/timeline/')) {
        await mainWindow.webContents.executeJavaScript(`
          (() => {
            const element = document.querySelector('a.dib.pt3.mv2.link.blue');
            if (element) {
              element.style.marginBottom = '0';
              
              // Check if the p already exists to avoid duplicates
              let p = element.nextElementSibling;
              if (p && p.tagName === 'P' && p.style.marginTop === '0' && p.style.color === 'black') {
                p.innerHTML = '<b>${res.number}</b>';
              } else {
                p = document.createElement('p');
                p.style.marginTop = '0';
                p.style.marginBottom = '0';
                p.style.color = 'black';
                p.innerHTML = '<b>${res.number}</b>';
                element.insertAdjacentElement('afterend', p);
              }
            }
          })();
        `);
      }
      return { ok: true, number: res.number };
    } else {
      return { ok: false, error: res.error || 'Unknown error occurred' };
    }
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('clear-class-and-reload', async () => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (mainWindow) {
      await mainWindow.loadFile(path.join(__dirname, 'classLogin.html'));
    }
    return { ok: true };
  } catch (err) {
    console.error('Failed to clear class', err);
    return { ok: false, error: String(err) };
  }
});

/*
  New: SPA-safe context menu handler.
  The preload script will invoke 'show-context-menu' with coords and metadata.
  We build the menu here and popup it for the window that invoked the IPC (robust for iframes / multiple windows).
*/
ipcMain.handle("show-context-menu",(e,l)=>{try{let o=BrowserWindow.fromWebContents(e.sender);if(!o)return;let t=!!l.selection,n=!!l.isEditable,r=[{role:"undo",enabled:n},{role:"redo",enabled:n},{type:"separator",visible:n},{role:"cut",enabled:n},{role:"copy",enabled:t||n},{role:"paste",enabled:n},{role:"selectAll"},{type:"separator"},{label:"Back",enabled:o.webContents.navigationHistory.canGoBack(),click:()=>o.webContents.navigationHistory.goBack()},{type:"separator"},{role:"reload"},{role:"forcereload"},{type:"separator"},{role:"toggledevtools"},{label:"Inspect Element",click(){try{o.webContents.inspectElement(l.x,l.y),o.webContents.isDevToolsOpened()||o.webContents.openDevTools({mode:"detach"})}catch(e){console.error("Inspect element failed",e)}}}];l.linkURL?r.unshift({label:"Open Link in Default Browser",click:()=>require("electron").shell.openExternal(l.linkURL)},{type:"separator"}):l.srcURL&&r.unshift({label:"Open Image in Default Browser",click:()=>require("electron").shell.openExternal(l.srcURL)},{type:"separator"});let a=Menu.buildFromTemplate(r);a.popup({window:o})}catch(s){console.error("show-context-menu handler error",s)}});