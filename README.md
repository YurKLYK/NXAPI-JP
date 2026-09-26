nxapi (日本語版)
===

[English README](README.en.md)

Nintendo Switch Online アプリおよび Nintendo みまもり Switch アプリの API にアクセスするための JavaScript ライブラリ・コマンドラインツール・Electron アプリです。Nintendo Switch のプレイ状況を Discord に表示したり、フレンドの通知をデスクトップで受け取ったり、イカリング2・ベルトープ (NookLink)・イカリング3・みまもり Switch のデータを取得・閲覧できます。

これは [samuelthomas2774/nxapi](https://github.com/samuelthomas2774/nxapi) の日本語ローカライズ版です。アプリの UI は既定で日本語表示になります。

[![Discord server](https://img.shields.io/discord/998657768594608138?color=5865f2&label=Discord)](https://discord.com/invite/4D82rFkXRv)

### 主な機能

- コマンドライン版と Electron アプリ版
- Nintendo Switch Online アプリ / Nintendo みまもり Switch アプリ向けの対話式ニンテンドーアカウントログイン
- Nintendo Switch Online アプリ API への自動ログイン
    - 既定では [nxapi-znca-api.fancy.org.uk](https://github.com/samuelthomas2774/nxapi-znca-api) の API を使用します。
    - 独自のサーバーを指定することもできます。
- Nintendo Switch のアカウント情報・フレンドリスト・ゲーム固有サービスの取得
- Nintendo Switch のプレイ状況を Discord Rich Presence として表示
    - サブアカウント経由、または任意の URL からプレイ情報を取得できます。
    - 自分のフレンドコード (または任意のフレンドコード) を表示できます。
    - すべてのタイトルに対応しており、2025年8月以降は追加設定なしで名前の横にタイトル名をフル表示できます。
    - スプラトゥーン3 では追加のプレイ情報を表示できます。
- フレンドのプレイ状況を通知
- [Electron アプリ] ゲーム固有サービスを開く
    - ブラウザーでは動作しない (独自の JavaScript API を必要とする) ベルトープにも対応しています。
- Nintendo Switch Online アプリ API のプロキシサーバー / プレゼンスサーバー
    - 1つのアカウントで複数ユーザーのプレイ情報を取得できます。
    - Nintendo のサーバーへのリクエストを減らすため、データは短時間キャッシュされます。
    - ニンテンドーアカウントのセッショントークンを渡すと認証を自動で処理します。ブラウザーやスクリプト、他のソフトウェアから API を利用しやすくなります。
- イカリング2・イカリング3 の個人データ (バトル結果・サーモンラン結果を含む) のダウンロード
- ベルトープの島の新聞のダウンロード、メッセージやリアクションの送信
- Nintendo みまもり Switch の利用記録のダウンロード

API ライブラリと型定義は JavaScript / TypeScript から利用できるようにエクスポートされています。アプリやコマンドはアクセストークンを適切にキャッシュし、Nintendo 公式アプリとして見えるようにリクエストを処理しますが、ライブラリとして利用する場合はこれらを自分で扱う必要があります。[詳細](#typescriptjavascript-ライブラリとしての利用)

Discord プレゼンス                  | スプラトゥーン3 の追加情報        | フレンド通知
------------------------------------|-----------------------------------|-----------------------------------
![スプラトゥーン2 が Discord のアクティビティとして表示されているスクリーンショット](resources/discord-activity.png) | <img src="resources/discord-activity-splatoon3.png" alt="スプラトゥーン3 がイカリング3 の情報付きで Discord のアクティビティとして表示されているスクリーンショット" width="308"> | ![プレイ状況の通知のスクリーンショット](resources/notification.png)

#### Electron アプリ

nxapi には Electron アプリが含まれており、[こちら](https://github.com/samuelthomas2774/nxapi/releases)からダウンロードできます。アプリでは次のことができます。

- ニンテンドーアカウントへのログイン (Nintendo Switch Online アプリ / みまもり Switch アプリの両方)
    - Nintendo 公式アプリと同じように、アプリ内でニンテンドーアカウントのログインページが開きます。
    - アカウント追加時に <kbd>Shift</kbd> を押しながらクリックすると、認可ページをブラウザーで開けます。
    - アカウントはコマンドライン版の nxapi と共有されます。
- Nintendo Switch のプレイ状況を Discord に共有
    - 任意のプレゼンス URL やフレンドのプレイ情報を使用できます。
    - ログイン中のユーザー自身のプレイ情報は API から取得できなくなったため利用できません ([#1](https://github.com/samuelthomas2774/nxapi/issues/1))。
- フレンドのプレイ状況の通知
    - 複数のユーザーを選択できます。
- ゲーム固有サービスへのアクセス
    - アプリ内で開かれます。

![アプリのスクリーンショット](resources/app.png)

![イカリング2 とベルトープを背後に開いたメニューバーアプリのスクリーンショット](resources/menu-app.png)

アプリには `dist/bundle/cli-bundle.js` としてコマンドライン版の nxapi も含まれています。

```sh
# macOS
Nintendo\ Switch\ Online.app/Contents/bin/nxapi

# Linux (dpkg でインストールした場合)
# /usr/bin/nxapi にリンクされます
/opt/Nintendo\ Switch\ Online/bin/nxapi
```

Windows では Node.js を別途インストールする必要があります。

```powershell
# PowerShell
node $env:LOCALAPPDATA\Programs\nxapi-app\resources\app\dist\bundle\cli-bundle.js ...

# コマンドプロンプト
node %localappdata%\Programs\nxapi-app\resources\app\dist\bundle\cli-bundle.js ...
```

#### Nintendo Switch Online の加入は必要ですか？

いいえ。

必要なのは、ニンテンドーアカウントがネットワークサービスアカウントと連携していること (＝過去に一度でも Nintendo Switch 本体とアカウントを連携したことがあること) だけです。現在どの本体とも連携していなくても問題ありません。

ただし、ゲーム固有サービスを利用する場合はオンライン加入 (無料体験でも可) が必要です。イカリング2 は加入していなくても利用できますが、ベルトープとスマちしきは開くだけでも加入が必要です。

みまもり Switch のデータについては、本体との連携は不要です。ただし本体をアカウントに追加する操作は nxapi では対応しておらず、Nintendo 公式アプリで行う必要があります (追加しないとみまもり Switch の API はほとんど役に立ちません)。

#### Linux で Electron アプリが Discord に接続できません

インストール方法によっては、Electron アプリや Discord、あるいはその両方がサンドボックス化されています。

nxapi の dpkg 版と AppImage 版はサンドボックス化されていません。Discord 公式の dpkg 版と tar 版もサンドボックス化されていません。

nxapi と Discord の snap 版はサンドボックス化されており、Discord Rich Presence には対応できません。

Flatpak 版の Discord はサンドボックス化されていますが、IPC ソケットをアプリディレクトリの外にリンクすることで利用できます: https://github.com/flathub/com.discordapp.Discord/wiki/Rich-Precense-(discord-rpc)

#### これを使うと Nintendo Switch 本体は BAN されますか？

いいえ。

#### ニンテンドーアカウント / ネットワークサービスアカウントは BAN されますか？

その可能性は極めて低いです。

- 他のプロジェクト (splatnet2statink、splatoon2.ink など) が同じ解析済み API を長年使っていますが、それが原因で BAN された人はいません。splatnet2statink のモニタリングモードは既定で5分ごとに更新しますが、nxapi のモニタリング系コマンド (Discord プレゼンス、フレンド通知、イカリング2 / イカリング3 のモニタリング) は1分ごとと少し高頻度なだけで、リスクは大きく変わりません。
- 本体 BAN と違い、アカウント BAN は購入済みのデジタルコンテンツやオンラインサービスへのアクセスを失うことになります。
- アプリの通信を観察すること自体を Nintendo が止めることはできません。この解析に必要なのはそれだけです。

Discord Rich Presence にはサブアカウントが必要で、メインアカウントでログインする必要はありません。

> [!CAUTION]
>
> **2023年9月8日の追記**
>
> Nintendo は少数のユーザーのイカリング3 へのアクセスを禁止しました。対象ユーザーへの通知は行われていません。これは nxapi とは無関係の、あるアプリケーションの利用者のみで確認されています。
>
> イカリング3 は `401 Unauthorized` (`ERROR_INVALID_GAME_WEB_TOKEN`、公式アプリではリトライを繰り返します) を返します。BAN されたユーザー向けの専用エラーメッセージはありません。他の Nintendo のサービスには影響ありません。
>
> Discord Rich Presence のためだけに nxapi を使っている場合、nxapi はメインアカウントでプレイ情報を取得しないため、メインアカウントは安全です。nxapi はメインアカウントのプレイ情報を取得するためにサブアカウントを使うので、仮にサブアカウントが BAN されても作り直すだけで済みます。
>
> 詳細:
>
> - https://tkgstrator.work/article/2023/09/announcement.html
> - https://github.com/frozenpandaman/s3s/issues/146

#### なぜ Nintendo 以外のサーバーにデータを送信するのですか？

Nintendo に対して本物の Nintendo Switch Online アプリを使っていると認識させるためのデータ生成が必要で、現状それをローカルで行うのは困難だからです (みまもり Switch のデータ取得では不要です)。詳しくは下記の [Coral クライアント認証](#coral-クライアント認証)を参照してください。

#### nxapi や Nintendo の API について助けが欲しい / 作ったものを共有したい

このプロジェクト用の Discord サーバーがあります。Nintendo のスマートデバイス向けアプリ API に興味がある方なら、このプロジェクトに関心がなくても歓迎です。

Nintendo のスマートデバイス API を使って何かを作っている場合、Nintendo のアプリの更新情報は [#nintendo-app-versions](https://discord.com/channels/998657768594608138/998659415462916166) に投稿されます。

招待リンク: https://discord.com/invite/4D82rFkXRv

### インストール

#### npm でインストール

Node.js と npm が必要です。

```sh
# registry.npmjs.com から
npm install --global nxapi

# gitlab.fancy.org.uk から
npm install --global --registry https://gitlab.fancy.org.uk/api/v4/packages/npm/ @samuel/nxapi

# npm.pkg.github.com から
npm install --global --registry https://npm.pkg.github.com @samuelthomas2774/nxapi

# gitlab.com から
npm install --global --registry https://gitlab.com/api/v4/packages/npm/ @samuelthomas2774/nxapi
```

#### ソースからインストール

Node.js と npm が必要です。

> [!NOTE]
> ソースからビルドした場合、f 生成 API の利用に必要な nxapi-auth のクライアント識別子が含まれません。https://nxapi-auth.fancy.org.uk/oauth/clients でスコープ `ca:gf ca:er ca:dr` のテスト用 OAuth クライアントを登録し、クライアント ID を [nxapi が読み込む `.env` ファイル](#環境変数)に `NXAPI_AUTH_CLIENT_ID` として設定してください。これはコマンドラインと Electron アプリの両方で使用されます。Coral API を直接利用する場合のみ必要で、Coral API を使わない場合や `CoralApi` の代わりに `ZncProxyApi` を使う場合は不要です。

```sh
# nxapi は現在の git リビジョンを参照するため、アーカイブではなく clone してください
git clone https://github.com/YurKLYK/NXAPI-JP.git
cd NXAPI-JP

# CLI / Electron アプリをローカルにインストール
npm install
npx tsc

# CLI
# 以下のコマンドで nxapi コマンドをグローバルにインストールします
# node bin/nxapi.js ... でも実行できます
npm link

# Electron アプリ
npx rollup --config
# nxapi app または node bin/nxapi.js app で起動します

# Docker イメージのビルド
docker build . --tag registry.fancy.org.uk/samuel/nxapi
# # Docker で実行
# docker run -it --rm -v ./data:/data registry.fancy.org.uk/samuel/nxapi ...
```

### 使い方

コマンドラインインターフェイスの詳細は [docs/cli.md](docs/cli.md) を参照してください。

以下の内容は Electron アプリとコマンドラインの両方に関係します。一部の環境変数はライブラリとして利用する場合にも使われます。

#### データの保存場所

データは既定で OS ごとのローカルデータ領域の `nxapi-nodejs` ディレクトリに保存されます。

```sh
# ./data に保存する
nxapi --data-path ./data ...
NXAPI_DATA_PATH=`pwd`/data nxapi ...
```

プラットフォーム   | 既定のパス
----------------|----------------
macOS           | `Library/Application Support/nxapi-nodejs`
Windows         | `%localappdata%\nxapi-nodejs\Data`
Linux           | `$XDG_DATA_HOME/nxapi-nodejs` または `.local/share/nxapi-nodejs`

nxapi はアップデート情報や設定データのキャッシュも保存します。この場所は変更できません。

プラットフォーム   | キャッシュのパス
----------------|----------------
macOS           | `Library/Caches/nxapi-nodejs`
Windows         | `%localappdata%\nxapi-nodejs\Cache`
Linux           | `$XDG_CACHE_HOME/nxapi-nodejs` または `.cache/nxapi-nodejs`

Electron アプリはこれ以外の場所にもデータを保存します。

#### デバッグログ

ログ出力には [debug](https://github.com/debug-js/debug) パッケージを使用しており、`DEBUG` 環境変数で制御できます。nxapi のログは `nxapi`・`cli`・`app` の名前空間を使用します。

```sh
# nxapi のデバッグログをすべて表示
DEBUG=nxapi:*,cli,cli:* nxapi ...

# Electron アプリを起動してデバッグログをすべて表示
DEBUG=nxapi:*,app,app:* nxapi app
DEBUG=nxapi:*,app,app:* .../Nintendo\ Switch\ Online.app/Contents/MacOS/Nintendo\ Switch\ Online

# API リクエストをすべて表示
DEBUG=nxapi:api:* nxapi ...

# すべてのデバッグログを表示
DEBUG=* nxapi ...
```

既定では、ログはプラットフォームごとの場所にも書き出されます。

プラットフォーム   | ログのパス
----------------|----------------
macOS           | `Library/Logs/nxapi-nodejs`
Windows         | `%localappdata%\nxapi-nodejs\Log`
Linux           | `$XDG_STATE_HOME/nxapi-nodejs` または `.local/state/nxapi-nodejs`

これはコマンドラインと Electron アプリのみに適用され、`NXAPI_DEBUG_FILE` に `0` を設定すると無効化できます。プロセスごとに新しいファイルへ書き込まれ、14日より古いログファイルは自動的に削除されます。

nxapi のログにはニンテンドーアカウントのアクセストークンなどの機密情報が含まれる場合があります。

#### 環境変数

一部のオプションは環境変数で設定できます。これらはデータ保存場所の `.env` ファイルに保存できます。既定の場所の `.env` ファイル、続いて `NXAPI_DATA_PATH` の `.env` ファイルが読み込まれます。`--data-path` オプションで指定した場所の `.env` ファイルは読み込まれません。

これは Electron アプリ (パッケージ版を含む) でも利用できます。

nxapi を TypeScript / JavaScript ライブラリとして使う場合、nxapi 自身はデータを保存せず `.env` ファイルも読み込みませんが、環境変数は引き続き使用されます。ファイルから環境変数を読み込みたい場合は [dotenv](https://github.com/motdotla/dotenv) と [dotenv-expand](https://github.com/motdotla/dotenv-expand) を使うか、プロセス起動前に `source .env` を実行してください。

環境変数                          | 説明
--------------------------------|-------------
`NXAPI_DATA_PATH`               | ユーザーデータの保存場所を設定します。[データの保存場所](#データの保存場所)を参照。
`ZNC_PROXY_URL`                 | nxapi の znc API プロキシサーバーの URL を設定します。[API プロキシサーバー](docs/cli.md#api-proxy-server)を参照。
`NXAPI_ZNCA_API`                | Coral クライアント認証に使う API を設定します (`flapg` または `imink`)。[Coral クライアント認証](#coral-クライアント認証)を参照。
`ZNCA_API_URL`                  | `NXAPI_ZNCA_API` が未設定の場合に、Coral クライアント認証で使う znca API サーバーの URL を設定します。https://gitlab.fancy.org.uk/samuel/nxapi-znca-api または https://github.com/samuelthomas2774/nxapi-znca-api を参照。
`NXAPI_USER_AGENT`              | nxapi コマンドが使うアプリケーション / スクリプトのユーザーエージェント文字列を設定します。[ユーザーエージェント文字列](#ユーザーエージェント文字列)を参照。
`NXAPI_ENABLE_REMOTE_CONFIG`    | `0` を設定するとリモート設定データの取得と利用を無効化します。一度有効な状態で実行した後に無効化しないでください。
`NXAPI_REMOTE_CONFIG_FALLBACK`  | `1` を設定すると、リモート設定データを取得できない場合にローカルの設定データを使用します。新しいリモート設定から古いローカル設定へ戻ってしまう可能性があるため、使用は推奨されません。
`NXAPI_CONFIG_URL`              | リモート設定データの取得先 URL を設定します。
`NXAPI_SKIP_UPDATE_CHECK`       | `1` を設定すると nxapi コマンドと Electron アプリのアップデート確認を無効化します。
`NXAPI_SPLATNET3_UPGRADE_QUERIES` | イカリング3 クライアントが永続クエリ ID を新しいバージョンへ更新する条件を設定します。`0` は更新しない (非推奨)、`1` は破壊的変更を含まない場合のみ更新 (`0` と同様に古いクエリが送信されるため非推奨)、`2` は更新するが破壊的変更を含むリクエストは拒否、`3` は破壊的変更を含んでいてもすべて更新 (既定)。
`NXAPI_SPLATNET3_STRICT`        | `0` を設定するとイカリング3 GraphQL API のエラーの厳密な処理を無効化します。`1` (既定) の場合、レスポンスに結果が含まれていてもエラーが含まれていればリクエストは拒否されます。
`NXAPI_ZNCA_API_CLIENT_ID`      | f 生成 API で既定以外の nxapi-auth クライアント識別子を使用します。開発用途では `NXAPI_AUTH_CLIENT_ID` で既定のクライアントを設定できます。
`NXAPI_ZNCA_API_CLIENT_SECRET`  | 既定以外のクライアントで必要な場合に、f 生成 API で使うクライアントシークレットを設定します。
`NXAPI_ZNCA_API_CLIENT_ASSERTION` | 必要な場合に f 生成 API で使うクライアントアサーションを設定します。アサーションにはクライアント識別子が含まれるため、`NXAPI_ZNCA_API_CLIENT_ID` の設定は不要です。
`NXAPI_ZNCA_API_CLIENT_ASSERTION_TYPE` | クライアントアサーションの種類が `urn:ietf:params:oauth:client-assertion-type:jwt-bearer` でない場合に設定します。
`NXAPI_ZNCA_API_AUTH_SCOPE`     | f 生成 API で使う nxapi-auth のスコープを設定します。通常は設定不要です。開発用途では `NXAPI_AUTH_SCOPE` で既定のスコープを設定できます。
`DEBUG`                         | [debug](https://github.com/debug-js/debug) パッケージが使用します。デバッグログを有効にするモジュールを設定します。[デバッグログ](#デバッグログ)を参照。
`NXAPI_DEBUG_FILE`              | `0` を設定するとデバッグログのファイル出力を無効化します。

Node.js・Electron・nxapi が依存する他のパッケージが使う環境変数も利用される場合があります。

#### ユーザーエージェント文字列

nxapi はスクリプトやライブラリとして利用できるため、imink・flapg などの Nintendo 以外の API へのリクエストで使うユーザーエージェント文字列を設定する方法がいくつか用意されています。ユーザーエージェントにはスクリプト / プログラムの名前とバージョン番号を必ず含めてください。オープンソースでない場合や (GitHub の検索などで) 見つけにくい場合は、連絡先も含める必要があります。

スクリプトなどから nxapi コマンドを使う場合は `NXAPI_USER_AGENT` 環境変数を使用してください。この環境変数は nxapi コマンドのみが使用し、Electron アプリやライブラリとして使う場合は無視されます。

```sh
export NXAPI_USER_AGENT="your-script/1.0.0 (+https://github.com/...)"
nxapi nso ...
```

TypeScript / JavaScript ライブラリとして使う場合は `addUserAgent` 関数を使用してください。

```ts
import { addUserAgent } from 'nxapi';

addUserAgent('your-script/1.0.0 (+https://github.com/...)');
```

package.json の情報を使うには `addUserAgentFromPackageJson` 関数が使えます。

```ts
import { addUserAgentFromPackageJson } from 'nxapi';

await addUserAgentFromPackageJson(new URL('../package.json', import.meta.url));
await addUserAgentFromPackageJson(path.resolve(fileURLToString(import.meta.url), '..', 'package.json'));
// "test-package/0.1.0 (+https://github.com/ghost/example.git)" が追加されます

await addUserAgentFromPackageJson(new URL('../package.json', import.meta.url), 'additional information');
// "test-package/0.1.0 (+https://github.com/ghost/example.git; additional information)" が追加されます
```

### TypeScript/JavaScript ライブラリとしての利用

nxapi は API ライブラリと型定義をエクスポートしています。

[docs/lib](docs/lib/index.md) と [src/exports](src/exports) を参照してください。

<a name="splatnet2statink-and-flapg"></a>

### Coral クライアント認証

Nintendo Switch Online アプリの API と Web サービスへの認証を自動化するため、既定で [nxapi-znca-api.fancy.org.uk](https://github.com/samuelthomas2774/nxapi-znca-api) を使用します。アプリの認証に必要なデータを生成するには、Nintendo が発行したアクセストークン (`id_token`) をこの API に送信する必要があります。この API は Android 端末上で Nintendo Switch Online アプリを動作させてこのデータを生成します。送信されるアクセストークンには認証済みニンテンドーアカウントに関する情報が含まれ、Nintendo Switch Online アプリや Web サービスへの認証に利用できます。

具体的には、送信されるトークンは JSON Web Token です。アプリへのログインに送信するトークンには[この情報](https://gitlab.fancy.org.uk/samuel/nxapi/-/wikis/Nintendo-tokens#nintendo-account-id_token)が含まれ有効期限は15分、Web サービスへのログインに送信するトークンには[この情報](https://gitlab.fancy.org.uk/samuel/nxapi/-/wikis/Nintendo-tokens#nintendo-switch-online-app-token)が含まれ有効期限は2時間です。

> v1.3.0 以降、既定で使用する API は作者のサーバーから取得され、nxapi を更新しなくても変更できます。

これが必要なのは Nintendo Switch Online アプリのデータのみです。Nintendo みまもり Switch のデータは、サードパーティ API にアクセストークンを送信せずに取得できます。

#### nxapi-auth による認証

2025年6月以降、[nxapi-znca-api.fancy.org.uk](https://github.com/samuelthomas2774/nxapi-znca-api) は nxapi-auth によるクライアント認証を必要とします。

Electron アプリ、npm でインストールした nxapi コマンド、Docker イメージを使う場合は何もする必要はありません。ソースからビルドする場合やライブラリとして使う場合は、https://nxapi-auth.fancy.org.uk/oauth/clients でクライアントを登録する必要があります。

> [!CAUTION]
> この API は変更される可能性があります。

```ts
import { setClientAuthentication, ClientAssertionProviderInterface } from 'nxapi';

// setClientAuthentication にはクライアント ID (と任意のシークレット) を持つオブジェクト、
// またはクライアントアサーションを返す関数を渡します
// `scope` は常に必須です (通常は `ca:gf ca:er ca:dr`)

// パブリッククライアント
setClientAuthentication({ id: '...', scope: 'ca:gf ca:er ca:dr' });

// コンフィデンシャルクライアント (クライアントシークレットを使用)
setClientAuthentication({ id: '...', secret: process.env.NXAPI_AUTH_CLIENT_SECRET, scope: 'ca:gf ca:er ca:dr' });

// コンフィデンシャルクライアント (クライアントアサーションを使用)
setClientAuthentication(new ExampleClientAssertionProvider());

class ExampleClientAssertionProvider implements ClientAssertionProviderInterface {
    scope = 'ca:gf ca:er ca:dr';

    async create(aud: string, exp = 60) {
        return { assertion: '...', type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer' };
    }
}
```

### 参考資料

参考リンクの一覧は [English README](README.en.md#resources) を参照してください。

### ライセンス

本家 nxapi と同じく AGPL-3.0-or-later です。詳細は [LICENSE](LICENSE) を参照してください。

本製品は Nintendo、Discord その他の企業とは関係ありません。すべての製品名・ロゴ・ブランドは各所有者に帰属します。本プログラムの利用は自己責任で行ってください。
