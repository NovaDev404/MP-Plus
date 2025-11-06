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
                    } catch (e) { await sleep(1000); }
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
<style>
.mp-ai-chat {
  margin: 0;
  font-family: "Inter", Arial, sans-serif;
  background: #f2f3f5;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.mp-ai-chat .chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 8px;
  overflow-y: auto;
}
.mp-ai-chat .message {
  max-width: 74%;
  padding: 10px 14px;
  border-radius: 16px;
  line-height: 1.4;
  word-wrap: break-word;
  box-shadow: 0 1px 0 rgba(0,0,0,0.04);
  white-space: pre-wrap;
  font-size: 14px;
}
.mp-ai-chat .from-user {
  align-self: flex-end;
  background: linear-gradient(180deg,#0b84ff,#0066d6);
  color: #fff;
  border-bottom-right-radius: 6px;
}
.mp-ai-chat .from-other {
  align-self: flex-start;
  background: #e6e9ee;
  color: #111;
  border-bottom-left-radius: 6px;
}
.mp-ai-chat .chat-input {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
  align-items: flex-end;
}
.mp-ai-chat .chat-input textarea {
  flex: 1;
  min-height: 44px;
  max-height: 160px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  resize: none;
  font-size: 14px;
  outline: none;
  line-height: 1.3;
}
.mp-ai-chat .controls {
  display:flex;
  flex-direction:column;
  gap:8px;
  align-items:flex-end;
  justify-content:space-between;
}
.mp-ai-chat .chat-input button {
  background: #0078ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 600;
}
.mp-ai-chat .chat-input button:active { transform: translateY(1px); }
.mp-ai-chat .small-btn {
  background: #f3f4f6;
  color: #111;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 12px;
}
</style>
<div class="mp-ai-chat">
  <div class="chat-container" id="chat">
    <!-- intentionally empty at start -->
  </div>
  <div class="chat-input">
    <textarea id="msgInput" placeholder="Type a message"></textarea>
    <div class="controls">
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
        <button id="sendBtn">Send</button>
        <button id="stopBtn" class="small-btn" style="display:none">Stop</button>
      </div>
    </div>
  </div>
</div>
<script>
(function () {
  // ---------- CONFIG (edit here) ----------
  const API_KEY = 'csk-nhykr5xjwe495twcvtx383wh3vnyj2n4x9nr26k56mje6jxr'; // put your key here
  const ENDPOINT = 'https://api.cerebras.ai/v1/chat/completions';
  const MODEL = 'gpt-oss-120b';
  // Hidden system message (JS-only, not shown in chat)
  const SYSTEM_MESSAGE = "You are a friendly chatbot called MP Helper. You help with maths problems. MP stands for Math Pathways, as this is the program you are in. NEVER respond with math displaystyles or markdown, ONLY respond with either plaintext. NEVER use displaystyle or math format or markdown. You are a part of MP Tools, a tool system for Math Pathways. For example, INSTEAD of doing this: (1 div 1 = 1), do THIS: 1/1 = 1 NEVER use math formatter. So, NEVER use LaTeX-style display math, instead always write math in plain text.";
  // ---------- in-memory memory (cleared on reload) ----------
  let messages = []; // {role: 'user'|'assistant', content: '...'}
  let currentController = null;
  // ---------- DOM ----------
  const chat = document.getElementById('chat');
  const input = document.getElementById('msgInput');
  const sendBtn = document.getElementById('sendBtn');
  const stopBtn = document.getElementById('stopBtn');
  // helpers
  function makeBubble(text, cls) {
    const d = document.createElement('div');
    d.className = 'message ' + cls;
    d.textContent = text;
    return d;
  }
  function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
  }
  function renderMessages() {
    chat.innerHTML = '';
    for (const m of messages) {
      const cls = m.role === 'user' ? 'from-user' : 'from-other';
      const bubble = makeBubble(m.content, cls);
      chat.appendChild(bubble);
    }
    scrollToBottom();
  }
  // Send user message & stream AI response
  async function sendMessage() {
    const raw = input.value.replace(/\u00a0/g, ' ');
    const text = raw.trim();
    if (!text) return;
    // append user message
    const userMsg = { role: 'user', content: text };
    messages.push(userMsg);
    chat.appendChild(makeBubble(text, 'from-user'));
    input.value = '';
    scrollToBottom();
    // start streaming assistant response
    await streamAssistantResponse();
  }
  function abortCurrentStream() {
    if (currentController) {
      try { currentController.abort(); } catch(e) {}
      currentController = null;
      stopBtn.style.display = 'none';
    }
  }
  // Robust streaming parser for Cerebras streaming shape (choices[0].delta.content)
  async function streamAssistantResponse() {
    // Build payload messages: hidden system first
    const payloadMessages = [
      { role: 'system', content: SYSTEM_MESSAGE },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];
    // Add placeholder assistant message to memory and UI
    const assistantPlaceholder = { role: 'assistant', content: '' };
    messages.push(assistantPlaceholder);
    const assistantBubble = makeBubble('', 'from-other');
    chat.appendChild(assistantBubble);
    scrollToBottom();
    // abort previous
    abortCurrentStream();
    const controller = new AbortController();
    currentController = controller;
    stopBtn.style.display = 'inline-block';
    try {
      console.log('Starting fetch to', ENDPOINT);
      console.log('Payload:', JSON.stringify({
          model: MODEL,
          stream: true,
          max_completion_tokens: 65536,
          temperature: 1,
          top_p: 1,
          reasoning_effort: 'low',
          messages: payloadMessages
        }, null, 2));
      const resp = await fetch(ENDPOINT, {
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
          reasoning_effort: 'low',
          messages: payloadMessages
        }),
        signal: controller.signal
      });
      console.log('Fetch response status:', resp.status, 'OK:', resp.ok);
      if (!resp.ok) {
        const txt = await resp.text();
        console.error('API error text:', txt);
        throw new Error('API error: ' + resp.status + ' — ' + txt);
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      // Append incoming token string to assistant bubble
      function appendToAssistant(str) {
        assistantPlaceholder.content += str;
        assistantBubble.textContent = assistantPlaceholder.content;
        scrollToBottom();
      }
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) {
          console.log('Stream done');
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
        buffer += chunk;
        // split into lines (handles both SSE "data: ..." and JSON-lines)
        const lines = buffer.split(new RegExp('\\r?\\n'));
        // keep last partial
        buffer = lines.pop() || '';
        for (let rawLine of lines) {
          rawLine = rawLine.trim();
          if (!rawLine) continue;
          console.log('Processing line:', rawLine);
          // SSE-style: data: ...
          let payload;
          if (rawLine.startsWith('data:')) {
            payload = rawLine.slice(5).trim();
            console.log('SSE payload:', payload);
            if (payload === '[DONE]') {
              done = true;
              console.log('Received [DONE]');
              break;
            }
          } else {
            payload = rawLine;
          }
          // try parse JSON payload
          try {
            const parsed = JSON.parse(payload);
            console.log('Parsed JSON:', parsed);
            // prefer OpenAI-like streaming delta: choices[].delta.content
            if (parsed.choices && parsed.choices.length > 0) {
              for (const ch of parsed.choices) {
                if (ch.delta && typeof ch.delta.content === 'string') {
                  console.log('Appending token:', ch.delta.content);
                  appendToAssistant(ch.delta.content);
                } else if (ch.text) {
                  console.log('Appending text:', ch.text);
                  appendToAssistant(ch.text);
                } else if (ch.message && ch.message.content) {
                  // some shapes: message.content.parts[]
                  if (typeof ch.message.content === 'string') {
                    console.log('Appending message content:', ch.message.content);
                    appendToAssistant(ch.message.content);
                  } else if (ch.message.content.parts && ch.message.content.parts[0]) {
                    console.log('Appending parts[0]:', ch.message.content.parts[0]);
                    appendToAssistant(ch.message.content.parts[0]);
                  }
                }
              }
            } else if (parsed.text) {
              console.log('Appending parsed.text:', parsed.text);
              appendToAssistant(parsed.text);
            }
          } catch (err) {
            console.error('JSON parse error:', err, 'on payload:', payload);
            // not JSON — append raw payload
            appendToAssistant(payload + '\n');
          }
        } // end for lines
      } // end while
      // mark stream finished
      currentController = null;
      stopBtn.style.display = 'none';
      // finalise memory (assistantPlaceholder already references object in messages)
      // Optionally you can post-process whitespace here
      assistantPlaceholder.content = assistantPlaceholder.content.trimEnd();
      renderMessages();
    } catch (err) {
      console.error('Stream error:', err);
      if (err.name === 'AbortError') {
        // aborted by user - keep partial content already streamed
        currentController = null;
        stopBtn.style.display = 'none';
        renderMessages();
      } else {
        // show error text in assistant bubble (keeps UI silent per your "no extra status" rule)
        assistantPlaceholder.content += '\n⚠️ Error: ' + (err.message || err);
        currentController = null;
        stopBtn.style.display = 'none';
        renderMessages();
      }
    }
  }
  // ---------- Events ----------
  sendBtn.addEventListener('click', sendMessage);
  stopBtn.addEventListener('click', () => abortCurrentStream());
  // Key handling: Shift+Enter = newline; Enter or Ctrl+Enter => send
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // allow newline
        return;
      }
      // Enter alone OR Ctrl+Enter => send
      e.preventDefault();
      if (currentController) {
        // stop active stream first, then send after a brief moment
        abortCurrentStream();
        setTimeout(sendMessage, 150);
      } else {
        sendMessage();
      }
    }
  });
  // focus input on open
  input.focus();
  scrollToBottom();
})();
</script>
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
          try {
            // parse into a fresh DOM (avoids relying on innerHTML execution quirks)
            const parsed = new DOMParser().parseFromString(htmlString, 'text/html');
            // clear target
            while (targetElement.firstChild) targetElement.removeChild(targetElement.firstChild);
            // collect children and scripts separately (snapshot)
            const nodes = Array.from(parsed.body.childNodes);
            const scriptNodes = [];
            for (const n of nodes) {
              if (n.nodeName === 'SCRIPT') {
                scriptNodes.push(n);
              } else {
                // import into current document (keeps event listeners / refs safe)
                targetElement.appendChild(document.importNode(n, true));
              }
            }
            // run scripts serially to preserve order (handles external and inline)
            (async function runScriptsSerially() {
              for (const oldScript of scriptNodes) {
                try {
                  const newScript = document.createElement('script');
                  // copy attributes safely
                  for (let i = 0; i < oldScript.attributes.length; i++) {
                    const attr = oldScript.attributes[i];
                    newScript.setAttribute(attr.name, attr.value);
                  }
                  // preserve known boolean flags explicitly
                  if (oldScript.type) newScript.type = oldScript.type;
                  if (oldScript.async) newScript.async = true;
                  if (oldScript.defer) newScript.defer = true;
                  if (oldScript.src) {
                    // append then set src to start load — await load to preserve serial order
                    await new Promise((resolve) => {
                      newScript.onload = () => resolve();
                      newScript.onerror = () => {
                        console.warn('injectContent: failed to load', oldScript.src);
                        resolve(); // don't block on errors
                      };
                      targetElement.appendChild(newScript);
                      // setting src after append to avoid race in some engines
                      newScript.src = oldScript.getAttribute('src');
                    });
                  } else {
                    // inline script: set text and append (executes immediately)
                    newScript.text = oldScript.textContent || oldScript.innerHTML || '';
                    targetElement.appendChild(newScript);
                  }
                } catch (err) {
                  console.error('injectContent: script exec failed', err);
                }
              }
            })();
          } catch (err) {
            console.error('injectContent: fatal error', err);
            // fallback: brute force put html (scripts won't auto-run)
            try { targetElement.innerHTML = htmlString; } catch (_) {}
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
