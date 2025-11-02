# MP Tools Bookmarklet
```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://raw.githubusercontent.com/SuperGamer474/MP-Tools/refs/heads/main/script.js';s.onload=function(){if(typeof MP_Tools==='function')MP_Tools();else console.error('MP_Tools not found');};s.onerror=function(){console.error('Failed to load MP_Tools');};document.head.appendChild(s);})();
```
