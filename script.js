// == MP Tools – full, readable, self-contained script ==
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
        const stopBtn  = btn('Stop Speedrunner',  '#ef4444', '#fff');
        c1.appendChild(startBtn);
        c1.appendChild(stopBtn);

        const enableBtn = btn('Enable Right Click', '#16a34a', '#fff');
        const disableBtn = btn('Disable Right Click', '#ef4444', '#fff');
        c2.appendChild(enableBtn);
        c2.appendChild(disableBtn);

        // Calculator button (new)
        const calcBtn = btn('Open Calculator', '#0ea5a4', '#fff');
        c1.appendChild(calcBtn);

        cols.appendChild(c1);
        cols.appendChild(c2);
        p.appendChild(cols);

        const f = document.createElement('div');
        f.style.cssText = 'margin-top:8px;font-size:11px;opacity:.85;';
        f.textContent = 'Drag header to move. X to close.';
        p.appendChild(f);

        document.body.appendChild(p);

        speedrunner(startBtn, stopBtn);
        rightClick(enableBtn, disableBtn);
        draggable(p, h);

        calcBtn.onclick = () => openCalculator();
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
                // Save handler reference so we can remove later
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
        const existing = document.getElementById('mp-calculator');
        if (existing) {
            existing.style.display = existing.style.display === 'none' ? '' : existing.style.display;
            existing.style.zIndex = 2147483648;
            return;
        }

        const calc = document.createElement('div');
        calc.id = 'mp-calculator';
        calc.style.cssText = `
            position:fixed;left:12px;top:12px;width:auto;z-index:2147483648;
            background:#f4f4f4;color:#111;border-radius:8px;border:1px solid #bbb;
            box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:Arial,Helvetica,sans-serif;
            box-sizing:border-box;user-select:none;padding:0;overflow:hidden;
        `;

        // Header (drag handle) with title and close (MINIMISE REMOVED)
        const header = document.createElement('div');
        header.style.cssText = `
            display:flex;align-items:center;justify-content:space-between;
            background:#2b2f33;color:#fff;padding:6px 8px;cursor:grab;
            font-weight:700;font-size:13px;
        `;
        header.innerHTML = `<span style="pointer-events:none;">Calculator</span>`;
        const headerBtns = document.createElement('div');
        headerBtns.style.cssText = 'display:flex;gap:6px;align-items:center;';

        // Minimise button removed by request
        const closeBtn = document.createElement('button');
        closeBtn.title = 'Close';
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background:transparent;border:0;color:inherit;cursor:pointer;padding:2px 6px;
            font-size:14px;
        `;

        headerBtns.appendChild(closeBtn);
        header.appendChild(headerBtns);
        calc.appendChild(header);

        // Body – will contain the calculator snippet placeholder (script removed)
        const body = document.createElement('div');
        body.id = 'mp-calculator-body';
        body.style.cssText = `
            padding:10px;background:transparent;color:inherit;
            max-width:460px;box-sizing:border-box;
        `;

        // Put the HTML+STYLE here, but WITHOUT the <script>…</script> (we will inject the script separately)
        const bodyInner = `<!--
