# 開発環境と検証手順

## 現在の実装

単一のExpo SDK 57・React Native・TypeScriptプロジェクト。Expo RouterのStackから、NativeWindとLucideを使う`PaperCard`を表示する。ブラウザStorybookも同じ部品を使う。地図選択・記録フォーム・写真保存・SQLite処理は未実装。HTMLモックは引き続き検討資料で、製品コードとは分離している。

既存のOxlint・Oxfmt・独自Lintルール・Vitest・依存方向検査・Lefthook・commitlintを引き継いだ。既存ルール・テストの緩和は行っていない。ネイティブStorybookも別入口として構築した。段階1全体の対応状況・実機検証・CIの残件は[段階1の一覧](stage-one-status.md)を参照する。

## 準備と共通チェック

Node **24.18.0**（`.node-version`）とpnpm **10.24.0**（`packageManager`）を使用する。Nodeは各自のバージョン管理ツールで切り替え、pnpmはCorepackなどで指定版を有効化する。リポジトリルートで実行する。

```bash
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm hooks:install
pnpm check
pnpm build-storybook
```

`pnpm check`はLint・整形・型チェック・Vitest・依存方向検査を順に実行する。`pnpm check:transforms`で変換テストのみを実行できる。フックは検査のみ。コミットは`type(scope): 絵文字 要約`形式に従う。

## アプリの起動とローカルDevelopment Build

Expo Goではなく`expo-dev-client`入りのDevelopment Buildを使用する。EASへの登録・クラウドビルド契約・アプリ用APIキーは不要。

