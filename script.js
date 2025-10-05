// Load and display benefits from JSON
let allBenefits = [];
let allTags = new Set();

// Fetch benefits data with caching
async function loadBenefits() {
    try {
        const response = await fetch('benefits.json', {
            cache: 'force-cache'
        });
        if (!response.ok) {
            throw new Error('Failed to load benefits data');
        }
        allBenefits = await response.json();
        
        // Extract all unique tags
        allBenefits.forEach(benefit => {
            benefit.tags.forEach(tag => allTags.add(tag));
        });
        
        // Generate and inject JSON-LD
        generateJsonLD(allBenefits);
        
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
    container.innerHTML = ''; // clear old cards
    
    if (benefits.length === 0) {
        container.innerHTML = '<p class="loading">No benefits found for this filter.</p>';
        return;
    }
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    benefits.forEach(benefit => {
        const card = createBenefitCard(benefit);
        if (card) {
            fragment.appendChild(card);
        }
    });
    
    container.appendChild(fragment);
}

// // Create HTML string for a single benefit card
// function createBenefitCard(benefit) {
//     const tags = benefit.tags.map(tag => 
//         `<span class="tag">${escapeHtml(tag)}</span>`
//     ).join('');
    
//     return `
//         <a class="benefit-card" href="${escapeHtml(benefit.url)}" target="_blank" rel="noreferrer">
//             <img src="${escapeHtml(benefit.imageSrc)}" 
//                  alt="${escapeHtml(benefit.title)}" 
//                  class="card-image"
//                  onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23e9ecf5%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%23667eea%22%3ENo Image%3C/text%3E%3C/svg%3E'">
//             <div class="card-content">
//                 <h2 class="card-title">${escapeHtml(benefit.title)}</h2>
//                 <p class="card-description">${benefit.description}</p>
//                 <div class="card-tags">
//                     ${tags}
//                 </div>
//             </div>
//         </a>
//     `;
// }

// Create DOM element for each benefit
function createBenefitCard(benefit) {
    if (benefit.hide === true) {
        return null;
    }
    const card = document.createElement('a');
    card.className = 'benefit-card';
    card.href = benefit.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    // Image
    const img = document.createElement('img');
    img.src = benefit.imageSrc;
    img.alt = benefit.title;
    img.className = 'card-image';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 320;
    img.height = 180;
    img.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23e9ecf5%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%23667eea%22%3ENo Image%3C/text%3E%3C/svg%3E';
    };
    card.appendChild(img);

    // Content container
    const content = document.createElement('div');
    content.className = 'card-content';

    // Title
    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = benefit.title;
    content.appendChild(title);

    // Description (can contain HTML)
    const desc = document.createElement('p');
    desc.className = 'card-description';
    desc.innerHTML = benefit.description; // <-- safe for your controlled JSON
    content.appendChild(desc);

    // Campus enrollment warning
    if (benefit.requiresCampus) {
        const campusWarning = document.createElement('div');
        campusWarning.className = 'campus-warning';
        campusWarning.textContent = 'Full campus enrollment required';
        content.appendChild(campusWarning);
    }

    // Tags
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'card-tags';
    benefit.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = tag;
        tagsContainer.appendChild(span);
    });
    content.appendChild(tagsContainer);

    card.appendChild(content);
    return card;
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
        
        // Generate and inject JSON-LD
        generateJsonLD(allBenefits);
        
        // Initialize filters
        createFilterButtons();
        
        // Display all benefits
        displayBenefits(allBenefits);
    } catch (error) {
        console.error('Error loading benefits:', error);
        displayError();
    }
}

// Generate JSON-LD structured data from benefits
function generateJsonLD(benefits) {
    const baseUrl = 'https://studentbenefits.qzz.io';
    
    const itemListElements = benefits
        .filter(benefit => !benefit.hide) // Exclude hidden items
        .map((benefit, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Thing",
                "name": benefit.title,
                "description": benefit.description.replace(/<[^>]*>/g, ''), // Strip HTML tags
                "url": benefit.url,
                "image": `${baseUrl}${benefit.imageSrc}`,
                "keywords": benefit.tags.join(', ')
            }
        }));
    
    const jsonLD = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Student Benefits",
        "description": "A curated list of student benefits and discounts available with your .edu email",
        "itemListElement": itemListElements
    };
    
    // Create script tag and inject into head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLD, null, 2);
    document.head.appendChild(script);
}


// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Register service worker for offline support and caching
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    }
    
    // Add event listener for "All" filter button
    const allFilterBtn = document.querySelector('[data-tag="all"]');
    if (allFilterBtn) {
        allFilterBtn.addEventListener('click', handleFilterClick);
    }
    
    // Load benefits
    loadBenefits();
});
