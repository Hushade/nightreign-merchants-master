let normalData = [];
let villageData = [];
let goldenData = [];
let selectedPattern = null;

// CSVの読み込み関数 (PapaParse使用)
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
        console.error(`${filename} の読み込みに失敗しました:`, error);
        return [];
    }
}

// 初期化処理
async function init() {
    // 3つのファイルを並列で読み込み
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

// カードのレンダリング
function renderCards(containerId, data, clickHandler) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // クリア

    if (data.length === 0) {
        container.innerHTML = '<p>該当する商品がありません。</p>';
        return;
    }

    data.forEach((row) => {
        // row[0]: パターン番号, row[1]: 名前, row[2]: 詳細1, row[3]: 詳細2
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
        card.tabIndex = 0; // キーボード操作可能に
        
        // 今後の画像実装のためのプレースホルダー
        card.innerHTML = `
            <div class="card-content">
            <div class="card-main">
                <div class="card-image-placeholder">No Image</div>
                <div class="card-content">
                    <div class="card-title">${name}</div>
                    <div class="card-subtitle">${detail1}</div>
                </div>
            </div>
                <div class="card-desc">${detail2Html}</div>
            </div>
        `;

        // クリックまたはEnterキーで選択
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

// NormalMerchants選択時の処理
function handleNormalSelection(patternId, selectedCard) {
    selectedPattern = patternId;

    // 選択状態のUI更新
    document.querySelectorAll('#normal-grid .card').forEach(c => c.classList.remove('selected'));
    selectedCard.classList.add('selected');

    // Normalセクションを折りたたむ
    setAccordionState('normal-section', false);

    // VillageとGoldenのセクションを表示し、データをフィルタリングして描画
    document.getElementById('merchants-container').classList.remove('hidden');
    
    // パターン番号によるフィルタリング
    const filteredVillage = villageData.filter(row => row[0] === selectedPattern);
    const filteredGolden = goldenData.filter(row => row[0] === selectedPattern);

    renderCards('village-grid', filteredVillage, () => {});
    renderCards('golden-grid', filteredGolden, () => {});

    // 両方の派生セクションを一旦閉じた状態にする（ユーザーに選択させるため）
    setAccordionState('village-section', false);
    setAccordionState('golden-section', false);

    // スムーズなスクロール
    document.getElementById('merchants-container').scrollIntoView({ behavior: 'smooth' });
}

// アコーディオンの開閉トグル
function toggleAccordion(sectionId) {
    const section = document.getElementById(sectionId);
    const isExpanded = section.getAttribute('aria-expanded') === 'true';
    
    // 開く場合は、他の派生セクションを閉じる（排他的アコーディオン）
    if (!isExpanded) {
        if (sectionId === 'village-section') setAccordionState('golden-section', false);
        if (sectionId === 'golden-section') setAccordionState('village-section', false);
    }
    
    setAccordionState(sectionId, !isExpanded);
}

// アコーディオンの状態設定
function setAccordionState(sectionId, expand) {
    const section = document.getElementById(sectionId);
    section.setAttribute('aria-expanded', expand);

    // 折りたたまれている時は内部のカードにフォーカスが当たらないようにする
    const cards = section.querySelectorAll('.card');
    cards.forEach(card => {
        if (expand) {
            card.setAttribute('tabindex', '0'); // 開いている時はフォーカス可能
        } else {
            card.setAttribute('tabindex', '-1'); // 閉じている時はフォーカス不可（スキップされる）
        }
    });
}

// アプリケーション開始
window.addEventListener('DOMContentLoaded', init);