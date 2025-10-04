// Load and display benefits from JSON
let allBenefits = [];
let allTags = new Set();

// Fetch benefits data
async function loadBenefits() {
    try {
        const response = await fetch('benefits.json');
        if (!response.ok) {
            throw new Error('Failed to load benefits data');
        }
        allBenefits = await response.json();
        
        // Extract all unique tags
        allBenefits.forEach(benefit => {
            benefit.tags.forEach(tag => allTags.add(tag));
        });
        
        // Initialize filters
        createFilterButtons();
        
        // Display all benefits
        displayBenefits(allBenefits);
    } catch (error) {
        console.error('Error loading benefits:', error);
        displayError();
    }
}

// Create filter buttons based on tags
function createFilterButtons() {
    const filtersContainer = document.querySelector('.filters');
    
    // Sort tags alphabetically
    const sortedTags = Array.from(allTags).sort();
    
    // Add tag filter buttons
    sortedTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = tag;
        button.dataset.tag = tag;
        button.addEventListener('click', handleFilterClick);
        filtersContainer.appendChild(button);
    });
}

// Handle filter button clicks
function handleFilterClick(event) {
    const clickedButton = event.target;
    const selectedTag = clickedButton.dataset.tag;
    
    // Update active state
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    clickedButton.classList.add('active');
    
    // Filter benefits
    if (selectedTag === 'all') {
        displayBenefits(allBenefits);
    } else {
        const filteredBenefits = allBenefits.filter(benefit => 
            benefit.tags.includes(selectedTag)
        );
        displayBenefits(filteredBenefits);
    }
}

// Display benefits as cards
function displayBenefits(benefits) {
    const container = document.getElementById('benefits-container');
    
    if (benefits.length === 0) {
        container.innerHTML = '<p class="loading">No benefits found for this filter.</p>';
        return;
    }
    
    container.innerHTML = benefits.map(benefit => createBenefitCard(benefit)).join('');
}

// Create HTML for a single benefit card
function createBenefitCard(benefit) {
    const tags = benefit.tags.map(tag => 
        `<span class="tag">${escapeHtml(tag)}</span>`
    ).join('');
    
    return `
        <a class="benefit-card" href="${escapeHtml(benefit.url)}" target="_blank" rel="noopener noreferrer">
            <img src="${escapeHtml(benefit.imageSrc)}" 
                 alt="${escapeHtml(benefit.title)}" 
                 class="card-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23e9ecf5%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%23667eea%22%3ENo Image%3C/text%3E%3C/svg%3E'">
            <div class="card-content">
                <h2 class="card-title">${escapeHtml(benefit.title)}</h2>
                <p class="card-description">${escapeHtml(benefit.description)}</p>
                <div class="card-tags">
                    ${tags}
                </div>
            </div>
        </a>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Display error message
function displayError() {
    const container = document.getElementById('benefits-container');
    container.innerHTML = '<p class="loading">Failed to load benefits. Please try again later.</p>';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for "All" filter button
    const allFilterBtn = document.querySelector('[data-tag="all"]');
    if (allFilterBtn) {
        allFilterBtn.addEventListener('click', handleFilterClick);
    }
    
    // Load benefits
    loadBenefits();
});
