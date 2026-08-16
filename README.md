# NIGHTREIGN MERCHANTS MASTER

このプロジェクトは、ゲーム内の「通常商人」から派生する「村の商人」「大空洞のレジェンド武器商人」の商品候補を、簡単に比較・確認できる静的サイトです。

## 1. プロジェクト名と概要

### プロジェクト名
NIGHTREIGN MERCHANTS MASTER

### 概要
本サイトは、ゲーム内の装備品や商人の関連商品を、カード形式で一覧表示し、ユーザーが「基本商品」を選択すると対応する派生商品を自動で絞り込み表示するためのWebツールです。

データは CSV から読み込まれるため、商品情報の更新や差し替えがしやすく、静的ページとして簡単に公開・運用できます。ユーザーは複数の候補を視覚的に見比べながら、欲しい商品や最適な組み合わせを調べることができます。

---

## 2. 主な機能・特徴

- 通常商人の商品一覧をカード形式で表示
- 1つの基本商品を選択すると、対応する村の商人・レジェンド商人の商品を自動で表示
- CSV データを読み込み、商品名・効果・派生パターンを柔軟に管理
- アコーディオン形式で各セクションを開閉できるUI
- レスポンシブデザインに対応し、PC / タブレット / スマートフォンで見やすく表示
- 画像読み込みの失敗時に代替表示を行うフォールバック処理
- キーボード操作に対応し、Enter / Space でカード選択可能
- バックエンド不要のため、GitHub Pages へのデプロイが容易

---

## 3. 実際のサイト

### GitHub Pages

https://hushade.github.io/nightreign-merchants-master/

## 4. 技術スタック

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- PapaParse
  - CSV をブラウザ上で簡単に解析するために利用
- CSS Variables / Responsive Grid
  - レイアウトと見た目の統一、レスポンシブ対応

利用している主なファイル:
- index.html
- css/style.css
- js/script.js
- data/NormalMerchants.csv
- data/VillageMerchants.csv
- data/GoldenMerchants.csv
- images/

---

## 5. 使い方・確認方法

1. 単に、NIGHTREIGN MERCHANTS MASTER を利用したいのであれば、本プロジェクトの GitHub Pages にアクセスします。
https://hushade.github.io/nightreign-merchants-master/
2. 画面上の「通常商人」のリストから通常の商品が売っているレア／ユニーク武器を選択します。
3. 選択後、対応する「村の商人」または「大空洞のレジェンド武器商人」の候補が表示されます。
4. リストを選択して、各商人の売っている武器を確認します。

> このサイトは `fetch()` で CSV ファイルを読み込んでいるため、ローカルファイルをそのままブラウザで直接開くと CORS 制約によりデータ取得に失敗することがあります。そのため、ローカル確認時は HTTP サーバーを起動して表示してください。

---

## 6. ディレクトリ構成

以下のような構成を想定しています。

```text
nightreign-merchants/
├── index.html               # メインのHTML
├── css/
│   └── style.css            # UIスタイル定義
├── js/
│   └── script.js            # CSV読み込み、カード生成、アコーディオン制御
├── data/
│   ├── NormalMerchants.csv  # 通常商人データ
│   ├── VillageMerchants.csv # 村の商人データ
│   └── GoldenMerchants.csv  # レジェンド商人データ
├── images/                  # 商品画像（PNG等）
├── LICENSE                  # MIT License
└── README.md                # このドキュメント
```

---

## 7. ライセンス

このプロジェクトは MIT License を採用しています。

詳細は [LICENSE](LICENSE) を参照してください。
