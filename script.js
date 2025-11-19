(function () {
    // Prevent multiple injections / double initialization
    if (window.__mpToolsInitialized) {
        console.log('MP-Tools: already initialized — skipping re-init');
        return;
    }
    window.__mpToolsInitialized = true;
    /* -------------------------
       Persistent global state
       ------------------------- */
    function loadState() {
        try {
            const raw = localStorage.getItem('__mpToolsState_v2');
            if (raw) {
                window.__mpToolsState = JSON.parse(raw);
            } else {
                window.__mpToolsState = {
                    speedrunner: false,
                    rightClick: false,
                    removeAnnoying: false,
                    progressTheme: 'default' // default | brimblecombe | baldock | warren | white
                };
            }
        } catch (e) {
            window.__mpToolsState = {
                speedrunner: false,
                rightClick: false,
                removeAnnoying: false,
                progressTheme: 'default'
            };
        }
    }
    function saveState() {
        try {
            localStorage.setItem('__mpToolsState_v2', JSON.stringify(window.__mpToolsState || {}));
        } catch (e) { /* ignore */ }
    }
    // init global state
    if (!window.__mpToolsState) loadState();
    /* -------------------------
       Updated Progress Bar Themes – now emoji-only, no text labels
       Emojis are stored in arrays (no duplicates in the array itself)
       When rendered, the emoji sequence repeats to fill the full width of the bar
       ------------------------- */
    const THEMES = {
        default: { gradient: 'linear-gradient(rgb(104, 210, 255), rgb(63, 145, 225))', emojis: [] }, // no overlay emojis
        brimblecombe: {
            gradient: 'linear-gradient(red, maroon)',
            emojis: ['🧡','🦌','🔴','📖', 'BRIMBLECOMBE']
        },
        baldock: {
            gradient: 'linear-gradient(limegreen, green)',
            emojis: ['💚','⚓','🟢','📖', 'BALDOCK']
        },
        warren: {
            gradient: 'linear-gradient(skyblue, blue)',
            emojis: ['💙','🪖','🔵','📖', 'WARREN']
        },
        white: {
            gradient: 'linear-gradient(yellow, orange)',
            emojis: ['💛','🐦‍🔥','🟡','📖', 'WHITE']
        },
        christmas: {
            gradient: 'linear-gradient(white, white, green, red, red)',
            emojis: ['🎅','🎄','🎁','✨','☃️','❄️','🦌','⛄','🔔', 'CHRISTMAS']
        },
        halloween: {
            gradient: 'linear-gradient(white, orange, black)',
            emojis: ['☠️','🍬','🏚️','👻','🫣','👺','💀','🦇','🎃', 'HALLOWEEN']
        },
        easter: {
            gradient: 'linear-gradient(#FFD1DC, #E3E4FA, #AAF0D1)',
            emojis: ['🐤','🐰','🐥','🎁','🌈','🦋','🥚','🌷','🐣', 'EASTER']
        },
        patricks: {
            gradient: 'linear-gradient(green, darkgreen, orange)',
            emojis: ['🍀','💚','🤞','💰','🌈','☘️','🪙','🍻', 'ST PATRICKS DAY']
        },
        ocean: {
            gradient: 'linear-gradient(#00BCBC, lightblue, lightblue, lightyellow, lightyellow)',
            emojis: ['𓇼','🌊','🐚','🫧','🪼','⛱️','🏝️','🏄','🌴','🍹','🌞', 'OCEAN VIBES']
        },
    };
    function applyThemeToBar(bar, theme) {
        const width = bar.style.width || '0%';

        // Base styles
        bar.style.cssText = `
            width: ${width};
            background: ${theme.gradient};
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            font-size: 18px;
            line-height: 1;
            overflow: hidden;
            display: flex;
            align-items: center;
            padding: 0;
        `;

        // Emoji overlay – repeat sequence to fill bar width
        if (theme.emojis && theme.emojis.length > 0) {
            // Aim for at least 100 emojis in the single segment to cover wide bars without gaps
            const minEmojisInSingle = 100;
            const repeatsNeeded = Math.ceil(minEmojisInSingle / theme.emojis.length);
            const allEmojisSingle = Array.from({length: repeatsNeeded}, () => theme.emojis).flat();
            const emojiLine = [...allEmojisSingle, ...allEmojisSingle].join(' ');

            bar.innerHTML = `
                <div style="
                    display: inline-block;
                    white-space: nowrap;
                    animation: scroll 50s linear infinite;
                ">${emojiLine}</div>
                <style>
                    @keyframes scroll {
                        0%   { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                </style>
            `;
        } else {
            bar.innerHTML = ''; // default theme = no emojis
        }
    }
    function applyProgressTheme() {
        const theme = THEMES[window.__mpToolsState.progressTheme];
        document.querySelectorAll('div.progress-inner').forEach(bar => applyThemeToBar(bar, theme));
    }
    function cycleProgressTheme() {
        const order = ['default', 'brimblecombe', 'baldock', 'warren', 'white', 'halloween', 'easter', 'christmas', 'patricks', 'ocean'];
        const currentIdx = order.indexOf(window.__mpToolsState.progressTheme);
        const nextIdx = (currentIdx + 1) % order.length;
        window.__mpToolsState.progressTheme = order[nextIdx];
        saveState();
        applyProgressTheme();
        const name = window.__mpToolsState.progressTheme === 'default' ? 'Default' : window.__mpToolsState.progressTheme.toUpperCase();
        showStatus(`Progress theme: ${name}`, '#ffd700');
    }
    // Double-press detection for Alt+6 menu
    let alt6Presses = 0;
    let alt6Timer = null;
    function handleAlt6() {
        alt6Presses++;
        if (alt6Presses === 1) {
            // single press → toggle on/off (cycle to next)
            cycleProgressTheme();
        } else if (alt6Presses === 2) {
            // double press → show selection menu
            showProgressThemeMenu();
        }
        clearTimeout(alt6Timer);
        alt6Timer = setTimeout(() => {
            alt6Presses = 0;
        }, 400);
    }
    function showProgressThemeMenu() {
        // Remove any existing menu
        const old = document.getElementById('mp-progress-theme-menu');
        if (old) old.remove();
        const menu = document.createElement('div');
        menu.id = 'mp-progress-theme-menu';
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.95);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            z-index: 2147483647;
            font-family: Arial, Helvetica, sans-serif;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        `;
        menu.innerHTML = `<div style="font-size:18px;font-weight:bold;margin-bottom:15px;">Choose Progress Bar Theme</div>`;
        Object.keys(THEMES).forEach(key => {
            const btn = document.createElement('div');
            btn.textContent = key === 'default' ? 'Default (Blue)' : key.toUpperCase();
            btn.style.cssText = `
                display: block;
                width: 100%;
                padding: 12px;
                margin: 8px 0;
                background: ${THEMES[key].gradient};
                color: white;
                font-weight: bold;
                border-radius: 8px;
                cursor: pointer;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            `;
            btn.onclick = () => {
                window.__mpToolsState.progressTheme = key;
                saveState();
                applyProgressTheme();
                showStatus(`Progress theme: ${key === 'default' ? 'Default' : key.toUpperCase()}`, '#ffd700');
                menu.remove();
            };
            menu.appendChild(btn);
        });
        const closeBtn = document.createElement('div');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = 'margin-top:15px;color:#aaa;cursor:pointer;';
        closeBtn.onclick = () => menu.remove();
        menu.appendChild(closeBtn);
        document.body.appendChild(menu);
    }
    /* -------------------------
       Status Display Functions
       ------------------------- */
    function showStatus(message, color) {
        const existingStatus = document.getElementById('mp-tools-status');
        if (existingStatus) existingStatus.remove();
        const status = document.createElement('div');
        status.id = 'mp-tools-status';
        status.style.cssText = `
            position: fixed;
            top: 8px;
            left: 8px;
            background: rgba(0, 0, 0, 0.8);
            color: ${color};
            padding: 6px 10px;
            border-radius: 4px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            font-weight: bold;
            z-index: 2147483647;
            pointer-events: none;
            border: 1px solid ${color};
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;
        status.textContent = message;
        document.body.appendChild(status);
        setTimeout(() => {
            if (status.parentNode) status.remove();
        }, 2000);
    }
    function showActivated() {
        showStatus('MP-Tools activated', '#3b82f6'); // blue
    }
    /* -------------------------
       Feature Toggle Functions
       ------------------------- */
    window.__mpToolsLastToggle = window.__mpToolsLastToggle || 0;
    function shouldDebounceToggle(ms = 300) {
        const now = Date.now();
        if (now - window.__mpToolsLastToggle < ms) return true;
        window.__mpToolsLastToggle = now;
        return false;
    }
    function toggleSpeedrunner() {
        if (shouldDebounceToggle()) return console.log('toggleSpeedrunner: debounced');
        window.__mpToolsState.speedrunner = !window.__mpToolsState.speedrunner;
        saveState();
        if (window.__mpToolsState.speedrunner) {
            startSpeedrunner();
            showStatus('Speedrunner - ON', '#10b981');
        } else {
            stopSpeedrunner();
            showStatus('Speedrunner - OFF', '#ef4444');
        }
    }
    function toggleRemoveAnnoying() {
        if (shouldDebounceToggle()) return console.log('toggleRemoveAnnoying: debounced');
        window.__mpToolsState.removeAnnoying = !window.__mpToolsState.removeAnnoying;
        saveState();
        if (window.__mpToolsState.removeAnnoying) {
            enableremoveAnnoying();
            showStatus('Remove Annoying - ON', '#10b981');
        } else {
            disableremoveAnnoying();
            showStatus('Remove Annoying - OFF', '#ef4444');
        }
    }
    function toggleRightClick() {
        if (shouldDebounceToggle()) return console.log('toggleRightClick: debounced');
        window.__mpToolsState.rightClick = !window.__mpToolsState.rightClick;
        saveState();
        if (window.__mpToolsState.rightClick) {
            enableRightClickAndSelect();
            showStatus('Right Click - ON', '#10b981');
        } else {
            disableRightClickAndSelect();
            showStatus('Right Click - OFF', '#ef4444');
        }
    }
    /* -------------------------
       ORIGINAL Feature Implementations (Restored)
       ------------------------- */
    function enableRightClickAndSelect() {
        if (window.__rightClickHandler) return console.log('Right click and text selection already enabled');
        window.__rightClickHandler = e => e.stopPropagation();
        document.addEventListener('contextmenu', window.__rightClickHandler, true);
        window.__textSelectHandler = e => {
            if (e.type === 'click' || e.type === 'mousedown') return;
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        };
        document.querySelectorAll('*').forEach(element => {
            try {
                if (element.style) {
                    if (element.style.userSelect === 'none' ||
                        element.style.webkitUserSelect === 'none' ||
                        element.style.MozUserSelect === 'none' ||
                        element.style.msUserSelect === 'none') {
                        element.style.userSelect = 'auto';
                        element.style.webkitUserSelect = 'auto';
                        element.style.MozUserSelect = 'auto';
                        element.style.msUserSelect = 'auto';
                    }
                }
            } catch (_) {}
        });
        const events = ['selectstart', 'dragstart'];
        events.forEach(eventType => {
            document.addEventListener(eventType, window.__textSelectHandler, true);
        });
        if (!window.__selectionStyle) {
            window.__selectionStyle = document.createElement('style');
            window.__selectionStyle.textContent = `
                * {
                    user-select: auto !important;
                    -webkit-user-select: auto !important;
                    -moz-user-select: auto !important;
                    -ms-user-select: auto !important;
                }
            `;
            document.head.appendChild(window.__selectionStyle);
        }
        console.log('Right-click and text selection enabled');
    }
    function disableRightClickAndSelect() {
        if (!window.__rightClickHandler) return console.log('Right click and text selection already disabled');
        document.removeEventListener('contextmenu', window.__rightClickHandler, true);
        window.__rightClickHandler = null;
        if (window.__textSelectHandler) {
            const events = ['selectstart', 'dragstart'];
            events.forEach(eventType => {
                document.removeEventListener(eventType, window.__textSelectHandler, true);
            });
            window.__textSelectHandler = null;
        }
        if (window.__selectionStyle) {
            try { window.__selectionStyle.remove(); } catch (_) {}
            window.__selectionStyle = null;
        }
        console.log('Right-click and text selection disabled');
    }
    function enableremoveAnnoying() {
        if (window.__removeAnnoyingEnabled) return console.log('Remove Annoying already enabled');
        window.__removeAnnoyingEnabled = true;
        try { document.querySelectorAll('.question-blur').forEach(el => el.classList.remove('question-blur')); } catch(e){}
        try { document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove()); } catch(e){}
        try { document.querySelectorAll('div.red-stuff').forEach(el => el.classList.remove('red-stuff')); } catch(e){}
        const observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    try {
                        const t = m.target;
                        if (t && t.classList) {
                            if (t.classList.contains('question-blur')) t.classList.remove('question-blur');
                            if (t.tagName === 'DIV' && t.classList.contains('red-stuff')) t.classList.remove('red-stuff');
                        }
                    } catch (_) {}
                }
                if (m.type === 'childList') {
                    m.addedNodes.forEach(node => {
                        if (!node || node.nodeType !== 1) return;
                        try {
                            if (node.matches && node.matches('.cdk-overlay-container')) { node.remove(); return; }
                        } catch (_) {}
                        try { if (node.classList && node.classList.contains('question-blur')) node.classList.remove('question-blur'); } catch(_) {}
                        try { node.querySelectorAll && node.querySelectorAll('.question-blur').forEach(el => el.classList.remove('question-blur')); } catch(_) {}
                        try { if (node.tagName === 'DIV' && node.classList && node.classList.contains('red-stuff')) node.classList.remove('red-stuff'); } catch(_) {}
                        try { node.querySelectorAll && node.querySelectorAll('div.red-stuff').forEach(el => el.classList.remove('red-stuff')); } catch(_) {}
                        try { node.querySelectorAll && node.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove()); } catch(_) {}
                    });
                }
            }
        });
        try {
            observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
            window.__removeAnnoyingObserver = observer;
        } catch (e) {
            console.error('Remove Annoying observer failed to start', e);
            window.__removeAnnoyingObserver = null;
        }
        console.log('Remove Annoying ON — stripping question-blur, removing overlays, and removing red-stuff class from divs');
    }
    function disableremoveAnnoying() {
        if (!window.__removeAnnoyingEnabled) return console.log('Remove Annoying already disabled');
        window.__removeAnnoyingEnabled = false;
        try { if (window.__removeAnnoyingObserver) { window.__removeAnnoyingObserver.disconnect(); window.__removeAnnoyingObserver = null; } } catch(_) {}
        console.log('Remove Annoying OFF');
    }
    function startSpeedrunner() {
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
        (async function run() {
            try {
                while (!window.__autoClickerStopRequested) {
                    try {
                        (await wait('div.bottom-button.card-button.check-button.flex.items-center.relative.right-button.round-button',
                                    'Check my answer')).click();
                        (await wait('div.next-button.ph3.pv2.card-button.round-button.bottom-button.left-button.flex.items-center.mr2',
                                    'Complete question')).click();
                        await sleep(3000);
                    } catch (e) { await sleep(1000); }
                }
            } finally {
                window.__autoClickerRunning = false;
                console.log('Speedrunner stopped');
            }
        })();
    }
    function stopSpeedrunner() {
        window.__autoClickerStopRequested = true;
        window.__autoClickerRunning = false;
        console.log('Stop requested');
    }
    /* -------------------------
       Calculator feature
       - No close button in header
       - Toggle via Alt+4
       - CSS sized to avoid clipping / extra bottom space
       - Shows "Loading..." until Desmos initialises
       ------------------------- */
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
            const el = document.getElementById('mp-desmos-body-calc');
            if (!el) return;
            // remove loading indicator if present (we'll also remove after creating instance)
            const preLoad = document.getElementById('mp-desmos-loading');
            if (preLoad) preLoad.remove();
            if (window.__mp_desmos_instance) {
                try { if (typeof window.__mp_desmos_instance.update === 'function') window.__mp_desmos_instance.update(); } catch(_) {}
                return;
            }
            window.__mp_desmos_instance = Desmos && Desmos.ScientificCalculator
                ? Desmos.ScientificCalculator(el, { keypad: true })
                : null;
            // Remove loading placeholder if it still exists
            const ld = document.getElementById('mp-desmos-loading');
            if (ld) ld.remove();
            if (!window.__mp_desmos_instance) {
                console.error('Desmos object not available or API changed');
                const errNotice = document.createElement('div');
                errNotice.style.cssText = 'padding:10px;color:#900;font-weight:700;';
                errNotice.textContent = 'Desmos failed to initialize.';
                el.appendChild(errNotice);
            }
        } catch (err) {
            console.error('Error initialising Desmos', err);
            const ld = document.getElementById('mp-desmos-loading');
            if (ld) ld.remove();
            const el = document.getElementById('mp-desmos-body-calc');
            if (el) {
                const errNotice = document.createElement('div');
                errNotice.style.cssText = 'padding:10px;color:#900;font-weight:700;';
                errNotice.textContent = 'Desmos failed to initialize.';
                el.appendChild(errNotice);
            }
        }
    }
    function openCalculator() {
        const existingPanel = document.getElementById('mp-desmos-panel');
        if (existingPanel) {
            existingPanel.style.display = '';
            existingPanel.style.zIndex = 2147483648;
            return;
        }
        const panel = document.createElement('div');
        panel.id = 'mp-desmos-panel';
        panel.style.cssText = `
            position:fixed;left:12px;top:12px;width:320px;height:440px;
            z-index:2147483648;
            background:#fff;color:#111;border-radius:8px;border:1px solid #bbb;
            box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:Arial,Helvetica,sans-serif;
            box-sizing:border-box;user-select:none;overflow:hidden;
        `;
        const header = document.createElement('div');
        header.style.cssText = `
            display:flex;align-items:center;justify-content:space-between;
            background:#2b2f33;color:#fff;padding:8px 10px;cursor:grab;
            font-weight:700;font-size:13px;
        `;
        header.innerHTML = `<span style="pointer-events:none;">Calculator</span>`;
        panel.appendChild(header);
        const body = document.createElement('div');
        body.id = 'mp-desmos-body';
        body.style.cssText = `
            width:100%;height:calc(100% - 36px);
            margin:0;padding:0;box-sizing:border-box;background:transparent;
        `;
        const desmosContainer = document.createElement('div');
        desmosContainer.id = 'mp-desmos-body-calc';
        desmosContainer.style.cssText = `
            width:100%;height:100%;border-radius:6px;overflow:hidden;display:flex;align-items:stretch;
        `;
        // TEMP loading notice (will be removed when Desmos initialised or on error)
        const loadingNotice = document.createElement('div');
        loadingNotice.id = 'mp-desmos-loading';
        loadingNotice.style.cssText = `
            width:100%;height:100%;display:flex;align-items:center;justify-content:center;
            font-size:16px;color:#555;font-weight:700;font-family:Arial,Helvetica,sans-serif;
            background:transparent;
        `;
        loadingNotice.textContent = 'Loading... ⏳';
        desmosContainer.appendChild(loadingNotice);
        body.appendChild(desmosContainer);
        panel.appendChild(body);
        document.body.appendChild(panel);
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
        // load & init desmos; on failure replace loading with error notice
        ensureDesmos().then(initDesmos).catch(err => {
            console.error('Failed to load Desmos calculator:', err);
            const ld = document.getElementById('mp-desmos-loading');
            if (ld) ld.remove();
            const bodyEl = document.getElementById('mp-desmos-body-calc');
            if (bodyEl) {
                const errNotice = document.createElement('div');
                errNotice.style.cssText = 'padding:10px;color:#900;font-weight:700;';
                errNotice.textContent = 'Desmos failed to load.';
                bodyEl.appendChild(errNotice);
            }
        });
        panel.addEventListener('mousedown', () => { panel.style.zIndex = 2147483648; });
    }
    function destroyCalculatorPanel() {
        try {
            const ld = document.getElementById('mp-desmos-loading');
            if (ld) ld.remove();
        } catch(_) {}
        try {
            const panel = document.getElementById('mp-desmos-panel');
            if (panel) panel.remove();
        } catch (_) {}
        try {
            if (window.__mp_desmos_instance && typeof window.__mp_desmos_instance.destroy === 'function') {
                window.__mp_desmos_instance.destroy();
            }
        } catch (_) {}
        window.__mp_desmos_instance = null;
        console.log('Calculator panel removed');
    }
    function toggleCalculator() {
        if (shouldDebounceToggle()) return console.log('toggleCalculator: debounced');
        const existing = document.getElementById('mp-desmos-panel');
        if (existing) {
            destroyCalculatorPanel();
            showStatus('Calculator - OFF', '#ef4444');
        } else {
            openCalculator();
            showStatus('Calculator - ON', '#10b981');
        }
    }
    /* -------------------------
       AI Chat (added) — toggle via Alt+5
       - openOpenAI(), setupChat(), destroyChatPanel(), toggleOpenAI()
       - NO close button in header; toggled only via Alt+5
       ------------------------- */
    function openOpenAI() {
        const existingPanel = document.getElementById('mp-aichat-panel');
        if (existingPanel) {
            existingPanel.style.display = '';
            existingPanel.style.zIndex = 2147483648;
            return;
        }
        const panel = document.createElement('div');
        panel.id = 'mp-aichat-panel';
        panel.style.cssText = `
            position:fixed;left:12px;top:12px;width:420px;height:500px;z-index:2147483648;
            background:#fff;color:#111;border-radius:8px;border:1px solid #bbb;
            box-shadow:0 8px 30px rgba(0,0,0,.35);font-family:Arial,Helvetica,sans-serif;
            box-sizing:border-box;user-select:none;padding:0;overflow:hidden;
        `;
        const header = document.createElement('div');
        header.style.cssText = `
            display:flex;align-items:center;justify-content:space-between;
            background:#2b2f33;color:#fff;padding:8px 10px;cursor:grab;
            font-weight:700;font-size:13px;
        `;
        // NO close button here (per request)
        header.innerHTML = `<span style="pointer-events:none;">AI Chat</span>`;
        panel.appendChild(header);
        const chatContainer = document.createElement('div');
        chatContainer.style.cssText = `
            width:100%;height:calc(100% - 42px);display:flex;flex-direction:column;
            background:#f2f3f5;
        `;
        const messagesArea = document.createElement('div');
        messagesArea.id = 'mp-chat-messages';
        messagesArea.style.cssText = `
            flex:1;padding:12px;display:flex;flex-direction:column;gap:8px;
            overflow-y:auto;font-family:"Inter",Arial,sans-serif;
        `;
        const inputArea = document.createElement('div');
        inputArea.style.cssText = `
            display:flex;gap:8px;padding:10px;border-top:1px solid #e0e0e0;
            background:#fff;align-items:flex-end;
        `;
        const textarea = document.createElement('textarea');
        textarea.id = 'mp-chat-input';
        textarea.placeholder = 'Type a message';
        textarea.style.cssText = `
            flex:1;min-height:44px;max-height:160px;padding:10px;border-radius:8px;
            border:1px solid #ccc;resize:none;font-size:14px;outline:none;
            line-height:1.3;font-family:inherit;
        `;
        const controls = document.createElement('div');
        controls.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:flex-end;justify-content:space-between;';
        const sendBtn = document.createElement('button');
        sendBtn.id = 'mp-send-btn';
        sendBtn.textContent = 'Send';
        sendBtn.style.cssText = `
            background:#0078ff;color:#fff;border:none;border-radius:8px;
            padding:10px 14px;cursor:pointer;font-weight:600;font-family:inherit;
        `;
        controls.appendChild(sendBtn);
        inputArea.appendChild(textarea);
        inputArea.appendChild(controls);
        chatContainer.appendChild(messagesArea);
        chatContainer.appendChild(inputArea);
        panel.appendChild(chatContainer);
        document.body.appendChild(panel);
        setupChat(messagesArea, textarea, sendBtn);
        draggable(panel, header);
        // No close button: panel is closed only via toggleOpenAI()
        panel.addEventListener('mousedown', () => { panel.style.zIndex = 2147483648; });
        textarea.focus();
    }
    function destroyChatPanel() {
        try {
            const panel = document.getElementById('mp-aichat-panel');
            if (panel) panel.remove();
        } catch (_) {}
        try {
            if (window.__mp_chat_controller) {
                try { window.__mp_chat_controller.abort(); } catch(_) {}
                window.__mp_chat_controller = null;
            }
        } catch(_) {}
        console.log('AI Chat panel removed');
    }
    function toggleOpenAI() {
        if (shouldDebounceToggle()) return console.log('toggleOpenAI: debounced');
        const existing = document.getElementById('mp-aichat-panel');
        if (existing) {
            destroyChatPanel();
            showStatus('AI Chat - OFF', '#ef4444');
        } else {
            openOpenAI();
            showStatus('AI Chat - ON', '#10b981');
        }
    }
    function setupChat(messagesArea, input, sendBtn) {
        // NOTE: this uses the key and endpoint the user provided in the snippet.
        const API_KEY = 'csk-nhykr5xjwe495twcvtx383wh3vnyj2n4x9nr26k56mje6jxr';
        const ENDPOINT = 'https://api.cerebras.ai/v1/chat/completions';
        const MODEL = 'gpt-oss-120b';
        const SYSTEM_MESSAGE = "You are a friendly chatbot called MP Helper. You help with maths problems. MP stands for Math Pathways, as this is the program you are in. NEVER respond with math displaystyles or markdown, ONLY respond with plaintext. NEVER use displaystyle or math format or markdown. You are a part of MP Tools, a tool system for Math Pathways. For example, INSTEAD of doing this: (1 div 1 = 1), do THIS: 1/1 = 1 NEVER use math formatter. So, NEVER use LaTeX-style display math, instead always write math in plain text. Use emojis, NO MARKDOWN, and be excited and ready to help. Keep your responses short except if the user asks a maths problem walk them through it step by step.";
        let messages = [];
        let currentController = null;
        function makeBubble(text, isUser) {
            const bubble = document.createElement('div');
            bubble.style.cssText = `
                max-width:74%;padding:10px 14px;border-radius:16px;line-height:1.4;
                word-wrap:break-word;box-shadow:0 1px 0 rgba(0,0,0,0.04);white-space:pre-wrap;
                font-size:14px;align-self:${isUser ? 'flex-end' : 'flex-start'};
                background:${isUser ? 'linear-gradient(180deg,#0b84ff,#0066d6)' : '#e6e9ee'};
                color:${isUser ? '#fff' : '#111'};
                border-bottom-${isUser ? 'right' : 'left'}-radius:6px;
            `;
            bubble.textContent = text;
            return bubble;
        }
        function scrollToBottom() {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
        function renderMessages() {
            messagesArea.innerHTML = '';
            messages.forEach(msg => {
                messagesArea.appendChild(makeBubble(msg.content, msg.role === 'user'));
            });
            scrollToBottom();
        }
        async function sendMessage() {
            const text = input.value.trim().replace(/\u00a0/g, ' ');
            if (!text) return;
            const userMsg = { role: 'user', content: text };
            messages.push(userMsg);
            messagesArea.appendChild(makeBubble(text, true));
            input.value = '';
            scrollToBottom();
            await streamAssistantResponse();
        }
        async function streamAssistantResponse() {
            const payloadMessages = [
                { role: 'system', content: SYSTEM_MESSAGE },
                ...messages
            ];
            const assistantMsg = { role: 'assistant', content: '' };
            messages.push(assistantMsg);
            const assistantBubble = makeBubble('', false);
            messagesArea.appendChild(assistantBubble);
            scrollToBottom();
            if (currentController) {
                try { currentController.abort(); } catch(_) {}
            }
            const controller = new AbortController();
            currentController = controller;
            window.__mp_chat_controller = controller;
            try {
                const response = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + API_KEY
                    },
                    body: JSON.stringify({
                        model: MODEL,
                        stream: true,
                        max_completion_tokens: 65536,
                        temperature: 1,
                        top_p: 1,
                        messages: payloadMessages
                    }),
                    signal: controller.signal
                });
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed === 'data: [DONE]') continue;
                        if (trimmed.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(trimmed.slice(6));
                                if (data.choices?.[0]?.delta?.content) {
                                    assistantMsg.content += data.choices[0].delta.content;
                                    assistantBubble.textContent = assistantMsg.content;
                                    scrollToBottom();
                                }
                            } catch (e) {
                                console.log('Parse error:', e, 'on line:', trimmed);
                            }
                        }
                    }
                }
                currentController = null;
                assistantMsg.content = assistantMsg.content.trim();
                renderMessages();
            } catch (err) {
                if (err.name === 'AbortError') {
                    currentController = null;
                    renderMessages();
                } else {
                    assistantMsg.content += '\n⚠️ Error: ' + err.message;
                    currentController = null;
                    renderMessages();
                }
            }
        }
        sendBtn.onclick = sendMessage;
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    /* -------------------------
       Keyboard Shortcuts Setup (improved)
       ------------------------- */
    function setupKeyboardShortcuts() {
        if (window.__mpToolsKeyboardSetup) {
            console.log('Keyboard shortcuts already set up');
            return;
        }
        window.__mpToolsKeyboardSetup = true;
        window.__mpToolsLastKeyAt = window.__mpToolsLastKeyAt || 0;
        document.addEventListener('keydown', function(e) {
            const now = Date.now();
            if (now - window.__mpToolsLastKeyAt < 150) return;
            const isDigit1 = e.code === 'Digit1' || e.key === '1';
            const isDigit2 = e.code === 'Digit2' || e.key === '2';
            const isDigit3 = e.code === 'Digit3' || e.key === '3';
            const isDigit4 = e.code === 'Digit4' || e.key === '4';
            const isDigit5 = e.code === 'Digit5' || e.key === '5';
            const isDigit6 = e.code === 'Digit6' || e.key === '6';
            if (e.altKey && isDigit6) {
                e.preventDefault();
                window.__mpToolsLastKeyAt = now;
                console.log('Alt+6 pressed => handling progress theme');
                handleAlt6();
            } else if (e.altKey && isDigit1) {
                e.preventDefault();
                window.__mpToolsLastKeyAt = now;
                console.log('Alt+1 pressed => toggling speedrunner');
                toggleSpeedrunner();
            } else if (e.altKey && isDigit2) {
                e.preventDefault();
                window.__mpToolsLastKeyAt = now;
                console.log('Alt+2 pressed => toggling removeAnnoying');
                toggleRemoveAnnoying();
            } else if (e.altKey && isDigit3) {
                e.preventDefault();
                window.__mpToolsLastKeyAt = now;
                console.log('Alt+3 pressed => toggling rightClick');
                toggleRightClick();
            } else if (e.altKey && isDigit4) {
                e.preventDefault();
                window.__mpToolsLastKeyAt = now;
                console.log('Alt+4 pressed => toggling calculator');
                toggleCalculator();
            } else if (e.altKey && isDigit5) {
                e.preventDefault();
                window.__mpToolsLastKeyAt = now;
                console.log('Alt+5 pressed => toggling AI Chat');
                toggleOpenAI();
            }
        }, true);
    }
    /* -------------------------
       Initialize on load
       ------------------------- */
    function initialize() {
        showActivated();
        setupKeyboardShortcuts();
        applyProgressTheme();
        if (window.__mpToolsState.speedrunner) startSpeedrunner();
        if (window.__mpToolsState.rightClick) enableRightClickAndSelect();
        if (window.__mpToolsState.removeAnnoying) enableremoveAnnoying();
        console.log('MP-Tools activated - Use Alt+1, Alt+2, Alt+3 to toggle features; Alt+4 toggles Calculator; Alt+5 toggles AI Chat; Alt+6 for progress theme (single press cycles, double press opens menu)');
    }
    // Run initialization
    initialize();
    /* -------------------------
       Minimal helpers (UI used by other code)
       ------------------------- */
    function draggable(panel, handle) {
        let dragging = false, ox = 0, oy = 0;
        const move = e => {
            const x = e.clientX ?? e.touches?.[0]?.clientX;
            const y = e.clientY ?? e.touches?.[0]?.clientY;
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