- iOS：macOS、対応するXcode本体、Command Line Tools、CocoaPodsを準備する。実機はDeveloper Modeと署名チームの設定が必要。SDK 57の[環境要件](https://docs.expo.dev/versions/v57.0.0/)と[公式ローカルビルド手順](https://docs.expo.dev/guides/local-app-development/)を確認する。
- Android：Android Studio、SDK、JDKとエミュレーター、またはUSBデバッグを有効にした端末を準備する。`ANDROID_HOME`や`adb devices`で接続を確認する。

```bash
# MacでiOSシミュレーター向けに生成・ビルド・インストール
pnpm ios
# iPhone実機を選択（署名はXcode/Expoの案内に従う）
pnpm ios --device
# Androidエミュレーターまたは接続端末向け
pnpm android
# インストール済みDevelopment BuildへMetroを接続
pnpm start
```

`pnpm ios`・`pnpm android`は必要時にprebuildを行う。`pnpm prebuild`で生成だけを実行することもできる。`ios/`・`android/`は生成物としてGit管理しない。Androidでも明示したlight表示設定を反映するため、Expo対応版の`expo-system-ui`を導入している。ネイティブ変更はapp config・config pluginに反映し、生成ディレクトリだけに残さない。`--clean`は手動編集を消すため通常の起動には不要。

`app.config.ts`の`dev.tabilog.app`はローカル開発用のbundle identifier/package。ストア公開用識別子・署名・配布設定は未確定で、今回は設定しない。ネイティブ依存・app config・pluginを変えたらDevelopment Buildを再作成する。通常のTSX変更はMetro/Fast Refreshで確認できる。Babel・Metro・NativeWind設定を変えたら`pnpm start --clear`で再起動する。

## ブラウザStorybook

```bash
pnpm storybook
pnpm build-storybook
```

`Components/PaperCard`に通常文・長文の表示例がある。製品と同じReact Native部品をReact Native Webで描画する。`global.css`をpreviewで読み込み、PostCSS/TailwindでCSSを生成する。外部ホスティングは不要。`storybook-static/`は生成物でGit管理しない。

## ネイティブStorybook

```bash
pnpm storybook:native
# 必要に応じて端末へ既存Development Buildを開く
pnpm storybook:native --ios
pnpm storybook:native --android
# 製品/StorybookのAndroid/iOSバンドルを作り、入口の分離を検査
pnpm check:native-bundles
```

公式の`withStorybook`が開発時の入口を`.rnstorybook/index.ts`に差し替える。NativeWindのglobal.cssをこちらでも読み込む。LiteUIを使い、on-device addonや選択状態の保存は追加しない。Storybook本体の推移依存にはbottom-sheet等が含まれるが、MetroでフルUIのJSを除外する。推移peerで取得されたGesture HandlerはSDK 57対応版2.32.0に直接固定する。ブラウザ版と同じ`PaperCard.stories.tsx`を使う。製品ルートにはStorybookを追加しない。起動モード変更時は前のMetroを停止し、必要なら`--clear`でキャッシュを更新する。

`pnpm storybook:generate`で登録ファイルを生成する。`pnpm typecheck`も先に生成するため、fresh install後のCIでも型チェックできる。生成物はGit管理せず、手書きファイルのルールは維持する。

## NativeWindとReact Compiler

- Metro：`metro.config.cjs`の`withNativeWind`、Tailwind preset、`global.css`、`nativewind/babel`を使用する。pnpmの厳密な依存解決に対応するため、Babelの変換先`react-native-css-interop`も直接依存として固定する。
- Compiler：`experiments.reactCompiler: true`を設定。SDK 57の`babel-preset-expo`がCompilerを有効化し、React 19の`react/compiler-runtime`を使う。`babel-plugin-react-compiler`も1.0.0で固定する。
- NativeWindのBabel presetはReanimatedの互換入口からWorklets pluginを呼ぶ。Expo presetも対応するWorkletsを自動検出する。手作業で追加のMetro pluginを重ねない。
- Storybook：`@storybook/react-native-web-vite`の`pluginReactOptions`でautomatic JSXの`jsxImportSource: nativewind`を指定。Babel pluginはCompilerを先頭、Workletsを後に明示する。Metroのapp configやBabel presetがViteにも自動適用されるとは扱わない。
- 変換テストは実際の`PaperCard.tsx`を対象に、Metro callerでのBabel変換、Storybookと同じRNW/Vite plugin設定での開発・本番変換を行う。Compilerのキャッシュ生成、NativeWindのJSX runtime、Workletsのhash生成を検査する。OS上での実行を保証するテストではない。
- NativeWindの標準換算はネイティブが1rem=14、ブラウザが16px。今回のブラウザ確認では紙色`#fff9eb`、padding 24px、gap 12px、文字色、SVGアイコンを確認した。ネイティブの実際の文字サイズ・余白・読み上げは実機で確認する。

### 実際のMetro生成物の確認

JSを読み取る診断用として、リポジトリルートで実行する。

```bash
pnpm exec expo export --platform android --platform ios --source-maps --no-bytecode --no-minify --output-dir dist/metro --max-workers 2
```

`dist/metro/_expo/static/js/`の各プラットフォームのJSで`PaperCard`の`react.memo_cache_sentinel`・Compilerキャッシュ呼び出し・CSS interopのJSX呼び出しを確認する。生成されたNativeWindの`bg-paper`規則も確認する。source mapの`sources`には共通部品が含まれ、`.stories.`・`.storybook/`が含まれないことを確認する。診断用の`--no-bytecode`は配布ビルドには使わない。通常のJSエクスポートは`pnpm export:android`・`pnpm export:ios`でも実行できるが、ネイティブバイナリのビルドとは異なる。

## Codex cloud

各タスクは隔離済みのため既存チェックアウトを使用し、依頼なしにGit worktreeを作成しない。`AGENTS.md`と関連仕様を読み、作業ブランチで進める。

1. `bash scripts/cloud/prepare.sh`を実行する。Nodeの公式配布とSHA256、指定版pnpmで準備し、frozen install・native stories生成・hooks導入を行う。次のシェルでは`source /workspace/toolchains/tabi-log-env.sh`で有効化する。リポジトリ外にツール/キャッシュを置き、homeや追跡ファイルを変更しない。
2. `pnpm hooks:install`、`pnpm check`、`pnpm build-storybook`を実行する。
3. `pnpm check:native-bundles`で通常アプリとネイティブStorybookのAndroid/iOS JSエクスポートを検査する。CPUの過剰使用を避け、Metroは2 workersを基本とする。
4. Storybookの起動・表示検証はブラウザで行う。今回のクラウドでは`/usr/bin/chromium`とPlaywrightによる検証が可能だった。ブラウザの有無は環境ごとに確認する。

ユーザーのhomeが読み取り専用の環境では、npm/pnpmのキャッシュは書き込み可能な場所を指定する。Expo CLIの設定領域も必要なら、シェルから`__UNSAFE_EXPO_HOME_DIRECTORY=/workspace/.expo-user`を指定できる（SDK 57 CLIが提供する設定。`.env`やGit管理ファイルには保存しない）。通常の書き込み可能なhomeでは不要。クラウドでMetroを起動する場合、`EXPO_UNSTABLE_HEADLESS=1 pnpm start --offline --max-workers 2`を利用できる（Expo CLIのheadlessモード）。この環境では通常起動時にReact Native DevToolsの自動起動がChromium sandbox要件で失敗したが、headlessモードでは自動起動を抑制できる。Metroの配信には影響せず、ローカル開発のデバッガーを無効化する設定は追加していない。クラウドでネイティブビルドを行わない場合、Xcode・Android SDK・署名情報は要求しない。

依存取得に`registry.npmjs.org`、Nodeの取得には`nodejs.org`、公式ソース確認には`github.com`・`raw.githubusercontent.com`等へのアクセスが必要。検証時はExpoのオンライン照会先が通信制限により拒否されたため、`EXPO_OFFLINE=1`で同梱の`bundledNativeModules.json`を使った依存照合を行った。これはオンラインの最新情報検査ではない。プロキシとTLS検証を維持し、通信制限を無効化しない。アプリ自体の起動に秘密情報は不要。

## 検証結果と残件

2026-11-07、Codex cloudのLinuxで実行。

- `pnpm install --frozen-lockfile`成功。`pnpm check`成功（11ファイル、155テスト）。`pnpm build-storybook`成功。
- `expo prebuild --no-install --platform all`でiOS/Androidのネイティブプロジェクト生成を確認。これはバイナリのビルドではない。
- Development Build向けMetroの起動、Android向けmanifest応答と開発用JSの取得を確認。offlineモードではmanifest素材解決の警告が出たため、ネイティブのフォント・アイコン表示は未確認。
- 通常アプリ・ネイティブStorybookそれぞれのAndroid/iOS向けMetro JSエクスポート成功（計4ケース）。CompilerとNativeWindの生成物、製品へのStorybook混入防止を確認。
- ChromiumでStorybookの通常文・長文、スタイル、Lucide SVGを確認。Vite生成物にもCompilerのキャッシュ生成を確認。
- ネイティブバイナリのビルド、iPhone実機、Androidエミュレーター・実機、ネイティブUI・読み上げ・WorkletsのUIスレッド実行は未実施。
- GitHub Actionsのファイルは更新済み。既存3チェックのリモート成功を確認済み。今回追加するCIの結果と、必須チェック・マージ保護の適用は段階1一覧を参照。人がレビュー・マージを担当する。
- Storybookの開発用出力には大きなchunkの警告が出る。製品バンドルとは分離されており、警告を隠す閾値変更は行っていない。

## 固定版と公式情報

直接依存は`package.json`、推移依存は`pnpm-lock.yaml`で固定する。React/React NativeをExpoとは独立に最新版へ上げない。今回の主な確認元：

| 対象                                | 採用版                      | 公式の根拠・用途                                                                                                                                                                                                                |
| ----------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Expo / Router / dev-client          | 57.0.32 / 57.0.30 / 57.0.21 | [SDK 57の対応表](https://github.com/expo/expo/blob/sdk-57/packages/expo/bundledNativeModules.json)、ローカルDevelopment Build                                                                                                   |
| React / React DOM / RN              | 19.2.3 / 19.2.3 / 0.86.3    | 同対応表とRNの配布package.jsonのpeer/Node要件                                                                                                                                                                                   |
| Reanimated / Worklets               | 4.5.1 / 0.10.1              | 同対応表。Reanimated配布metadataはRN 0.83–0.86、Worklets 0.10.xを要求                                                                                                                                                           |
| safe-area / screens / SVG           | 5.7.0 / 4.26.0 / 15.15.4    | 同対応表。RouterのpeerとLucideのSVG 15対応を照合                                                                                                                                                                                |
| NativeWind / CSS interop / Tailwind | 4.2.7 / 0.2.7 / 3.4.19      | [公式v4ソース](https://github.com/nativewind/nativewind/tree/4.2)、[他バンドラーの条件](https://github.com/nativewind/nativewind/blob/4.2/apps/website/docs/getting-started/other-bundlers.md)、配布metadata。v5 RCは採用しない |
| Lucide                              | 1.70.0                      | [公式React Native導入案内](https://lucide.dev/guide/react-native/getting-started)、配布metadataのReact 19 / SVG 15のpeer                                                                                                        |
| React Compiler / Expo Babel preset  | 1.0.0 / 57.0.17             | [Expoの公式手順ソース](https://github.com/expo/expo/blob/sdk-57/docs/pages/guides/react-compiler.mdx)、[preset実装](https://github.com/expo/expo/blob/sdk-57/packages/babel-preset-expo/src/configs/expo.ts)                    |
| Storybook RNW Vite / RNW            | 10.6.6 / 0.21.2             | [公式フレームワーク](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite)、配布metadataのReact 19 / RNW 0.21 / Vite 7対応                                                                                |
| Vite / vite-plugin-rnw / Babel      | 7.3.1 / 0.0.11 / 7.29.13    | Storybookが使うRNW変換をテストでも直接使用。Babel 7系をExpoと揃え、Babel 8には上げない                                                                                                                                          |

公式Webドキュメントの一部は環境の通信制限により取得できなかったため、閲覧済みの根拠は公式GitHubソース・npmの公式配布metadata・インストール済みパッケージの実装を併用した。リンクの掲載だけを、そのWebページを今回取得できた証拠とは扱わない。

Androidの表示モード設定に必要な`expo-system-ui`は57.0.4で固定し、SDK 57対応表に合わせた。

ネイティブStorybookは`@storybook/react-native` / `@storybook/react-native-ui-lite` 10.7.1で固定。core Storybook 10.6.6はそのpeer範囲（^10.5.4）を満たす。[v10.7.1の公式導入手順](https://github.com/storybookjs/react-native/blob/v10.7.1/docs/docs/intro/getting-started/index.md)と入口差し替え実装を確認した。開発時のNativeWind JSX変換に必要な`@babel/plugin-transform-react-jsx` 7.29.7を直接依存として固定。`cross-env` 10.1.0でWindowsでも起動フラグを設定できる。
