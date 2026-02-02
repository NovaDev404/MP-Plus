# MP+
Make Maths Pathway better in every way!

## MP Tools Bookmarklet
```javascript
javascript:(function(){fetch('https://api.github.com/repos/NovaDev404/MP-Plus/commits?path=script.js&per_page=1%27).then(function(r){return r.json()}).then(function(d){if(!d.length){console.error(%27No commits found%27);return;}var s=document.createElement(%27script%27);s.src=%27https://cdn.jsdelivr.net/gh/NovaDev404/MP-Plus@%27+d[0].sha.substring(0,7)+%27/script.js%27;s.onload=function(){if(typeof MP_Tools===%27function%27)MP_Tools();else console.error(%27MP_Tools not found%27)};s.onerror=function(){console.error(%27Failed to load MP_Tools%27)};document.head.appendChild(s);}).catch(function(e){console.error(e)})})();
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
