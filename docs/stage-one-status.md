# 段階1：開発環境・ハーネスの実施状況

初期構築計画の全項目を対象とする。製品機能の実装には進んでいない。コードを用意したことと、OS上の実行・リモート設定が確認できたことを区別する。

| 計画の項目                          | 実装・確認内容                                                                                                         | 残る確認                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1. 単一Expo/TypeScriptと固定版      | SDK 57、Router、Development Build、NativeWind、React Compilerを固定。frozen installとMetro変換を確認                   | iOSバイナリと実機                                                     |
| 2. 最小共通部品とStorybook          | PaperCardと同じstoriesをブラウザ・ネイティブで共有。LiteUIと公式の入口差し替えを導入                                   | ネイティブ表示はAndroid CI/実機で確認。JS生成だけでは完了扱いにしない |
| 3. Vitest・共用サンプル・品質設定   | 既存設定と139テストを維持。変換・バンドル境界のテストを追加。src/testingの架空表示例をStorybookとAndroidスモークで共有 | 製品ロジックのテストはその実装時に追加                                |
| 4. 共通チェック・依存方向           | pnpm checkにLint・整形・型・Vitest・依存方向を統合。型チェック時にnative stories登録を生成                             | なし（変更時に再実行）                                                |
| 5. Lefthook                         | pre-commitのLint/整形、commit-msg、pre-pushの全体チェックを維持                                                        | ローカルでもpnpm hooks:installを実行する                              |
| 6. GitHub Actions・必須チェック     | Qualityのcheck/storybook/commitlintはPR #1とマージ後mainで成功を確認。native-bundlesとAndroid実行CIを追加              | 新規ジョブの実行結果、mainへの必須チェック設定の適用                  |
| 7. AGENTSと実行手順                 | 既存ルールを維持し、ネイティブStorybook・クラウド準備・バンドル検査への案内を追加                                      | なし                                                                  |
| 8. ローカルDevelopment Buildとcloud | ローカルビルド手順、Node/pnpm準備スクリプトと再実行、iOS/Android JS生成、ブラウザ確認を用意                            | Mac/Xcode、iPhone、Android実機、端末上の読み上げ・Worklets実行        |

## ネイティブStorybook

- `pnpm storybook:native`で起動する。`package.json#main`は引き続き`expo-router/entry`。
- `STORYBOOK_ENABLED=true`の開発時だけ、公式`withStorybook`が入口を`.rnstorybook/index.ts`へ差し替える。アプリ内に開発画面や切り替えメニューは追加しない。
- `NODE_ENV=production`ではフラグが残っていてもwrapperを適用しない。
- `pnpm check:native-bundles`はフラグを両方のビルドで有効にした上で、製品・StorybookそれぞれのAndroid/iOS source mapを検査する。製品へのStorybook/stories混入、空出力、誤った入口、共通部品やLiteUIの欠落で失敗する。
- UIは公式LiteUIを使用し、on-device addonや選択状態の永続化は導入しない。ブラウザ用と別の製品UI、DB、ストレージ機能は追加しない。
- `.rnstorybook/storybook.requires.ts`は公式ツールの生成物。Git管理・手動編集・整形の対象外とし、`pnpm storybook:generate`またはnative Metro起動時に再生成する。手書きの設定・入口は通常のLint/型チェック対象。

## Androidの自動表示確認

`.github/workflows/android.yml`はローカルDevelopment Build相当のdebug APKをGradleで作成する。Linux runnerのKVMとAPI 36のエミュレーターを使用し、`pnpm check:android-ui`で以下を確認する。

1. APKをインストールし、通常アプリ向けMetroを起動する。
2. development-clientリンクから開き、共通部品のタイトル・本文をAndroidのUIツリーで確認する。
3. 別ポートでネイティブStorybookを起動し、同じ部品が表示されることを確認する。
4. 各表示のスクリーンショット・UI XML・Metro/logcatをCI artifactに保存する。起動したMetroだけを停止する。

実行には`adb`、起動済みエミュレーター、`android/app/build/outputs/apk/debug/app-debug.apk`が必要。既存のMetroが8081/8082で動いている場合は上書きせず失敗する。スクリプトは端末の`dev.tabilog.app`を再インストール・再起動するため、個人のデータが入った実機では使わず専用エミュレーターで実行する。

スクリーンショットは見た目のレビュー資料であり、ピクセル一致の受け入れ判定は追加していない。実機での文字サイズ・VoiceOver/TalkBack・指操作・WorkletsのUIスレッド実行は別の確認項目。

## 外部環境・権限による制約

- 現在のLinux cloudにXcode/iPhoneはなく、iOSネイティブビルドと実機表示は実行できない。Macで`pnpm ios --device`を行う。
- cloudに`/dev/kvm`がないため、Androidエミュレーターの高速実行を前提にしない。Android CIのホスト環境と、ローカルのAndroid Studioで検証する。
- GitHubのPR/checks/rulesetsの読み取りは可能だが、classic branch protectionの読み取りは`Resource not accessible by integration`（HTTP 403）。ユーザーのadmin表示と、連携トークンが使える管理権限は異なる。既存の保護設定を確認できない状態で置換しない。既存設定を置換しない追加方式のruleset作成もHTTP 403で拒否された。
- 必須チェックは`check`・`storybook`・`commitlint`・`native-bundles`・`android-smoke`を候補とし、新規CIの成功後にmainに適用する。設定を人が適用した場合も、適用済みかどうかを明記する。

段階1全体の完了は、必要なネイティブ表示と必須チェック設定まで確認して判断する。残件を文書化したことだけで完了とは扱わない。

## 環境設定の保存

cloud準備スクリプトは導入・再実行を確認済み。設定ドラフトへのinstall_script/start_skill保存は`draft_not_editable`で拒否され、最新ドラフトを再取得しても保存できなかった。適用案を[cloud-environment-config.json](cloud-environment-config.json)に保存した。PRをmainへマージ後、環境設定から新しいセットアップチャットを開き、この2フィールドを適用する。保存済み・公開済みとは扱わない。