TERMS OF USE
BY USING THE CODE, YOU AGREE:
1. THAT THE MATERIALS ARE PROVIDED "AS IS" AND WITHOUT WARRANTIES OF ANY KIND
2. NOT TO CHANGE ANY OF THE JAVASCRIPT CODE, INCLUDING THE LICENSE TEXT
3. NOT TO REMOVE THE LINE OF TEXT "powered by calculator.net"
4. THAT THE COPYRIGHT BELONGS TO calculator.net
5. NOT TO REMOVE THE TERMS OF USE
-->
<!--BEGIN OF SCIENTIFIC CALCULATOR CODE-->
<style>
#sciout{padding:5px;border-top:1px solid #262626;border-left:1px solid #262626;border-right:2px outset #262626;border-bottom:2px outset #262626;background: #eeeeee;font-family:arial,helvetica,sans-serif;}#sciOutPut{font-size:18px;padding:3px;margin:2px;cursor:text;text-align:right;background-color:#B8C6A3;border:1px solid #87996b;border-radius: 3px;color:#000;}.scifunc{display: inline-block;display: table-cell;vertical-align: middle;text-align:center;width:50px;height:25px;margin:1px;border:1px solid #262626;border-radius: 3px;font-family:arial,helvetica,sans-serif;font-size:16px;font-weight:bold;color:#185290;background-color:#C8D8E8;}.scifunc:active {background-color:#013f7d;color:#ffffff;}.scinm{display: inline-block;display: table-cell;vertical-align: middle;padding: 5px 0px;text-align:center;width:50px;height:30px;margin:1px;border:1px solid #262626;border-radius: 3px;font-family:arial,helvetica,sans-serif;font-size:16px;font-weight:bold;color:#FFF;background-color:#262626;}.scinm:active {background-color:#aaaaaa;color:#000000;}.sciop{display: inline-block;display: table-cell;vertical-align: middle;padding: 5px 0px;text-align:center;width:50px;height:30px;margin:1px;border:1px solid #262626;border-radius: 3px;font-family:arial,helvetica,sans-serif;font-size:16px;font-weight:bold;color:#262626;background-color:#ccc;}.sciop:active {background-color:#000000;color:#ffffff;}.scird{display: inline-block;display: table-cell;vertical-align: middle;text-align:center;height:30px;margin:1px;border:1px solid #eeeeee;border-radius: 3px;font-family:arial,helvetica,sans-serif;font-size:13px;color:#262626;}.scieq{display: inline-block;display: table-cell;vertical-align: middle;padding: 5px 0px;text-align:center;width:50px;height:30px;margin:1px;border:1px solid #262626;border-radius: 3px;font-family:arial,helvetica,sans-serif;font-size:16px;font-weight:bold;color:#F00;background-color:#DCADB0;}.scieq:active {background-color:#ff0000;color:#ffffff;}#calfootnote {font-family:arial,helvetica,sans-serif;font-size:12px;text-align:right;}
</style>
<table><tr><td id="sciout"><div><div id="sciOutPut">0</div></div><div style="padding-top:3px;width:100%"><div><span onclick="r('sin')" class="scifunc">sin</span><span onclick="r('cos')" class="scifunc">cos</span><span onclick="r('tan')" class="scifunc">tan</span><span class="scird"><label for="scirdsettingd"><input id="scirdsettingd" type="radio" name="scirdsetting" value="deg" onClick="degreeRadians='degree';" checked>Deg</label><label for="scirdsettingr"><input id="scirdsettingr" type="radio" name="scirdsetting" value="rad" onClick="degreeRadians='radians';">Rad</label></span></div><div><span onclick="r('asin')" class="scifunc">sin<sup>-1</sup></span><span onclick="r('acos')" class="scifunc">cos<sup>-1</sup></span><span onclick="r('atan')" class="scifunc">tan<sup>-1</sup></span><span onclick="r('pi')" class="scifunc">&#960;</span><span onclick="r('e')" class="scifunc">e</span></div><div><span onclick="r('pow')" class="scifunc">x<sup>y</sup></span><span onclick="r('x3')" class="scifunc">x<sup>3</sup></span><span onclick="r('x2')" class="scifunc">x<sup>2</sup></span><span onclick="r('ex')" class="scifunc">e<sup>x</sup></span><span onclick="r('10x')" class="scifunc">10<sup>x</sup></span></div><div><span onclick="r('apow')" class="scifunc"><sup>y</sup>&#8730;x</span><span onclick="r('3x')" class="scifunc"><sup>3</sup>&#8730;x</span><span onclick="r('sqrt')" class="scifunc">&#8730;x</span><span onclick="r('ln')" class="scifunc">ln</span><span onclick="r('log')" class="scifunc">log</span></div><div><span onclick="r('(')" class="scifunc">(</span><span onclick="r(')')" class="scifunc">)</span><span onclick="r('1/x')" class="scifunc">1/x</span><span onclick="r('pc')" class="scifunc">%</span><span onclick="r('n!')" class="scifunc">n!</span></div></div><div style="padding-top:3px;"><div><span onclick="r(7)" class="scinm">7</span><span onclick="r(8)" class="scinm">8</span><span onclick="r(9)" class="scinm">9</span><span onclick="r('+')" class="sciop">+</span><span onclick="r('MS')" class="sciop">MS</span></div><div><span onclick="r(4)" class="scinm">4</span><span onclick="r(5)" class="scinm">5</span><span onclick="r(6)" class="scinm">6</span><span onclick="r('-')" class="sciop">&ndash;</span><span onclick="r('M+')" class="sciop">M+</span></div><div><span onclick="r(1)" class="scinm">1</span><span onclick="r(2)" class="scinm">2</span><span onclick="r(3)" class="scinm">3</span><span onclick="r('*')" class="sciop">&#215;</span><span onclick="r('M-')" class="sciop">M-</span></div><div><span onclick="r(0)" class="scinm">0</span><span onclick="r('.')" class="scinm">.</span><span onclick="r('EXP')" class="sciop">EXP</span><span onclick="r('/')" class="sciop">&#247;</span><span onclick="r('MR')" class="sciop">MR</span></div><div><span onclick="r('+/-')" class="sciop">&#177;</span><span onclick="r('RND')" class="sciop">RND</span><span onclick="r('C')" class="scieq">C</span><span onclick="r('=')" class="scieq">=</span><span onclick="r('MC')" class="sciop">MC</span></div></div></td></tr><tr><td id="calfootnote">powered by <a href="https://www.calculator.net" rel="nofollow">calculator.net</a></td></tr></table>
<!--END OF SCIENTIFIC CALCULATOR CODE-->`;

        // Set the HTML (no <script> included here)
        body.innerHTML = bodyInner;
        calc.appendChild(body);
        document.body.appendChild(calc);

        // Now inject the original script content as a real script so functions are defined
        const scriptContent = (function () {
            /* extracted script (calculator logic) */
            return String(function(){
/*****************************************
(C) https://www.calculator.net all right reserved.
*****************************************/
function gObj(obj) {var theObj;if(document.all){if(typeof obj=="string"){return document.all(obj);}else{return obj.style;}}if(document.getElementById){if(typeof obj=="string"){return document.getElementById(obj);}else{return obj.style;}}return null;}function trimAll(sString){while (sString.substring(0,1) == ' '){sString = sString.substring(1, sString.length);}while (sString.substring(sString.length-1, sString.length) == ' '){sString = sString.substring(0,sString.length-1);} return sString;} function showDebugInfo(){}function r(A){if(A=="10x"||A=="log"||A=="ex"||A=="ln"||A=="sin"||A=="asin"||A=="cos"||A=="acos"||A=="tan"||A=="atan"||A=="e"||A=="pi"||A=="n!"||A=="x2"||A=="1/x"||A=="swap"||A=="x3"||A=="3x"||A=="RND"||A=="M-"||A=="qc"||A=="MC"||A=="MR"||A=="MS"||A=="M+"||A=="sqrt"||A=="pc"){func(A)}else{if(A==1||A==2||A==3||A==4||A==5||A==6||A==7||A==8||A==9||A==0){numInput(A)}else{if(A=="pow"||A=="apow"||A=="+"||A=="-"||A=="*"||A=="/"){opt(A)}else{if(A=="("){popen()}else{if(A==")"){pclose()}else{if(A=="EXP"){exp()}else{if(A=="."){if(entered){value=0;digits=1}entered=false;if((decimal==0)&&(value==0)&&(digits==0)){digits=1}if(decimal==0){decimal=1}refresh()}else{if(A=="+/-"){if(exponent){Hj=-Hj}else{value=-value}refresh()}else{if(A=="C"){level=0;exponent=false;value=0;enter();refresh()}else{if(A=="="){enter();while(level>0){evalx()}refresh()}}}}}}}}}}}var totalDigits=12;var pareSize=12;var degreeRadians="degree";var value=0;var memory=0;var level=0;var entered=true;var decimal=0;var fixed=0;var exponent=false;var digits=0;var showValue="0";var isShowValue=true;function stackItem(){this.value=0;this.op=""}function array(A){this[0]=0;for(i=0;i<A;++i){this[i]=0;this[i]=new stackItem()}this.gG=A}uI=new array(pareSize);function push(B,C,A){if(level==pareSize){return false}for(i=level;i>0;--i){uI[i].value=uI[i-1].value;uI[i].op=uI[i-1].op;uI[i].vg=uI[i-1].vg}uI[0].value=B;uI[0].op=C;uI[0].vg=A;++level;return true}function pop(){if(level==0){return false}for(i=0;i<level;++i){uI[i].value=uI[i+1].value;uI[i].op=uI[i+1].op;uI[i].vg=uI[i+1].vg}--level;return true}function format(I){if(typeof (cc)!="undefined"){return };var E=""+I;if(E.indexOf("N")>=0||(I==2*I&&I==1+I)){return"Error "}var G=E.indexOf("e");if(G>=0){var A=E.substring(G+1,E.length);if(G>11){G=11}E=E.substring(0,G);if(E.indexOf(".")<0){E+="."}else{j=E.length-1;while(j>=0&&E.charAt(j)=="0"){--j}E=E.substring(0,j+1)}E+=" "+A}else{var J=false;if(I<0){I=-I;J=true}var C=Math.floor(I);var K=I-C;var D=totalDigits-(""+C).length-1;if(!entered&&fixed>0){D=fixed}var F=" 1000000000000000000".substring(1,D+2)+"";if((F=="")||(F==" ")){F=1}else{F=parseInt(F)}var B=Math.floor(K*F+0.5);C=Math.floor(Math.floor(I*F+0.5)/F);if(J){E="-"+C}else{E=""+C}var H="00000000000000"+B;H=H.substring(H.length-D,H.length);G=H.length-1;if(entered||fixed==0){while(G>=0&&H.charAt(G)=="0"){--G}H=H.substring(0,G+1)}if(G>=0){E+="."+H}}return E}function refresh(){var A=format(value);if(exponent){if(Hj<0){A+=" "+Hj}else{A+=" +"+Hj}}if(A.indexOf(".")<0&&A!="Error "){if(entered||decimal>0){A+="."}else{A+=" "}}if(""==(""+A)){document.getElementById("sciOutPut").innerHTML=" "}else{document.getElementById("sciOutPut").innerHTML=A}}function evalx(){if(level==0){return false}op=uI[0].op;Qk=uI[0].value;if(op=="+"){value=parseFloat(Qk)+value}else{if(op=="-"){value=Qk-value}else{if(op=="*"){value=Qk*value}else{if(op=="/"){value=Qk/value}else{if(op=="pow"){value=Math.pow(Qk,value)}else{if(op=="apow"){value=Math.pow(Qk,1/value)}}}}}}pop();if(op=="("){return false}return true}function popen(){enter();if(!push(0,"(",0)){value="NAN"}refresh()}function pclose(){enter();while(evalx()){}refresh()}function opt(A){enter();if(A=="+"||A=="-"){vg=1}else{if(A=="*"||A=="/"){vg=2}else{if(A=="pow"||A=="apow"){vg=3}}}if(level>0&&vg<=uI[0].vg){evalx()}if(!push(value,A,vg)){value="NAN"}refresh()}function enter(){if(exponent){value=value*Math.exp(Hj*Math.LN10)}entered=true;exponent=false;decimal=0;fixed=0}function numInput(A){if(entered){value=0;digits=0;entered=false}if(A==0&&digits==0){refresh();return }if(exponent){if(Hj<0){A=-A}if(digits<3){Hj=Hj*10+A;++digits;refresh()}return }if(value<0){A=-A}if(digits<totalDigits-1){++digits;if(decimal>0){decimal=decimal*10;value=value+(A/decimal);++fixed}else{value=value*10+A}}refresh()}function exp(){if(entered||exponent){return }exponent=true;Hj=0;digits=0;decimal=0;refresh()}function func(D){enter();if(D=="1/x"){value=1/value}if(D=="pc"){value=value/100}if(D=="qc"){value=value/1000}else{if(D=="swap"){var B=value;value=uI[0].value;uI[0].value=B}else{if(D=="n!"){if(value<0||value>200||value!=Math.round(value)){value="NAN"}else{var E=1;var A;for(A=1;A<=value;++A){E*=A}value=E}}else{if(D=="MR"){value=memory}else{if(D=="M+"){memory+=value}else{if(D=="MS"){memory=value}else{if(D=="MC"){memory=0}else{if(D=="M-"){memory-=value}else{if(D=="asin"){if(degreeRadians=="degree"){value=Math.asin(value)*180/Math.PI}else{value=Math.asin(value)}}else{if(D=="acos"){if(degreeRadians=="degree"){value=Math.acos(value)*180/Math.PI}else{value=Math.acos(value)}}else{if(D=="atan"){if(degreeRadians=="degree"){value=Math.atan(value/180*Math.PI)}else{value=Math.atan(value)}}else{if(D=="e^x"){value=Math.exp(value*Math.LN10)}else{if(D=="2^x"){value=Math.exp(value*Math.LN2)}else{if(D=="e^x"){value=Math.exp(value)}else{if(D=="x^2"){value=value*value}else{if(D=="e"){value=Math.E}else{if(D=="ex"){value=Math.pow(Math.E,value)}else{if(D=="10x"){value=Math.pow(10,value)}else{if(D=="x3"){value=value*value*value}else{if(D=="3x"){value=Math.pow(value,1/3)}else{if(D=="x2"){value=value*value}else{if(D=="sin"){if(degreeRadians=="degree"){value=Math.sin(value/180*Math.PI)}else{value=Math.sin(value)}}else{if(D=="cos"){if(degreeRadians=="degree"){var C=(value%360);if(C<0){C=C+360}if(C==90){value=0}else{if(C==270){value=0}else{value=Math.cos(value/180*Math.PI)}}}else{var C=(value*180/Math.PI)%360;if(C<0){C=C+360}if((Math.abs(C-90)<1e-10)||(Math.abs(C-270)<1e-10)){value=0}else{value=Math.cos(value)}}}else{if(D=="tan"){if(degreeRadians=="degree"){value=Math.tan(value/180*Math.PI)}else{value=Math.tan(value)}}else{if(D=="log"){value=Math.log(value)/Math.LN10}else{if(D=="log2"){value=Math.log(value)/Math.LN2}else{if(D=="ln"){value=Math.log(value)}else{if(D=="sqrt"){value=Math.sqrt(value)}else{if(D=="pi"){value=Math.PI}else{if(D=="RND"){value=Math.random()}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}refresh()};
            } );
        })();

        // create and attach script element
        const scr = document.createElement('script');
        scr.type = 'text/javascript';
        scr.textContent = scriptContent;
        // append AFTER calc is in the DOM so the script can find elements by id
        calc.appendChild(scr);

        // Wire close
        closeBtn.onclick = () => calc.remove();

        // Make draggable (dragging header moves whole calculator)
        draggable(calc, header);

        // Ensure it's on top when clicked
        calc.addEventListener('mousedown', () => {
            calc.style.zIndex = 2147483648;
        });
    }

    function draggable(panel, handle) {
        let dragging = false, ox = 0, oy = 0;
        const move = e => {
            const x = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
            const y = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
            if (!dragging || x == null) return;
            panel.style.left = (x - ox) + 'px';
            panel.style.top  = (y - oy) + 'px';
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
