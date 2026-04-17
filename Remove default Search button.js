document.addEventListener('viewshow', function() {
    const searchBtn = document.querySelector('.headerSearchButton');
    if (searchBtn) searchBtn.style.setProperty('display', 'none', 'important');
});
