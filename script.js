(function () {
    window.MP_Tools = function () {
        if (document.getElementById('mp-tools-panel')) {
            document.getElementById('mp-tools-panel').remove();
            return;
        }
        createPanel();
    };
    function createPanel() {
        const p = document.createElement('div');
        p.id = 'mp-tools-panel';
        p.style.cssText = `
            position:fixed;right:12px;top:12px;width:420px;z-index:2147483647;
            background:#0f1724;color:#e6eef8;padding:12px;border-radius:10px;
            box-shadow:0 8px 32px rgba(2,6,23,.7);font-family:Arial,Helvetica,sans-serif;
            font-size:13px;box-sizing:border-box;user-select:none;
        `;
        const h = document.createElement('div');
        h.style.cssText = `
            font-weight:700;margin-bottom:8px;display:flex;
            justify-content:space-between;align-items:center;cursor:grab;
        `;
        h.textContent = 'MP Tools';
        const x = document.createElement('button');
        x.textContent = 'X';
        x.title = 'Close';
        x.style.cssText = `
            background:transparent;border:0;color:inherit;
            cursor:pointer;font-size:14px;padding:4px 8px;
        `;
        x.onclick = () => p.remove();
        h.appendChild(x);
        p.appendChild(h);
        const i = document.createElement('div');
        i.textContent = 'Choose a tool:';
        i.style.marginBottom = '8px';
        p.appendChild(i);
        const cols = document.createElement('div');
        cols.style.cssText = 'display:flex;gap:10px;';
        const c1 = column();
        const c2 = column();
        const startBtn = btn('Start Speedrunner', '#16a34a', '#fff');
        const stopBtn = btn('Stop Speedrunner', '#ef4444', '#fff');
        stopBtn.style.marginBottom = '12px';
        c1.appendChild(startBtn);
        c1.appendChild(stopBtn);
        const enableBtn = btn('Enable Right Click', '#16a34a', '#fff');
        const disableBtn = btn('Disable Right Click', '#ef4444', '#fff');
        disableBtn.style.marginBottom = '12px';
        c2.appendChild(enableBtn);
        c2.appendChild(disableBtn);
        const calcBtn = btn('Open Calculator', '#0ea5a4', '#fff');
        c1.appendChild(calcBtn);
        const openAiBtn = btn('Open AI', '#0ea5a4', '#fff');
        c2.appendChild(openAiBtn);
        cols.appendChild(c1);
        cols.appendChild(c2);
        p.appendChild(cols);
        document.body.appendChild(p);
        speedrunner(startBtn, stopBtn);
        rightClick(enableBtn, disableBtn);
        draggable(p, h);
        calcBtn.onclick = () => openCalculator();
        openAiBtn.onclick = () => openOpenAI(); // hook up new button
    }
    function column() {
        const d = document.createElement('div');
        d.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:8px;';
        return d;
    }
    function btn(text, bg, fg) {
        const b = document.createElement('button');
        b.textContent = text;
        b.style.cssText = `
            width:100%;padding:10px;border-radius:8px;border:0;
            cursor:pointer;box-sizing:border-box;font-weight:700;
            font-size:12px;background:${bg};color:${fg};
        `;
        return b;
    }
    function speedrunner(start, stop) {
        start.onclick = async function () {
            if (window.__autoClickerRunning) return console.log('Speedrunner already running');
            window.__autoClickerStopRequested = false;
            window.__autoClickerRunning = true;
            const wait = (sel, txt, to = 10000) => new Promise((res, rej) => {
                const s = Date.now();
                const iv = setInterval(() => {
                    const els = [...document.querySelectorAll(sel)];
                    for (const el of els) if (el.textContent.trim() === txt) { clearInterval(iv); res(el); return; }
                    if (Date.now() - s > to) { clearInterval(iv); rej(new Error('Timeout: ' + txt)); }
                }, 200);
            });
            const sleep = ms => new Promise(r => setTimeout(r, ms));
            try {
                while (!window.__autoClickerStopRequested) {
                    try {
                        (await wait('div.bottom-button.card-button.check-button.flex.items-center.relative.right-button.round-button',
                                    'Check my answer')).click();
                        (await wait('div.next-button.ph3.pv2.card-button.round-button.bottom-button.left-button.flex.items-center.mr2',
                                    'Complete question')).click();
                        await sleep(3000);
                    } catch { await sleep(1000); }
                }
            } finally {
                window.__autoClickerRunning = false;
                console.log('Speedrunner stopped');
            }
        };
        stop.onclick = () => {
            window.__autoClickerStopRequested = true;
            window.__autoClickerRunning = false;
            console.log('Stop requested');
        };
    }
    function rightClick(enable, disable) {
        enable.onclick = function () {
            if (window.__allowRClickInterval) return console.log('Already running');
            const handler = e => { try { e.stopImmediatePropagation(); } catch (_) {} };
            const purge = () => {
                document.oncontextmenu = document.onmousedown = document.onmouseup = null;
                document.querySelectorAll('*').forEach(el => {
                    el.oncontextmenu = el.onmousedown = el.onmouseup = null;
                });
                ['contextmenu','mousedown','mouseup'].forEach(ev => {
                    window.addEventListener(ev, handler, true);
                    document.addEventListener(ev, handler, true);
                });
                window.__allowRClick_installed = true;
                window.__allowRClick_handler = handler;
            };
            window.__allowRClickInterval = setInterval(purge, 50);
            console.log('Right-click unblocker ON');
        };
        disable.onclick = function () {
            if (window.__allowRClickInterval) clearInterval(window.__allowRClickInterval);
            if (window.__allowRClick_installed && window.__allowRClick_handler) {
                ['contextmenu','mousedown','mouseup'].forEach(ev => {
                    try { window.removeEventListener(ev, window.__allowRClick_handler, true); } catch (_) {}
                    try { document.removeEventListener(ev, window.__allowRClick_handler, true); } catch (_) {}
                });
            }
            window.__allowRClick_installed = false;
            window.__allowRClick_handler = null;
            window.__allowRClickInterval = null;
            console.log('Right-click unblocker OFF');
        };
    }
    function openCalculator() {
        const existingPanel = document.getElementById('mp-desmos-panel');
        if (existingPanel) {
            existingPanel.style.display = existingPanel.style.display === 'none' ? '' : existingPanel.style.display;
            existingPanel.style.zIndex = 2147483648;
            return;
        }
        const panel = document.createElement('div');
        panel.id = 'mp-desmos-panel';
        panel.style.cssText = `
            position:fixed;left:12px;top:12px;width:420px;height:500px;z-index:2147483648;
            background:#fff;color:#111;border-radius:8px;border:1px solid #bbb;
            box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:Arial,Helvetica,sans-serif;
            box-sizing:border-box;user-select:none;padding:0;overflow:hidden;
        `;
        const header = document.createElement('div');
        header.style.cssText = `
            display:flex;align-items:center;justify-content:space-between;
            background:#2b2f33;color:#fff;padding:8px 10px;cursor:grab;
            font-weight:700;font-size:13px;
        `;
        header.innerHTML = `<span style="pointer-events:none;">Calculator</span>`;
        const headerBtns = document.createElement('div');
        headerBtns.style.cssText = 'display:flex;gap:6px;align-items:center;';
        const closeBtn = document.createElement('button');
        closeBtn.title = 'Close';
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background:transparent;border:0;color:inherit;cursor:pointer;padding:2px 6px;
            font-size:14px;
        `;
        headerBtns.appendChild(closeBtn);
        header.appendChild(headerBtns);
        panel.appendChild(header);
        const body = document.createElement('div');
        body.id = 'mp-desmos-body';
        body.style.cssText = `
            width:100%;height:calc(100% - 42px);padding:8px;box-sizing:border-box;
            background:transparent;
        `;
        const desmosContainer = document.createElement('div');
        desmosContainer.id = 'scientificCalc';
        desmosContainer.style.cssText = 'width:100%;height:100%;border-radius:6px;overflow:hidden;';
        body.appendChild(desmosContainer);
        panel.appendChild(body);
        document.body.appendChild(panel);
        if (typeof draggable === 'function') {
            draggable(panel, header);
        } else {
            (function simpleDrag() {
                let dragging = false, ox = 0, oy = 0;
                const move = e => {
                    const x = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
                    const y = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
                    if (!dragging || x == null) return;
                    panel.style.left = (x - ox) + 'px';
                    panel.style.top = (y - oy) + 'px';
                    panel.style.right = '';
                };
                const up = () => {
                    dragging = false;
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                    document.removeEventListener('touchmove', move);
                    document.removeEventListener('touchend', up);
                    header.style.cursor = 'grab';
                };
                header.addEventListener('mousedown', e => {
                    dragging = true;
                    const r = panel.getBoundingClientRect();
                    ox = e.clientX - r.left;
                    oy = e.clientY - r.top;
                    document.addEventListener('mousemove', move);
                    document.addEventListener('mouseup', up);
                    header.style.cursor = 'grabbing';
                    e.preventDefault();
                });
                header.addEventListener('touchstart', e => {
                    dragging = true;
                    const t = e.touches[0];
                    const r = panel.getBoundingClientRect();
                    ox = t.clientX - r.left;
                    oy = t.clientY - r.top;
                    document.addEventListener('touchmove', move);
                    document.addEventListener('touchend', up);
                    header.style.cursor = 'grabbing';
                    e.preventDefault();
                });
            })();
        }
        closeBtn.onclick = () => {
            try {
                if (window.__mp_desmos_instance && typeof window.__mp_desmos_instance.destroy === 'function') {
                    window.__mp_desmos_instance.destroy();
                }
            } catch (err) {}
            window.__mp_desmos_instance = null;
            panel.remove();
        };
        function ensureDesmos() {
            if (window.Desmos) return Promise.resolve();
            if (window.__mp_desmos_loading_promise) return window.__mp_desmos_loading_promise;
            window.__mp_desmos_loading_promise = new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://www.desmos.com/api/v1.11/calculator.js?apiKey=78043328c170484d8c2b47e1013a0d12';
                s.async = true;
                s.onload = () => resolve();
                s.onerror = (e) => reject(new Error('Failed to load Desmos script'));
                document.head.appendChild(s);
            });
            return window.__mp_desmos_loading_promise;
        }
        function initDesmos() {
            try {
                if (!document.getElementById('scientificCalc')) {
                    console.error('Desmos container missing');
                    return;
                }
                if (window.__mp_desmos_instance) {
                    try { if (typeof window.__mp_desmos_instance.update === 'function') window.__mp_desmos_instance.update(); } catch(_) {}
                    return;
                }
                window.__mp_desmos_instance = Desmos && Desmos.ScientificCalculator
                    ? Desmos.ScientificCalculator(document.getElementById('scientificCalc'), { keypad: true })
                    : null;
                if (!window.__mp_desmos_instance) console.error('Desmos object not available or API changed');
            } catch (err) {
                console.error('Error initialising Desmos', err);
            }
        }
        ensureDesmos().then(initDesmos).catch(err => {
            console.error('Failed to load Desmos calculator:', err);
            const errNotice = document.createElement('div');
            errNotice.style.cssText = 'padding:10px;color:#900;font-weight:700;';
            errNotice.textContent = 'Desmos failed to load.';
            body.appendChild(errNotice);
        });
        panel.addEventListener('mousedown', () => {
            panel.style.zIndex = 2147483648;
        });
    }
    function openOpenAI() {
        const content = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#fff;color:#111}
          .hero{padding:18px;text-align:center}
          .btn{display:inline-block;padding:8px 12px;border-radius:6px;border:1px solid #ccc;background:#f3f4f6;cursor:pointer}
        </style>
      </head>
      <body>
        <div class="hero">
          <h1>Hello from inside the popup 🎉</h1>
          <p>Replace this whole block with your markup.</p>
          <button class="btn" onclick="alert('Button inside popup clicked!')">Click me</button>
        </div>
        <script>
          // inline script WILL run thanks to the host code that re-injects scripts
          console.log('inline script executed from popup content');
        </script>
      </body>
    </html>
    `;

        const title = 'AI Chat';

        const existingPanel = document.getElementById('mp-aichat-panel');
        if (existingPanel) {
            existingPanel.style.display = existingPanel.style.display === 'none' ? '' : existingPanel.style.display;
            existingPanel.style.zIndex = 2147483648;
            const container = existingPanel.querySelector('#mp-popup-container');
            const headerTitle = existingPanel.querySelector('.mp-header-title');
            if (container) injectContent(container, content);
            if (headerTitle) headerTitle.textContent = title;
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'mp-aichat-panel';
        panel.style.cssText = `
            position:fixed;left:12px;top:12px;width:620px;height:480px;z-index:2147483648;
            background:#fff;color:#111;border-radius:8px;border:1px solid #bbb;
            box-shadow:0 8px 30px rgba(0,0,0,.35);font-family:Arial,Helvetica,sans-serif;
            box-sizing:border-box;user-select:none;padding:0;overflow:hidden;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            display:flex;align-items:center;justify-content:space-between;
            background:#121416;color:#fff;padding:8px 10px;cursor:grab;
            font-weight:700;font-size:13px;
        `;
        header.innerHTML = `<span class="mp-header-title" style="pointer-events:none;">${title}</span>`;

        const headerBtns = document.createElement('div');
        headerBtns.style.cssText = 'display:flex;gap:6px;align-items:center;';
        const closeBtn = document.createElement('button');
        closeBtn.title = 'Close';
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background:transparent;border:0;color:inherit;cursor:pointer;padding:2px 6px;
            font-size:14px;
        `;
        headerBtns.appendChild(closeBtn);
        header.appendChild(headerBtns);
        panel.appendChild(header);

        const body = document.createElement('div');
        body.id = 'mp-aichat-body';
        body.style.cssText = `
            width:100%;height:calc(100% - 42px);padding:8px;box-sizing:border-box;
            background:transparent;
        `;

        const container = document.createElement('div');
        container.id = 'mp-popup-container';
        container.style.cssText = 'width:100%;height:100%;border-radius:6px;overflow:auto;background:#fff;';
        body.appendChild(container);
        panel.appendChild(body);
        document.body.appendChild(panel);

        // inject content (no iframe). This also executes scripts inside the HTML.
        injectContent(container, content);

        // Draggable behaviour (uses external draggable() if available, otherwise simple internal drag)
        if (typeof draggable === 'function') {
            draggable(panel, header);
        } else {
            (function simpleDrag() {
                let dragging = false, ox = 0, oy = 0;
                const move = e => {
                    const x = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
                    const y = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
                    if (!dragging || x == null) return;
                    panel.style.left = (x - ox) + 'px';
                    panel.style.top = (y - oy) + 'px';
                    panel.style.right = '';
                };
                const up = () => {
                    dragging = false;
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                    document.removeEventListener('touchmove', move);
                    document.removeEventListener('touchend', up);
                    header.style.cursor = 'grab';
                };
                header.addEventListener('mousedown', e => {
                    dragging = true;
                    const r = panel.getBoundingClientRect();
                    ox = e.clientX - r.left;
                    oy = e.clientY - r.top;
                    document.addEventListener('mousemove', move);
                    document.addEventListener('mouseup', up);
                    header.style.cursor = 'grabbing';
                    e.preventDefault();
                });
                header.addEventListener('touchstart', e => {
                    dragging = true;
                    const t = e.touches[0];
                    const r = panel.getBoundingClientRect();
                    ox = t.clientX - r.left;
                    oy = t.clientY - r.top;
                    document.addEventListener('touchmove', move);
                    document.addEventListener('touchend', up);
                    header.style.cursor = 'grabbing';
                    e.preventDefault();
                });
            })();
        }

        closeBtn.onclick = () => {
            try { panel.remove(); } catch (err) {}
        };

        panel.addEventListener('mousedown', () => {
            panel.style.zIndex = 2147483648;
        });

        // -------------------------
        // helper: inject HTML and execute scripts inside it
        // -------------------------
        function injectContent(targetElement, htmlString) {
            // put raw HTML into container
            targetElement.innerHTML = htmlString;

            // find any <script> tags and re-run them properly
            // (innerHTML doesn't execute inline scripts, so we recreate them)
            const scripts = Array.from(targetElement.querySelectorAll('script'));
            for (const oldScript of scripts) {
                const newScript = document.createElement('script');

                // copy attributes (type, src, async, etc)
                for (const attr of oldScript.attributes) {
                    newScript.setAttribute(attr.name, attr.value);
                }

                if (oldScript.src) {
                    // external script: set src and append so it loads and executes
                    newScript.src = oldScript.src;
                    // preserve async/defer if present
                    if (oldScript.async) newScript.async = oldScript.async;
                    if (oldScript.defer) newScript.defer = oldScript.defer;
                    // append and wait (optional) — we just append
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                } else {
                    // inline script: copy the text content so it runs
                    newScript.textContent = oldScript.textContent;
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                }
            }
        }
    }
    function draggable(panel, handle) {
        let dragging = false, ox = 0, oy = 0;
        const move = e => {
            const x = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
            const y = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
            if (!dragging || x == null) return;
            panel.style.left = (x - ox) + 'px';
            panel.style.top = (y - oy) + 'px';
            panel.style.right = '';
        };
        const up = () => {
            dragging = false;
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', up);
            if (handle) handle.style.cursor = 'grab';
        };
        handle.addEventListener('mousedown', e => {
            dragging = true;
            const r = panel.getBoundingClientRect();
            ox = e.clientX - r.left;
            oy = e.clientY - r.top;
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
            handle.style.cursor = 'grabbing';
            e.preventDefault();
        });
        handle.addEventListener('touchstart', e => {
            dragging = true;
            const t = e.touches[0];
            const r = panel.getBoundingClientRect();
            ox = t.clientX - r.left;
            oy = t.clientY - r.top;
            document.addEventListener('touchmove', move);
            document.addEventListener('touchend', up);
            handle.style.cursor = 'grabbing';
            e.preventDefault();
        });
    }
})();
