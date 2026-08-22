# NIGHTREIGN MERCHANTS MASTER

CSVで管理した商人データをもとに、基本商品選択から派生商品（村の商人／大空洞のレジェンド武器商人）を絞り込み表示する静的サイト。ビルドツール・フレームワークは使用せず、Vanilla JS + PapaParse のみで構成される。

## サイト

https://hushade.github.io/nightreign-merchants-master/


## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript（ビルドステップなし、npm等の依存管理なし）
- [PapaParse](https://www.papaparse.com/)（CDN経由で読み込み、CSVパース用）
- データソース: `data/*.csv`（商人ごとの商品データ）+ `data/asset-map.json`（商品名→画像ファイル名の対応表）

## ディレクトリ構成

```
nightreign-merchants-master/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   └── vendor/
│       └── papaparse.min.js   # PapaParse本体（自前ホスト、v5.6.0固定）
├── data/
│   ├── NormalMerchants.csv    # 通常商人
│   ├── VillageMerchants.csv   # 村の商人
│   ├── GoldenMerchants.csv    # 大空洞のレジェンド武器商人
│   └── asset-map.json         # 商品名 → 画像ファイル名
├── images/                    # 商品画像
├── tests/
│   └── test_fetch_images.py   # asset-map.json / CSV と images/ の整合性テスト
├── LICENSE
└── README.md
```

`docs/` フォルダは存在せず、`index.html` はリポジトリルート直下に置かれている。

## ローカルでの確認

`js/script.js` は CSV・JSON を `fetch()` で読み込むため、`index.html` を `file://` で直接開くと CORS 制約により読み込みに失敗する。ローカルHTTPサーバーを起動して確認すること。

```bash
python -m http.server 8000
# http://localhost:8000/ にアクセス
```

ビルドステップは存在しない。静的ファイルをそのまま配信する構成のため、上記以外の準備は不要。

## デプロイ

GitHub Pages を使用。公開元は `main` ブランチのルート直下（Settings → Pages）。CIワークフロー（GitHub Actions）は使用しておらず（`.github/` は `.gitignore` 対象)、`main` への push がそのまま本番反映される。

## データの追加・更新

商品を追加・変更する場合の手順:

1. 該当する `data/*.csv` を更新
2. 画像を `images/` に追加
3. `data/asset-map.json` に商品名→画像ファイル名のエントリを追加

追加後、画像が実際に取得可能かは以下でチェックできる。

```bash
python -m unittest tests.test_fetch_images
```

このテストはローカルHTTPサーバーを内部で起動し、`asset-map.json` とCSV内の商品名から導出される画像ファイルすべてに対して実際にリクエストを送り、取得可否を検証する。

## パターンID対応ロジック

`js/script.js` の `PATTERN_MAP` は、通常商人の `patternId`（CSVの1列目）から大空洞のレジェンド武器商人の `patternId` への対応表（配列インデックス→値）。値が `null` の位置は、対応するレジェンド商人が存在しないパターンを意味する。商人データの構造やパターン数を変更する場合、この配列との整合性を保つ必要がある。

## ライセンス

MIT License。詳細は [LICENSE](LICENSE) を参照。