const castObserver = new MutationObserver(function() {
    const castBtn = document.querySelector('.headerCastButton');
    if (castBtn) {
        castBtn.style.setProperty('display', 'flex', 'important');
    }
});
castObserver.observe(document.body, { childList: true, subtree: true, attributes: true });
