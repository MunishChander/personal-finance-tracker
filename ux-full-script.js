// Track current active tab
let currentActiveTab = 'all';

// Modal Functions
function openAddModal() {
    document.getElementById('addAssetModal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('addAssetModal').classList.remove('active');
}

function selectAssetType(type) {
    alert(`Selected asset type: ${type}\n\nThis would open a specific form for ${type} in the full implementation.`);
    closeAddModal();
}

// Handle Add Asset based on active tab
function handleAddAsset() {
    const tabToAssetType = {
        'all': null, // Show modal with all options
        'equities': 'equity',
        'mutual-funds': 'mutual-fund',
        'fixed-deposits': 'fixed-deposit',
        'retirement': 'retirement',
        'savings': 'savings',
        'gold': 'gold'
    };
    
    const assetType = tabToAssetType[currentActiveTab];
    
    if (assetType) {
        // Direct add for specific tab
        openAssetForm(assetType);
    } else {
        // Show modal for "All Assets" tab
        openAddModal();
    }
}

function openAssetForm(type) {
    const assetNames = {
        'equity': 'Equity/Stock',
        'mutual-fund': 'Mutual Fund',
        'fixed-deposit': 'Fixed Deposit',
        'retirement': 'Retirement Account',
        'savings': 'Savings Account',
        'gold': 'Gold'
    };
    
    alert(`Opening form to add ${assetNames[type]}\n\nThis would open a specific form for ${assetNames[type]} in the full implementation.`);
}

// Update button text based on active tab
function updateAddAssetButton(tabName) {
    const addAssetText = document.getElementById('addAssetText');
    
    const buttonLabels = {
        'all': '+ Add Asset ▼',
        'equities': '+ Add Stock',
        'mutual-funds': '+ Add Fund',
        'fixed-deposits': '+ Add FD',
        'retirement': '+ Add Account',
        'savings': '+ Add Account',
        'gold': '+ Add Gold'
    };
    
    if (addAssetText) {
        addAssetText.textContent = buttonLabels[tabName] || '+ Add Asset';
    }
}

// Close modal on outside click
document.getElementById('addAssetModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeAddModal();
    }
});

// Tab switching functionality
function switchTab(tabName) {
    // Update current active tab
    currentActiveTab = tabName;
    
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Show/hide asset sections
    const sections = document.querySelectorAll('.asset-section');
    
    sections.forEach(section => {
        if (tabName === 'all') {
            section.style.display = 'contents';
        } else {
            const sectionId = section.id;
            section.style.display = sectionId === tabName ? 'contents' : 'none';
        }
    });
    
    // Update Add Asset button text
    updateAddAssetButton(tabName);
}

// View switching functionality
function switchView(viewType) {
    // Update active view button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
    
    const assetsGrid = document.getElementById('assetsGrid');
    
    if (viewType === 'table') {
        assetsGrid.style.display = 'block';
        alert('Table view would show a data table with sortable columns.\n\nColumns: Asset Name | Type | Value | Gain/Loss | Actions\n\nThis is a placeholder - full implementation would render an actual table.');
    } else {
        assetsGrid.style.display = 'grid';
    }
}

// Simulate live price updates
function updateLivePrices() {
    const liveElements = document.querySelectorAll('.badge.live');
    liveElements.forEach(badge => {
        // Add pulsing effect
        badge.style.animation = 'pulse 2s infinite';
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateLivePrices();
    
    // Simulate price updates every 5 seconds
    setInterval(() => {
        console.log('Updating live prices...');
        // In real implementation, this would fetch from API
    }, 5000);
});

// Button click handlers
document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', function() {
        alert('Buy functionality - would open buy form');
    });
});

document.querySelectorAll('.btn-sell').forEach(btn => {
    btn.addEventListener('click', function() {
        alert('Sell functionality - would open sell form');
    });
});

document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function() {
        alert('Edit functionality - would open edit form');
    });
});

document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this asset?')) {
            alert('Asset deleted (in real app)');
        }
    });
});

document.querySelectorAll('.btn-icon').forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.textContent.trim();
        alert(`${action} - This would show detailed ${action.toLowerCase()} in the full implementation`);
    });
});


// ===== TABLE SORTING FUNCTIONALITY =====

let sortDirections = {}; // Track sort direction for each table

function sortTable(tableId, columnIndex) {
    // Find the table within the section
    const section = document.getElementById(tableId);
    if (!section) return;
    
    const table = section.querySelector('.asset-table');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Initialize sort direction for this table+column
    const sortKey = `${tableId}-${columnIndex}`;
    if (!sortDirections[sortKey]) {
        sortDirections[sortKey] = 'asc';
    } else {
        sortDirections[sortKey] = sortDirections[sortKey] === 'asc' ? 'desc' : 'asc';
    }
    
    const direction = sortDirections[sortKey];
    
    // Sort rows
    rows.sort((a, b) => {
        const aCell = a.cells[columnIndex];
        const bCell = b.cells[columnIndex];
        
        if (!aCell || !bCell) return 0;
        
        // Get text content, removing currency symbols and commas
        let aValue = aCell.textContent.trim().replace(/[₹,]/g, '');
        let bValue = bCell.textContent.trim().replace(/[₹,]/g, '');
        
        // Try to parse as number
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        // If both are numbers, compare numerically
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Otherwise compare as strings
        if (direction === 'asc') {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
    
    // Update sort icon
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        const sortIcon = header.querySelector('.sort-icon');
        if (sortIcon) {
            if (index === columnIndex) {
                sortIcon.textContent = direction === 'asc' ? '↑' : '↓';
            } else {
                sortIcon.textContent = '⇅';
            }
        }
    });
}


// ===== THEME SWITCHER =====

// Check for saved theme preference or default to 'light'
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);

// Update theme toggle button on page load
document.addEventListener('DOMContentLoaded', function() {
    updateThemeButton(currentTheme);
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeButton(newTheme);
    updateChartColors(newTheme);
}

function updateThemeButton(theme) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark';
    }
}

function updateChartColors(theme) {
    // Update center text color in pie chart
    const centerText = document.getElementById('centerText');
    if (centerText) {
        centerText.setAttribute('fill', theme === 'dark' ? '#f1f5f9' : '#111827');
    }
}
