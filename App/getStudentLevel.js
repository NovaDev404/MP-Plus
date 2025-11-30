const { BrowserWindow } = require('electron');

module.exports = async function getStudentLevel(mainWindow, classSubdomain) {
  if (!mainWindow) return { ok: false, error: 'No mainWindow provided' };

  let hidden = null;
  
  try {
    let subdomain = classSubdomain;
    
    if (!subdomain) {
      try {
        const currentUrl = mainWindow.webContents.getURL();
        const m = currentUrl.match(/https?:\/\/([^./]+)\.mpclass\.com/);
        if (m && m[1]) subdomain = m[1];
      } catch (e) {}
    }

    if (!subdomain) {
      return { ok: false, error: 'No class subdomain provided and could not detect from main window URL. Make sure you are on a MPClass page.' };
    }

    const targetUrl = `https://${subdomain}.mpclass.com/parent`;

    const session = mainWindow.webContents.session;

    hidden = new BrowserWindow({
      show: false,
      webPreferences: {
        session,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    });

    return new Promise((resolve) => {
      let found = false;
      let timeoutId;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (hidden && !hidden.isDestroyed()) {
          hidden.close();
        }
      };

      timeoutId = setTimeout(() => {
        if (!found) {
          cleanup();
          resolve({ ok: false, error: 'Timeout: Could not find mastery point within 15 seconds' });
        }
      }, 15000);

      hidden.webContents.on('dom-ready', async () => {
        try {
          for (let i = 0; i < 30; i++) {
            const result = await hidden.webContents.executeJavaScript(`
              (function() {
                const divs = Array.from(document.querySelectorAll('div.flex.flex-column.ml4'));
                for (const div of divs) {
                  const h5 = div.querySelector('h5.mb0.mt0');
                  const p = div.querySelector('p');
                  
                  if (h5 && p) {
                    const pText = p.textContent.replace(/\\s+/g, ' ').trim().toLowerCase();
                    if (pText.includes('current') && pText.includes('mastery') && pText.includes('point')) {
                      const numText = h5.textContent.trim();
                      const numberMatch = numText.match(/^\\d+(?:\\.\\d+)?$/);
                      if (numberMatch) {
                        return numberMatch[0];
                      }
                    }
                  }
                }
                return null;
              })();
            `);

            if (result) {
              found = true;
              cleanup();
              resolve({ ok: true, number: String(result) });
              return;
            }
            
            await new Promise(r => setTimeout(r, 500));
          }

          cleanup();
          resolve({ ok: false, error: 'Could not find mastery point after multiple attempts. The page structure may have changed or you may not be logged in.' });
        } catch (err) {
          cleanup();
          resolve({ ok: false, error: String(err) });
        }
      });

      hidden.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        cleanup();
        resolve({ ok: false, error: `Failed to load page: ${errorDescription}` });
      });

      hidden.loadURL(targetUrl).catch(err => {
        cleanup();
        resolve({ ok: false, error: `Failed to load URL: ${err.message}` });
      });
    });

  } catch (err) {
    if (hidden && !hidden.isDestroyed()) {
      hidden.close();
    }
    return { ok: false, error: String(err) };
  }
};