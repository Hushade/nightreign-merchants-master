const PATTERN_MAP = [5, 6, 4, null, 2, 0, 3, 5, 6, 4, 1, 2, 0, 3, 5, 6, 4, 1, 2, 0, 3];

const DATASETS = {
    normal: { csvPath: 'data/NormalMerchants.csv', gridId: 'normal-grid' },
    village: { csvPath: 'data/VillageMerchants.csv', gridId: 'village-grid' },
    golden: { csvPath: 'data/GoldenMerchants.csv', gridId: 'golden-grid' }
};

const state = {
    normal: [],
    village: [],
    golden: []
};

let assetMap = {};

function parseMerchantRow(row) {
    return {
        patternId: row[0] || '',
        name: row[1] || '不明な商品',
        subtitle: row[2] || '',
        details: row[3] || ''
    };
}

async function fetchAndParseCSV(filename) {
    const response = await fetch(filename);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: false,
            skipEmptyLines: true,
            complete: results => resolve(results.data.map(parseMerchantRow)),
            error: error => reject(error)
        });
    });
}

async function loadAssetMap() {
    const assetMapPath = 'data/asset-map.json';
    const response = await fetch(assetMapPath);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    assetMap = await response.json();
}

function getImagePath(name) {
    const fileName = assetMap[name];
    return fileName ? `images/${fileName}` : '';
}

function createDetailElement(details) {
    const description = document.createElement('div');
    description.className = 'card-desc';

    details.split('\n').forEach(line => {
        const detail = document.createElement('p');
        detail.className = 'detail-line';
        detail.textContent = line;
        description.appendChild(detail);
    });

    return description;
}

function createCard(item, onSelect) {
    const card = document.createElement('div');
    card.className = 'card';
    card.tabIndex = 0;

    const content = document.createElement('div');
    content.className = 'card-content';

    const main = document.createElement('div');
    main.className = 'card-main';

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'card-image-wrapper';
    const imagePath = getImagePath(item.name);
    const image = document.createElement('img');
    image.className = 'card-image';
    image.alt = item.name;
    image.loading = 'lazy';
    if (imagePath) {
        image.src = imagePath;
        image.addEventListener('error', () => {
            image.remove();
            imageWrapper.classList.add('no-image');
        }, { once: true });
    } else {
        imageWrapper.classList.add('no-image');
    }
    imageWrapper.appendChild(image);

    const summary = document.createElement('div');
    summary.className = 'card-content';
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = item.name;
    const subtitle = document.createElement('div');
    subtitle.className = 'card-subtitle';
    subtitle.textContent = item.subtitle;
    summary.append(title, subtitle);

    main.append(imageWrapper, summary);
    content.append(main, createDetailElement(item.details));
    card.appendChild(content);

    const select = () => onSelect(item.patternId, card);
    card.addEventListener('click', select);
    card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            select();
        }
    });

    return card;
}

function renderCards(containerId, items, onSelect = () => {}) {
    const container = document.getElementById(containerId);
    container.replaceChildren();

    if (items.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = '該当する商品がありません。';
        container.appendChild(emptyMessage);
        return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach(item => fragment.appendChild(createCard(item, onSelect)));
    container.appendChild(fragment);
}

async function init() {
    try {
        await loadAssetMap();
        const [normal, village, golden] = await Promise.all(
            Object.values(DATASETS).map(dataset => fetchAndParseCSV(dataset.csvPath))
        );
        [state.normal, state.village, state.golden] = [normal, village, golden];

        document.getElementById('loading').classList.add('hidden');
        document.getElementById('normal-section').classList.remove('hidden');
        renderCards(DATASETS.normal.gridId, state.normal, handleNormalSelection);
    } catch (error) {
        console.error('Failed to initialize merchant data:', error);
        const loading = document.getElementById('loading');
        loading.textContent = 'データの読み込みに失敗しました。ページを再読み込みしてください。';
        loading.classList.add('error');
    }
}

function handleNormalSelection(patternId, selectedCard) {
    const goldenPattern = PATTERN_MAP[Number(patternId)];

    document.querySelectorAll('#normal-grid .card').forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');
    setAccordionState('normal-section', false);
    document.getElementById('merchants-container').classList.remove('hidden');

    renderCards(DATASETS.village.gridId,
        state.village.filter(item => item.patternId === patternId));
    renderCards(DATASETS.golden.gridId,
        goldenPattern === null
            ? []
            : state.golden.filter(item => item.patternId === String(goldenPattern)));

    setAccordionState('village-section', false);
    setAccordionState('golden-section', false);
}

function toggleAccordion(sectionId) {
    const section = document.getElementById(sectionId);
    const isExpanded = section.getAttribute('aria-expanded') === 'true';

    if (!isExpanded) {
        if (sectionId === 'normal-section') {
            setAccordionState('village-section', false);
            setAccordionState('golden-section', false);
        } else {
            setAccordionState(sectionId === 'village-section' ? 'golden-section' : 'village-section', false);
        }
        setTimeout(() => section.scrollIntoView({ behavior: 'smooth' }), 100);
    }

    setAccordionState(sectionId, !isExpanded);
}

function setAccordionState(sectionId, expand) {
    const section = document.getElementById(sectionId);
    section.setAttribute('aria-expanded', String(expand));
    section.querySelectorAll('.card').forEach(card => {
        card.tabIndex = expand ? 0 : -1;
    });
}

function registerEventHandlers() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => toggleAccordion(header.dataset.sectionId));
    });
}

window.addEventListener('DOMContentLoaded', () => {
    registerEventHandlers();
    init();
});
