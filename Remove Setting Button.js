document.addEventListener('viewshow', function() {
    setTimeout(function() {
        const menuItems = document.querySelectorAll('.navMenuOption');
        menuItems.forEach(item => {
            if (item.textContent.trim().includes('Settings') || item.textContent.trim().includes('Einstellungen')) {
                item.style.setProperty('display', 'none', 'important');
            }
        });
    }, 500);
});
