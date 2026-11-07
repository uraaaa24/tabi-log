# tabi-log の開発ルール

旅行の訪問履歴・写真・日記を端末内に保存する、個人用のオフラインモバイルアプリ。
pnpm管理の単一Expo・React Native・TypeScriptプロジェクトとして開発する。

## 仕様と判断

- 最初に [仕様書の入口](docs/README.md) と [技術構成](docs/technical-options.md) を読む。初期構築では [作業計画](docs/initial-setup-plan.md) も読む。
- 合意済みの方針に沿った実装詳細・修正は自律的に進める。仕様変更や未決定の方針は、選択肢・推奨案・影響を整理して人に確認する。
- 依頼の範囲を守り、未採用の技術や将来機能を先行導入しない。依存追加時は用途・互換性を確認し、版とロックファイルを更新する。
- React Compilerの導入・有効化は採用方針に含む。Expo・React、NativeWind・Reanimated・Workletsとの互換性と、Metro・Storybook（Vite）それぞれの変換結果を検証する。詳細は技術構成を参照する。
- `docs/mockups/` は画面検討資料。製品実装や永続化の動作見本として扱わない。
- レビュー・マージは人が担当する。

## 配置と依存方向

- `src/app/`：画面の入口・遷移。機能の処理を集中させない。
- `src/features/`：機能ごとのUI・処理。純粋な計算は `logic/` または `domain/` に配置する。
- `src/components/`：共通UI。SQLite・ファイル操作を直接呼ばない。
- `src/storage/`：SQLite・ファイル操作。純粋な計算処理からネイティブ機能・永続化を呼ばない。
- テスト・storiesは対象の近くに置き、`src/app/` 配下には置かない。架空の共用データ・画像は `src/testing/` に置く。
- ブラウザStorybookも製品と同じ部品を使い、別の製品UIを作らない。

## コマンド

Nodeは `.node-version`、pnpmは `package.json` の `packageManager` に合わせる。
コマンドの定義は `package.json` を参照する。

- `pnpm install --frozen-lockfile`：固定した依存を導入。
- `pnpm check`：Lint・整形確認・型チェック・Vitest・依存方向検査。
- `pnpm lint:fix` → `pnpm format`：Lintの自動修正後に整形。
- `pnpm hooks:install`：Lefthookを有効化。フックは検査のみとし、自動修正・自動ステージを行わない。

Expo・Storybookの初期構築では、アプリ依存と起動・ビルドコマンドを追加し、TypeScript設定をExpoに対応させて `src/` も型チェック対象に含める。Tailwind設定へNativeWindのpresetを追加し、CIにも `pnpm build-storybook` を追加する。既存のLint・整形・テスト設定は引き継ぐ。

## コードと例外

機械的なルールの詳細は [oxlint.config.ts](oxlint.config.ts)・[oxfmt.config.ts](oxfmt.config.ts)、独自ルールは `scripts/lint/` を参照する。
設定はTypeScriptの `defineConfig` 形式を維持し、ESLint・Prettierを併設しない。

- コンポーネントはアロー関数のブロック本体で `return` を明記する。通常関数はfunction宣言も許可し、コールバックの省略形も許可する。
- Props型は全体を `Readonly<…>` で包む。各項目を改行し、コンポーネントとの間に空行を入れる。独自のProps検査は `Props` で終わる型名が対象。外部で実際に必要になるまでProps型をexportしない。
- 戻り値型は推論を基本とし、保存・取得の境界や複雑な処理では明記する。exportしているだけでは明記を必須にしない。
- 型は `type`、型importは独立した `import type`、配列型は `T[]`・`readonly T[]`。名前付きexportを基本とし、ツールが必要とするdefault exportの例外はLint設定に従う。Expo Routerの画面は名前付きconstを末尾でdefault exportする。
- `const`を基本とし、`let`・`var`、引数への再代入とそのプロパティへの直接代入を禁止する。`Readonly`・`const`だけで深い不変性は保証されない。別名や変更メソッドを使って制約を回避しない。
- `let`が読みやすさ・性能のために必要な場合だけ、理由付きの局所例外を認める。禁止を回避するための不要なオブジェクトや複雑な `reduce` は作らない。
- Lint無効化は対象ルール名と `-- 具体的な理由` が必須。一括無効化や不要になった無効化コメントは禁止。`pnpm lint` は抑制コメントの事前検査も実行するため、Oxlint単体で代用しない。
- TypeScriptのエラー抑制は理由付きの `@ts-expect-error` のみ許可する。例外の必要性・理由の妥当性はレビューで確認する。

## 検証と完了報告

- コード・設定の変更では、必要なテストを追加・更新し、`pnpm check` を実行する。Storybook構築後は `pnpm build-storybook` も実行する。チェックを通すためにルール・テストを弱めない。
- 設定のためだけの空疎なテストを増やさず、データの整合性・失敗時の動作・独自検査など意味のある振る舞いを検証する。
- 仕様に影響する変更は関連文書も更新する。報告には変更内容・実行した検証と結果・未実施事項を記す。
- ネイティブ表示、iPhone実機、Androidエミュレーター、CI、必須チェック設定、Codex cloudでの確認は実施状況を区別する。静的チェック・Storybookビルドの成功を実機検証済み・公開準備完了とは扱わない。
