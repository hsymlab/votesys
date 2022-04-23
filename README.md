# ゼミ用投票システム

- index.html がメインファイル(投票画面)
- login.html がログイン用
- result.html が結果画面
- read_firebase.js はfirebase関連
- role_select.html で本日の役割を登録 (2021-09追加)
- login.js はログイン画面用のjsファイル
- vote.cssとvote.jsは投票画面用のcssとjsファイル
- result.cssとresult.jsは結果画面用のcssとjsファイル
- role_select.cssとrole_select.jsは役割登録画面用のcssとjsファイル (2021-09追加)
- utilslib.js が全体用のjsファイル
- index_old.html、vote_old.css、vote_old.jsについては動作に問題が無ければ削除して大丈夫です

## 作業履歴

- 2021/9/5 更新開始

## 研究室の3名での制作

vote 画面一人

result 画面一人

データベース構築一人

## `XXXX.html` ファイルの head 内の js ファイルの読み込み順序(← 移行は未完成)

必ず以下の順番で読み込んでください

1. `/read_firebase.js` ← これは firebase の設定を読み込むための js ファイル
1. `/utilslib.js` ← これは関数だけを置くための js ファイル
1. `/XXXX.js` ← 　ここの XXXX は読み込ませたい html ファイルの名前と一致、このファイルの中に特定ページの処理を書く

## 実現した機能

- メアド+パスワードで管理、firebase のアカウント管理機能に委託
- プレゼンターとファシリテータの要チェック項目をチェックしないと投票できない
- 自分に投票出来ない
- 同じ人に複数票入れられない
- 再投票できない(結果を見た後に投票内容を変更できない)
- 入力フォームの数の変更可(vote.jsのp_numとfg_numで変更可能)
- スマホでも投票可
- 当日のP, FGが誰なのかを覚えておき、
  - 投票内容の正しさを検証する (2021-09追加)
    - 当日のP, FGが誰なのかを、投票者（＝被投票者）に事前に自分の役割を登録してもらうことで、そのデータをもとに検証する。
  - 投票画面で、誰に投票すべきか表示する (2021-09追加)

## 使い方
### 一般

1. email, passwordでログインする。ブラウザにログイン情報が残っている場合はしなくてよい。
1. 自分の今回のゼミでの役割を登録する。(Presenter, Facilitator, 役割なし=Guest)
1. 全員が役割登録できたら、「全員がログイン完了」ボタンを押す。 (誰が押しても良いが、ゼミの参加者が誰なのかわかってる人が押すのがベター) 
1. 投票する。

※投票に参加する予定がない人も、ゼミでP / FGを担当した場合は、このシステムにログインし役割登録までは行ってください。途中でゼミを退席してしまう場合なども同様です。

### 異常時
- 間違えて役割を登録してしまった場合
  - firebaseから今日の役割を消去する or role_select.htmlに再アクセスする
- 間違えて「全員がログイン完了」ボタンを押した場合
  - firebaseから今日のlogin_completedを消去する。（ただし、completed: "OK"の部分を消すのではなく、「ドキュメントを削除」をしてください）
- 間違えて投票してしまった場合
  1. 誰が投票ミスをしたかを絞り込む
  1. firebaseから、今日のvote_dataの、ミスをした人による投票データを削除する

## `firestore`のデータ構造

```
voting-system-6d23d
  |-- vote_data (投票データのcollection)
  |     |-- day_timestamp (投票日のタイムスタンプごとにdocumentがある)
  |     |     |-- voters_id_1 (投票者のIDがkey)
  |     |     |     |-- voted_id_1 (被投票者のID)
  |     |     |     |     |-- role (被投票者の役割)
  |     |     |     |     |-- updated_at (投票データがアップデートされた時間)
  |     |     |     |     |-- vote_rank (何位か)
  |     |     |     |-- voted_id_2 (被投票者のID)
  |     |     |     |     |-- role (被投票者の役割)
  |     |     |     |     |-- updated_at (投票データがアップデートされた時間)
  |     |     |     |     |-- vote_rank (何位か)
  |     |     |     |-- . . .
  |     |     |     |-- . . .
  |     |     |-- voters_id_2
  |     |     |-- . . .
  |     |-- . . .
  |     |-- . . .
  |-- todays_participant (今日の参加者情報)
  |     |-- day_timestamp (投票日のタイムスタンプごとにdocumentがある)
  |     |     |-- name_1(出席者の名前がkey) : 最終ログインのタイムスタンプ
  |     |     |-- name_2
  |     |     |-- . . .
  |     |-- . . .
  |     |-- . . .
  |-- user_name (ユーザ名情報)
  |-- todays_role (今日の参加者の役割)
  |     |-- day_timestamp (投票日のタイムスタンプごとにdocumentがある)
  |     |     |-- name_1(出席者の名前がkey) : 役割名
  |     |     |-- name_2
  |     |     |-- . . .
  |-- login_completed (全員の役割提出が完了したかどうかのフラグ)
  |     |-- day_timestamp
  |     |     |-- completed (OK or 何も登録しない)
  |--

```

## to do list

- 

## 注意事項

− 研究室のメンバーが変わったら、<br>
- 新メンバーの皆さんにメールアドレスとパスワードを登録してもらう→firestoreのuser_nameに登録(user_nameを新年度用に更新する)<br>
- vote.jsのリストname_listを更新 ＆ result.jsとvote.jsの変数Yearの値を更新する
- PとFGの入力フォームの数はvote.jsのp_numとfg_numを変えることで変更可(多めに設定しても大丈夫です)
