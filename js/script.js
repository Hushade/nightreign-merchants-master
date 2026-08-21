let normalData = [];
let villageData = [];
let goldenData = [];
let villagePattern = null;
let goldenPattern = null;
let assetMap = null;

// Load and parse a CSV file with PapaParse.
async function fetchAndParseCSV(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvText = await response.text();
        return new Promise((resolve) => {
            Papa.parse(csvText, {
                header: false,
                skipEmptyLines: true,
                complete: function(results) {
                    resolve(results.data);
                }
            });
        });
    } catch (error) {
        console.error(`Failed to load ${filename}:`, error);
        return [];
    }
}

// Load the normalized item-to-image map.
async function loadAssetMap() {
    const assetMapPath = 'data/asset-map.json';
    try {
        const response = await fetch(assetMapPath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        assetMap = await response.json();
    } catch (error) {
        console.error(`Failed to load ${assetMapPath}:`, error);
        assetMap = { normal: {}, village: {}, golden: {} };
    }
}

// Resolve an item name to its image path.
function getImagePath(name) {
    if (!assetMap || !name) return '';
    const fileName = assetMap[name];
    return fileName ? `images/${fileName}` : '';
}

// Initialize the application.
async function init() {
    // Load the asset map before rendering cards.
    await loadAssetMap();

    // Load all merchant data files concurrently.
    [normalData, villageData, goldenData] = await Promise.all([
        fetchAndParseCSV('data/NormalMerchants.csv'),
        fetchAndParseCSV('data/VillageMerchants.csv'),
        fetchAndParseCSV('data/GoldenMerchants.csv')
    ]);

    document.getElementById('loading').classList.add('hidden');
    const normalSection = document.getElementById('normal-section');
    normalSection.classList.remove('hidden');

    renderCards('normal-grid', normalData, handleNormalSelection);
}

// Render merchant cards into a grid.
function renderCards(containerId, data, clickHandler) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear stale cards before rendering.

    if (data.length === 0) {
        container.innerHTML = '<p>該当する商品がありません。</p>';
        return;
    }

    data.forEach((row) => {
        // row[0]: pattern ID, row[1]: item name, row[2]: detail 1, row[3]: detail 2
        const patternId = row[0];
        const name = row[1] || '不明な商品';
        const detail1 = row[2] || '';
        const detail2 = row[3] || '';
        const detail2Lines = detail2.split('\n');
        const detail2Html = detail2Lines
            .map(line => `<p class="detail-line">${line}</p>`)
            .join('');

        const card = document.createElement('div');
        card.className = 'card';
        card.tabIndex = 0; // Keep cards keyboard-accessible.

        // Look up the image using the item name only.
        const imagePath = name === '不明な商品' ? '' : getImagePath(name);

        card.innerHTML = `
            <div class="card-content">
            <div class="card-main">
                <div class="card-image-wrapper">
                    <img src="${imagePath}"
                        alt="${name}"
                        loading="lazy"
                        class="card-image"
                        onerror="this.onerror=null; this.parentElement.classList.add('no-image');">
                </div>
                <div class="card-content">
                    <div class="card-title">${name}</div>
                    <div class="card-subtitle">${detail1}</div>
                </div>
            </div>
                <div class="card-desc">${detail2Html}</div>
            </div>
        `;

        // Allow selection by click, Enter, or Space.
        const triggerHandler = () => clickHandler(patternId, card);
        card.addEventListener('click', triggerHandler);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerHandler();
            }
        });

        container.appendChild(card);
    });
}

// Handle selection of a NormalMerchants card.
function handleNormalSelection(patternId, selectedCard) {
    const GOLDEN_PATTERN_MAP = [5, 6, 4, null, 2, 0, 3, 5, 6, 4, 1, 2, 0, 3, 5, 6, 4, 1, 2, 0, 3];
    villagePattern = patternId;
    goldenPattern = GOLDEN_PATTERN_MAP[patternId];

    // Update the selected card state.
    document.querySelectorAll('#normal-grid .card').forEach(c => c.classList.remove('selected'));
    selectedCard.classList.add('selected');

    // Collapse the normal merchant section.
    setAccordionState('normal-section', false);

    // Show and render the filtered derived merchant sections.
    document.getElementById('merchants-container').classList.remove('hidden');

    // Filter derived items by their mapped pattern IDs.
    const filteredVillage = villageData.filter(row => row[0] === villagePattern?.toString());
    const filteredGolden = goldenData.filter(row => row[0] === goldenPattern?.toString());

    renderCards('village-grid', filteredVillage, () => {});
    renderCards('golden-grid', filteredGolden, () => {});

    // Keep both derived sections collapsed until the user opens one.
    setAccordionState('village-section', false);
    setAccordionState('golden-section', false);
}

// Toggle an accordion section.
function toggleAccordion(sectionId) {
    const section = document.getElementById(sectionId);
    const isExpanded = section.getAttribute('aria-expanded') === 'true';

    // Keep derived sections mutually exclusive when one is opened.
    if (!isExpanded) {
        if (sectionId === 'normal-section') {
            setAccordionState('village-section', false);
            setAccordionState('golden-section', false);
        }
        if (sectionId === 'village-section') setAccordionState('golden-section', false);
        if (sectionId === 'golden-section') setAccordionState('village-section', false);

        setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    setAccordionState(sectionId, !isExpanded);
}

// Set an accordion section's expanded state.
function setAccordionState(sectionId, expand) {
    const section = document.getElementById(sectionId);
    section.setAttribute('aria-expanded', expand);

    // Prevent collapsed cards from receiving keyboard focus.
    const cards = section.querySelectorAll('.card');
    cards.forEach(card => {
        if (expand) {
            card.setAttribute('tabindex', '0'); // Expanded cards are focusable.
        } else {
            card.setAttribute('tabindex', '-1'); // Skip cards in collapsed sections.
        }
    });
}

// Start the application after the document is ready.
window.addEventListener('DOMContentLoaded', init);