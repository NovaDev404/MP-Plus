# MP+
Make Maths Pathway better in every way!

## MP Tools Bookmarklet
```javascript
javascript:(function(){ fetch('https://api.github.com/repos/NovaDev404/MP-Plus/commits?path=script.js&per_page=1') .then(function(r){ return r.json(); }) .then(function(d){ if(!d.length){ console.error('No commits found'); return; } var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/gh/NovaDev404/MP-Plus@' + d[0].sha.substring(0,7) + '/script.js'; s.onload = function(){ if(typeof MP_Tools === 'function') MP_Tools(); else console.error('MP_Tools not found'); }; s.onerror = function(){ console.error('Failed to load MP_Tools'); }; document.head.appendChild(s); }) .catch(function(e){ console.error(e); }); })();
```

### How to use MP Tools
1. Either paste the bookmarklet above into Maths Pathway's console or into a bookmarklet
2. Once you have run it, it should say 'MP Tools Activated' in the top left corner of your screen.
3. To enable / disable features hold down `Alt` and press:
   - `1` to toggle the speedrunner
   - `2` to toggle the 'remove annoying' feature
   - `3` to toggle the 'right click' feature, which re-enables the blocked right clicking, and enables selecting more text.
   - `4` to toggle the calculator.
   - `5` to toggle the AI chat.
   - `6` to change progress bar theme. Double tap the 6 to open the selection menu.
