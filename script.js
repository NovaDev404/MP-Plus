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
        
        // Speedrunner toggle
        const speedrunnerToggle = createToggle('Speedrunner', 'speedrunner-toggle');
        c1.appendChild(speedrunnerToggle);
        speedrunnerToggle.style.marginBottom = "56px";
        
        // Right click toggle
        const rightClickToggle = createToggle('Right Click', 'rightclick-toggle');
        c2.appendChild(rightClickToggle);
        
        // Anti-Anti-Cheat toggle (combines Anti-Blur + Anti-lockout + red-stuff handling)
        const antiAntiToggle = createToggle('Anti-Anti-Cheat', 'antianti-toggle');
        c2.appendChild(antiAntiToggle);

        // 🆕 Question Lock toggle
        const lockQuestionToggle = createToggle('Question Lock', 'lockquestion-toggle');
        c2.appendChild(lockQuestionToggle);
        
        const calcBtn = btn('Calculator', '#0ea5a4', '#fff');
        c1.appendChild(calcBtn);
        
        const openAiBtn = btn('AI Chat', '#0ea5a4', '#fff');
        c2.appendChild(openAiBtn);
        
        cols.appendChild(c1);
        cols.appendChild(c2);
        p.appendChild(cols);
        document.body.appendChild(p);
        
        // Initialize toggle functionality
        setupSpeedrunnerToggle(speedrunnerToggle);
        setupAntiAntiToggle(antiAntiToggle);
        setupRightClickToggle(rightClickToggle);
        setupLockQuestionToggle(lockQuestionToggle);
        draggable(p, h);
        calcBtn.onclick = () => openCalculator();
        openAiBtn.onclick = () => openOpenAI();
    }
    
    // ---------------- QUESTION LOCK ----------------
    function setupLockQuestionToggle(toggleContainer) {
        const checkbox = toggleContainer.querySelector('input');
        checkbox.addEventListener('change', function() {
            if (this.checked) enableQuestionLock();
            else disableQuestionLock();
        });
    }

    function enableQuestionLock() {
        if (window.__questionLockEnabled) return console.log('Question Lock already active');
        window.__questionLockEnabled = true;

        const questionEl = document.querySelector('.question-text, .question, .task-text');
        if (!questionEl) return console.warn('⚠️ No question element found for locking');

        const originalText = questionEl.textContent.trim();

        const observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.type === 'characterData' || m.type === 'childList' || m.type === 'attributes') {
                    if (questionEl.textContent.trim() !== originalText) {
                        console.log('🔒 Question text changed — restoring');
                        questionEl.textContent = originalText;
                    }
                }
            }
        });

        observer.observe(questionEl, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'text']
        });

        window.__questionLockObserver = observer;
        window.__questionOriginalText = originalText;
        console.log('🔒 Question Lock ON');
    }

    function disableQuestionLock() {
        if (!window.__questionLockEnabled) return console.log('Question Lock already disabled');
        window.__questionLockEnabled = false;

        try {
            if (window.__questionLockObserver) window.__questionLockObserver.disconnect();
        } catch(_) {}
        window.__questionLockObserver = null;
        window.__questionOriginalText = null;
        console.log('🔓 Question Lock OFF');
    }
    // ------------------------------------------------

    // utility functions reused below
    function createToggle(label, id) {
        const container = document.createElement('div');
        container.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.cssText = 'font-weight:600;font-size:12px;';
        const toggleContainer = document.createElement('label');
        toggleContainer.style.cssText = 'position:relative;display:inline-block;width:44px;height:24px;';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.style.cssText = 'opacity:0;width:0;height:0;position:absolute;';
        const slider = document.createElement('span');
        slider.style.cssText = `
            position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;
            background-color:#374151;transition:.3s;border-radius:24px;
        `;
        const knob = document.createElement('span');
        knob.style.cssText = `
            position:absolute;content:"";height:18px;width:18px;left:3px;bottom:3px;
            background-color:#e6eef8;transition:.3s;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);
        `;
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                slider.style.backgroundColor = '#16a34a';
                knob.style.transform = 'translateX(20px)';
            } else {
                slider.style.backgroundColor = '#374151';
                knob.style.transform = 'translateX(0)';
            }
        });
        slider.appendChild(knob);
        toggleContainer.appendChild(checkbox);
        toggleContainer.appendChild(slider);
        container.appendChild(labelEl);
        container.appendChild(toggleContainer);
        return container;
    }

    function setupSpeedrunnerToggle(t){const c=t.querySelector('input');c.addEventListener('change',function(){this.checked?startSpeedrunner():stopSpeedrunner();});}
    function setupRightClickToggle(t){const c=t.querySelector('input');c.addEventListener('change',function(){this.checked?enableRightClick():disableRightClick();});}
    function setupAntiAntiToggle(t){const c=t.querySelector('input');c.addEventListener('change',function(){this.checked?enableAntiAntiCheat():disableAntiAntiCheat();});}

    // ---------- Anti-Anti-Cheat ----------
    function enableAntiAntiCheat() {
        if (window.__antiAntiEnabled) return console.log('Anti-Anti-Cheat already enabled');
        window.__antiAntiEnabled = true;
        try { document.querySelectorAll('.question-blur').forEach(el=>el.classList.remove('question-blur')); } catch(e){}
        try { document.querySelectorAll('.cdk-overlay-container').forEach(el=>el.remove()); } catch(e){}
        try { document.querySelectorAll('div.red-stuff').forEach(el=>el.classList.remove('red-stuff')); } catch(e){}

        const observer = new MutationObserver(mutations=>{
            for(const m of mutations){
                if(m.type==='attributes'&&m.attributeName==='class'){
                    const t=m.target;
                    if(t&&t.classList){
                        if(t.classList.contains('question-blur'))t.classList.remove('question-blur');
                        if(t.tagName==='DIV'&&t.classList.contains('red-stuff'))t.classList.remove('red-stuff');
                    }
                }
                if(m.type==='childList'){
                    m.addedNodes.forEach(node=>{
                        if(!node||node.nodeType!==1)return;
                        if(node.matches&&node.matches('.cdk-overlay-container')){node.remove();return;}
                        node.querySelectorAll&&node.querySelectorAll('.question-blur').forEach(e=>e.classList.remove('question-blur'));
                        node.querySelectorAll&&node.querySelectorAll('div.red-stuff').forEach(e=>e.classList.remove('red-stuff'));
                        node.querySelectorAll&&node.querySelectorAll('.cdk-overlay-container').forEach(e=>e.remove());
                    });
                }
            }
        });
        observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
        window.__antiAntiObserver=observer;
        window.__antiAntiInterval=setInterval(()=>{
            try{document.querySelectorAll('.question-blur').forEach(e=>e.classList.remove('question-blur'));}catch(_){}
            try{document.querySelectorAll('.cdk-overlay-container').forEach(e=>e.remove());}catch(_){}
            try{document.querySelectorAll('div.red-stuff').forEach(e=>e.classList.remove('red-stuff'));}catch(_){}
        },300);
        console.log('Anti-Anti-Cheat ON');
    }

    function disableAntiAntiCheat(){
        if(!window.__antiAntiEnabled)return console.log('Anti-Anti-Cheat already disabled');
        window.__antiAntiEnabled=false;
        try{if(window.__antiAntiObserver)window.__antiAntiObserver.disconnect();}catch(_){}
        try{if(window.__antiAntiInterval)clearInterval(window.__antiAntiInterval);}catch(_){}
        console.log('Anti-Anti-Cheat OFF');
    }
    // ------------------------------------

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
    
    function enableRightClick() {
        if (window.__allowRClickInterval) return console.log('Already running');
        const handler = e => { 
            try { 
                // Don't interfere with dragging - allow through events from our panels
                if (e.target.closest('#mp-tools-panel, #mp-desmos-panel, #mp-aichat-panel')) {
                    return;
                }
                e.stopImmediatePropagation(); 
            } catch (_) {} 
        };
        const purge = () => {
            document.oncontextmenu = document.onmousedown = document.onmouseup = null;
            document.querySelectorAll('*').forEach(el => {
                // Skip our panels to allow dragging
                if (el.closest('#mp-tools-panel, #mp-desmos-panel, #mp-aichat-panel')) {
                    return;
                }
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
    }
    
    function disableRightClick() {
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
            background:#2b2f33;color:#fff;padding: 8px 10px; cursor:grab;
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
            width:100%;height:calc(100% - 42px);padding:8px; padding-bottom: 20px; box-sizing:border-box;
            background:transparent;margin-bottom:10px;
        `;
        
        const desmosContainer = document.createElement('div');
        desmosContainer.id = 'scientificCalc';
        desmosContainer.style.cssText = 'width:100%;height:100%;border-radius:6px;overflow:hidden;';
        body.appendChild(desmosContainer);
        panel.appendChild(body);
        document.body.appendChild(panel);
        
        draggable(panel, header);
        
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
        const existingPanel = document.getElementById('mp-aichat-panel');
        if (existingPanel) {
            existingPanel.style.display = existingPanel.style.display === 'none' ? '' : existingPanel.style.display;
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
        header.innerHTML = `<span style="pointer-events:none;">AI Chat</span>`;
        
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
        
        // Create the chat UI directly with DOM elements
        const chatContainer = document.createElement('div');
        chatContainer.style.cssText = `
            width:100%;height:calc(100% - 42px);display:flex;flex-direction:column;
            background:#f2f3f5;
        `;
        
        // Messages area
        const messagesArea = document.createElement('div');
        messagesArea.id = 'mp-chat-messages';
        messagesArea.style.cssText = `
            flex:1;padding:12px;display:flex;flex-direction:column;gap:8px;
            overflow-y:auto;font-family:"Inter",Arial,sans-serif;
        `;
        
        // Input area
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
            line-height:1.3;font-family:inherit;margin-bottom:10px;
        `;
        
        const controls = document.createElement('div');
        controls.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:flex-end;justify-content:space-between;';
        
        const sendBtn = document.createElement('button');
        sendBtn.id = 'mp-send-btn';
        sendBtn.textContent = 'Send';
        sendBtn.style.cssText = `
            background:#0078ff;color:#fff;border:none;border-radius:8px;
            padding:10px 14px;cursor:pointer;font-weight:600;font-family:inherit;margin-bottom:10px;
        `;
        
        controls.appendChild(sendBtn);
        inputArea.appendChild(textarea);
        inputArea.appendChild(controls);
        chatContainer.appendChild(messagesArea);
        chatContainer.appendChild(inputArea);
        panel.appendChild(chatContainer);
        document.body.appendChild(panel);
        
        // Add the chat functionality directly
        setupChat(messagesArea, textarea, sendBtn);
        
        draggable(panel, header);
        
        closeBtn.onclick = () => {
            panel.remove();
        };
        
        panel.addEventListener('mousedown', () => {
            panel.style.zIndex = 2147483648;
        });
        
        // Focus input
        textarea.focus();
    }
    
    function setupChat(messagesArea, input, sendBtn) {
        const API_KEY = 'csk-nhykr5xjwe495twcvtx383wh3vnyj2n4x9nr26k56mje6jxr';
        const ENDPOINT = 'https://api.cerebras.ai/v1/chat/completions';
        const MODEL = 'gpt-oss-120b';
        const SYSTEM_MESSAGE = "You are a friendly chatbot called MP Helper. You help with maths problems. MP stands for Math Pathways, as this is the program you are in. NEVER respond with math displaystyles or markdown, ONLY respond with either plaintext. NEVER use displaystyle or math format or markdown. You are a part of MP Tools, a tool system for Math Pathways. For example, INSTEAD of doing this: (1 div 1 = 1), do THIS: 1/1 = 1 NEVER use math formatter. So, NEVER use LaTeX-style display math, instead always write math in plain text. Use emojis, NO MARKDOWN, and be excited and ready to help. Keep your responses short except if the user asks a maths problem walk them through it step by step.";
        
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
            
            // Add user message
            const userMsg = { role: 'user', content: text };
            messages.push(userMsg);
            messagesArea.appendChild(makeBubble(text, true));
            input.value = '';
            scrollToBottom();
            
            // Stream assistant response
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
                currentController.abort();
            }
            const controller = new AbortController();
            currentController = controller;
            
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
        
        // Event listeners
        sendBtn.onclick = sendMessage;
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
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
