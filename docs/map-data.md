# Phase2の日本地図データ

出典：**地球地図日本（国土地理院）**。GeoJSONへの変換・都道府県名とIDの付与：**dataofjapan/land**。

- 配布元：[dataofjapan/land](https://github.com/dataofjapan/land)
- 使用ファイル：[japan.geojson（固定コミット）](https://github.com/dataofjapan/land/blob/c686f194db009794b63b38585af060fbe1b0b304/japan.geojson)
- 元データ：[地球地図日本](https://www.gsi.go.jp/kankyochiri/gm_jpn.html)
- [配布元の利用条件・出典説明](https://github.com/dataofjapan/land/blob/c686f194db009794b63b38585af060fbe1b0b304/README.md)

配布元の説明は、非営利目的で出典の明記、営利目的では出典の明記に加え著作権者への利用報告を求めている。アプリ内は地図右上の設定から開く「地図について」に出典・加工表示・原典と利用条件へのリンクを載せる。地図面には表記を重ねない。**営利目的で配布する前に利用報告と当時の原典の条件を確認する**。Natural Earthや国土数値情報2026年版を採用したという意味ではない。

元GeoJSONのSHA256：`b2fa31a9ce37c006904a06b8afcaeaf5ceeff40ae365eca167e09fbfff052f00`。

加工は `scripts/build/japan-map.py`。座標を日本の縦長画面用に線形投影し、小数点以下2桁に丸め、SVGパスへ変換した。島の輪郭を含む全リングを残し、各県の最大面積リングの頂点平均を初期ピン位置とする。表示名や形状とは独立した `JP-01`〜`JP-47` を記録先の固定IDとし、都道府県コードと対応させた。

再生成は固定コミットのGeoJSONを `work/japan.geojson` に取得し、`python scripts/build/japan-map.py work/japan.geojson`、`pnpm format` を実行する。checksumが一致しない入力は拒否する。

47県の存在・IDと形状・座標の範囲はテストで検査する。元資料の作成時点に基づく地理表現であり、最新の境界を保証しない。境界線の精緻化、ピンと小さい県の実機での選択性、読み上げの到達性は段階4でも確認する。
