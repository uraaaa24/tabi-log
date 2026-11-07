# 初期構築の作業計画

## 状態と目的

ユーザーの明示的な許可を受けてアプリ基盤を構築した。既存のLint・整形・型チェック・Vitest・独自Lint・Gitフック・CIを引き継ぎ、Expo Router、Development Build設定、NativeWind・Lucide共通部品、ブラウザStorybook、React Compilerを追加した。製品機能は今回の対象外。起動・固定版・検証結果は[開発手順](development.md)を参照。

目的は、ローカルとCodex cloudで合意済みの仕様に沿って作業し、同じコマンドで検証できる開発基盤を用意すること。製品機能の具体化が残る項目は[仕様書の案内](README.md)に残す。

## 構築範囲（計画と実施状況）

1. pnpm管理の単一Expo・TypeScriptプロジェクト。Expo SDK 57・NativeWind 4.2.7・Tailwind CSS 3を第一候補に、対応するReact・React Native・ネイティブ依存を確認して版を固定する。Node・pnpmの採用版とロックファイルも管理する。 React Compilerも導入・有効化し、採用するExpo・Reactに対応した版と設定を固定する。
2. 共通の小さな表示部品を用意し、NativeWind・Lucideの表示をネイティブとReact Native Web版Storybookで確認する。ブラウザ用に別の製品UIを作らない。
3. Vitestと共用サンプルデータの置き場所、Oxlint・Oxfmt・型チェックの設定。設定のためだけに振る舞いのないテストを増やさず、意味のある検証対象ができた時点でテストを追加する。
4. `pnpm check`と個別の検証コマンド。依存方向の検査も含める。Storybookの静的ビルドは別コマンドとする。
5. Lefthook。コミット時はステージ済みファイルのLint・整形確認、プッシュ時は全体チェック。フックで自動修正・自動ステージは行わない。
6. GitHub Actionsのワークフロー。PRで共通チェックとStorybookビルドを実行する。マージ前の必須チェックへの指定はリポジトリ設定も必要なため、設定ファイルの作成と実際の適用状況を分けて報告する。
7. リポジトリのAGENTS.mdと実行手順。仕様書への入口、依存方向、共通コマンド、人が意思決定する範囲、AIの完了条件を簡潔に案内する。
8. Development Buildのローカル手順と、Codex cloud向けの再現可能な準備・チェック手順。実機やクラウドで実施できていない確認は明記する。

## 作成・更新するファイルの目安

- package.json、pnpm-lock.yaml、TypeScript・Expo・Metro・NativeWind等の設定。
- src/appと共通表示部品、対象の近くに置くstories。
- ブラウザStorybook・Vitest・Oxlint・Oxfmt・Lefthookの設定。
- .github/workflows内のCI設定、AGENTS.md、起動・検証手順。
- 初期構築で検証したバージョンと結果を反映した既存仕様書。

具体的な設定ファイル名は採用バージョンの公式構成に合わせる。MVP機能の地図選択・記録フォーム・写真保存・SQLiteの業務処理は、後続段階で実装する。FlashListの正式採用は写真配置の検証後とし、この基盤構築のためだけには導入しない。

## 確認すること

- 初回の依存導入と、ロックファイルに沿った再導入ができる。
- Lint・整形確認・型チェック・用意済みテスト・依存方向の検査を共通コマンドで実行できる。テスト未作成ならその状態を明記し、アプリの動作検証済みとは扱わない。
- 同じ共通部品にスタイルとアイコンが反映され、ブラウザStorybookの静的ビルドが通る。
- React Compilerの依存と有効化設定だけでなく、共通部品が実際にコンパイルされることを確認する。NativeWind・Reanimated・Workletsとの併用、MetroとStorybook（Vite）の設定・変換結果をそれぞれ検証し、実機表示などの未実施項目は明記する。
- ローカルのGitフックとCIが共通の検証処理を呼ぶ。CI未実行・必須チェック未適用なら、その状態を明記する。
- ネイティブ表示・iPhone実機・Androidエミュレーター・Codex cloudについて、実施した検証と未実施の検証を区別する。

## 実施状況と残件

- 共通部品のMetro（Android/iOS）とStorybook（Vite）変換をテストで確認した。MetroのJSエクスポートとブラウザ表示も確認した。
- 初期構築のコード・設定・CI追加は実装済み。Xcode/Android SDKによるネイティブバイナリのビルド、実機・エミュレーター表示、ネイティブStorybookの入口は未実施。
- GitHub Actionsのリモート実行と必須チェックの指定は、人によるレビュー時に確認する。以下は初期調査時の記録を含む。

- 調査時のローカル環境はNode v26.0.0、pnpm 11.10.0。これは採用版の決定ではない。Expo・Storybook・Vitest等との互換性を確認し、プロジェクトで使用する版を固定する。
- xcode-selectの選択先はCommandLineTools。Xcode本体・Android Studio・SDK・署名・端末接続は別途確認が必要。
- GitHubリポジトリの権限、CIの実行、必須チェックの適用、Codex cloudの環境接続は未確認。ファイルを用意したことを、リモート設定・クラウド動作まで完了したという意味にしない。
- ストア公開・署名情報の登録・マージはこの初期構築の完了条件に含めない。
