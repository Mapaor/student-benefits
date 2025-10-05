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
    
    benefits.forEach((benefit, index) => {
        const card = createBenefitCard(benefit, index);
        if (card) {
            container.appendChild(card);
        }
    });
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
function createBenefitCard(benefit, index = 0) {
    if (benefit.hide === true) {
        return null;
    }
    const card = document.createElement('a');
    card.className = 'benefit-card';
    card.href = benefit.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.setAttribute('aria-label', `Learn more about ${benefit.title} student benefits`);
    card.setAttribute('itemscope', '');
    card.setAttribute('itemtype', 'https://schema.org/Offer');
    card.setAttribute('role', 'listitem');

    // Image container to prevent CLS
    const imgContainer = document.createElement('div');
    imgContainer.className = 'card-image-container';
    imgContainer.style.cssText = 'width: 100%; height: 200px; min-height: 200px; aspect-ratio: 2/1; background: #f8f9fa;';

    // Image
    const img = document.createElement('img');
    img.src = benefit.imageSrc;
    img.alt = `${benefit.title} - Student Discount and Benefits`;
    img.className = 'card-image';
    img.width = 400;
    img.height = 200;
    img.setAttribute('itemprop', 'image');
    img.style.aspectRatio = '2 / 1';
    
    // First 3 images load immediately (for LCP)
    if (index < 3) {
        img.loading = 'eager';
        img.fetchPriority = 'high';
        img.decoding = 'sync';
    } else {
        // Rest of images: lazy load
        img.loading = 'lazy';
        img.decoding = 'async';
        img.fetchPriority = 'low';
    }
    
    img.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%23e9ecf5%22 width=%22400%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%23667eea%22%3ENo Image%3C/text%3E%3C/svg%3E';
    };
    
    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    // Content
    const content = document.createElement('div');
    content.className = 'card-content';
    content.setAttribute('itemprop', 'description');

    // Title
    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = benefit.title;
    title.setAttribute('itemprop', 'name');

    const description = document.createElement('p');
    description.className = 'card-description';
    description.innerHTML = benefit.description;

    content.appendChild(title);
    content.appendChild(description);

    // Tags
    if (benefit.tags && benefit.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'card-tags';
        
        benefit.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
        
        content.appendChild(tagsContainer);
    }

    // Warning for campus-only benefits
    if (benefit.requiresCampus) {
        const warning = document.createElement('p');
        warning.className = 'campus-warning';
        warning.textContent = '⚠️ May require on-campus verification';
        content.appendChild(warning);
    }

    card.appendChild(content);

    // Add link metadata
    const link = document.createElement('link');
    link.setAttribute('itemprop', 'url');
    link.href = benefit.url;
    card.appendChild(link);

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
    // Add event listener for "All" filter button
    const allFilterBtn = document.querySelector('[data-tag="all"]');
    if (allFilterBtn) {
        allFilterBtn.addEventListener('click', handleFilterClick);
    }
    
    // Load benefits
    loadBenefits();
});
