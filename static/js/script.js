// Initialize Lucide Icons
lucide.createIcons();

// Simple sidebar toggle (optional functionality)
const sidebarItems = document.querySelectorAll('.sidebar-nav li');

sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

// Log a message to confirm script loading
console.log("Dashboard loaded successfully!");
