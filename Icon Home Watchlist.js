function assignTabClasses() {
    document.querySelectorAll('.emby-tab-button').forEach(btn => {
        const text = btn.textContent.trim().toLowerCase();
        btn.classList.remove('tab-home','tab-favorites','tab-watchlist','tab-bookmarkadd');
        if (text.includes('start')) btn.classList.add('tab-home');
        else if (text.includes('favorit')) btn.classList.add('tab-favorites');
        else if (text.includes('watch')) btn.classList.add('tab-watchlist');
        else if (text.includes('bookmark')) btn.classList.add('tab-bookmarkadd');
    });
}
// MutationObserver statt setTimeout → effizient
const observer = new MutationObserver(assignTabClasses);
observer.observe(document.body, { childList: true, subtree: true });
// Initial
assignTabClasses();
```
