# 執筆支援ツール

## 概要

設定資料を自動で読み込み、生成AIに渡すプロンプトを作成するツール。

## ファイル構成

```
tools/
├── generate_prompt.py   # メインスクリプト
├── generated_prompt.txt # 生成されたプロンプト（出力）
└── README.md           # このファイル
```

## 使い方

### 1. 執筆用プロンプトの生成

```python
from generate_prompt import generate_writing_prompt

prompt = generate_writing_prompt(
    episode_num=1,                    # 話数
    episode_title="理を視る目",        # タイトル
    episode_plot="プロットの内容...",   # 今回のプロット
    characters=["主人公", "シズメ"],   # 登場キャラクター名
    target_length=4500,               # 目標文字数
    include_rules=True                # ルール参照を含めるか
)
```

### 2. あらすじ生成用プロンプト

執筆後、あらすじを自動生成するためのプロンプト。

```python
from generate_prompt import generate_summary_prompt

prompt = generate_summary_prompt(
    episode_num=1,
    episode_content="執筆した本文..."
)
```

### 3. 整合性チェック用プロンプト

書いた内容に矛盾がないかチェックするためのプロンプト。

```python
from generate_prompt import generate_consistency_check_prompt

prompt = generate_consistency_check_prompt(
    episode_num=1,
    episode_content="執筆した本文..."
)
```

## 実行方法

コマンドラインから直接実行すると、サンプルプロンプトが生成されます。

```bash
python generate_prompt.py
```

生成されたプロンプトは `generated_prompt.txt` に保存されます。

## 執筆フロー

```
1. generate_writing_prompt() でプロンプト生成
   ↓
2. 生成AIに投げて本文を執筆
   ↓
3. generate_consistency_check_prompt() で整合性チェック
   ↓
4. 問題があれば修正
   ↓
5. generate_summary_prompt() であらすじ生成
   ↓
6. あらすじを plot/summaries/XXX.md に保存
   ↓
7. 新設定があれば characters/*.md に追記
```

## カスタマイズ

### 設定要約の調整

`get_setting_summary()` 関数内で、抽出するセクションを調整できます。
現在は「コンセプト〜戦闘システム」までを抽出しています。

### キャラクター検索の改善

現在は単純な文字列マッチングです。
より精密な抽出が必要な場合は `get_character_info()` を修正してください。
