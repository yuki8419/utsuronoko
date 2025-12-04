# -*- coding: utf-8 -*-
"""
執筆支援ツール：プロンプト生成スクリプト

設定資料を読み込み、執筆用のプロンプトを生成する。
"""

import os
from pathlib import Path

# プロジェクトのルートディレクトリ
ROOT_DIR = Path(__file__).parent.parent


def read_file(filepath: Path) -> str:
    """ファイルを読み込む"""
    if filepath.exists():
        return filepath.read_text(encoding="utf-8")
    return ""


def get_setting_summary() -> str:
    """設定資料の要約を取得"""
    setting_file = ROOT_DIR / "設定資料"
    content = read_file(setting_file)

    # 長すぎる場合は重要部分のみ抽出（必要に応じて調整）
    if len(content) > 5000:
        lines = content.split("\n")
        # コンセプト〜戦闘システムまでを抽出
        summary_lines = []
        in_section = False
        for line in lines:
            if "1. コンセプト" in line:
                in_section = True
            if in_section:
                summary_lines.append(line)
            if "6. 配下：十大主星" in line:
                break
        return "\n".join(summary_lines)
    return content


def get_character_info(character_names: list[str]) -> str:
    """指定キャラクターの情報を取得"""
    result = []

    char_dir = ROOT_DIR / "characters"
    files = ["主人公.md", "十大主星.md", "十二大従星.md", "敵キャラ.md"]

    for filename in files:
        filepath = char_dir / filename
        content = read_file(filepath)

        for name in character_names:
            if name in content:
                # キャラクター名が含まれるセクションを抽出
                lines = content.split("\n")
                in_section = False
                section_lines = []

                for line in lines:
                    if f"## {name}" in line or f"### {name}" in line:
                        in_section = True
                        section_lines = [line]
                    elif in_section:
                        if line.startswith("## ") or line.startswith("---"):
                            break
                        section_lines.append(line)

                if section_lines:
                    result.append("\n".join(section_lines))

    return "\n\n".join(result)


def get_previous_summary(episode_num: int) -> str:
    """前話のあらすじを取得"""
    if episode_num <= 1:
        return "（第1話のため前話なし）"

    prev_num = episode_num - 1
    summary_file = ROOT_DIR / "plot" / "summaries" / f"{prev_num:03d}.md"
    content = read_file(summary_file)

    if content:
        return content
    return f"（第{prev_num}話のあらすじが未作成）"


def get_rules() -> str:
    """ルール類を取得"""
    rules_dir = ROOT_DIR / "rules"
    result = []

    for filepath in rules_dir.glob("*.md"):
        content = read_file(filepath)
        if content:
            result.append(f"### {filepath.stem}\n{content}")

    return "\n\n".join(result)


def generate_writing_prompt(
    episode_num: int,
    episode_title: str,
    episode_plot: str,
    characters: list[str],
    target_length: int = 4500,
    include_rules: bool = True
) -> str:
    """執筆用プロンプトを生成"""

    prompt_parts = []

    # 1. 基本指示
    prompt_parts.append(f"""# 執筆指示

## 基本情報
- 作品名：時空を統べる者
- 話数：第{episode_num}話「{episode_title}」
- 目標文字数：約{target_length}字

## 今回のプロット
{episode_plot}
""")

    # 2. 設定要約
    prompt_parts.append(f"""
## 世界観設定（要約）
{get_setting_summary()}
""")

    # 3. 登場キャラクター情報
    if characters:
        char_info = get_character_info(characters)
        prompt_parts.append(f"""
## 登場キャラクター
{char_info}
""")

    # 4. 前話あらすじ
    prompt_parts.append(f"""
## 前話までのあらすじ
{get_previous_summary(episode_num)}
""")

    # 5. ルール（オプション）
    if include_rules:
        prompt_parts.append(f"""
## 参照ルール
{get_rules()}
""")

    # 6. 執筆注意事項
    prompt_parts.append("""
## 執筆注意事項
1. キャラクターの口調を設定通りに維持すること
2. 五行の相生相剋を矛盾なく描写すること
3. 冥界の力を使った場合は代償を描写すること
4. 前話との整合性を保つこと
5. なろう系らしいテンポの良さを意識すること

上記を踏まえて、第{episode_num}話の本文を執筆してください。
""".replace("{episode_num}", str(episode_num)))

    return "\n".join(prompt_parts)


def generate_summary_prompt(episode_num: int, episode_content: str) -> str:
    """あらすじ生成用プロンプトを生成"""

    template_file = ROOT_DIR / "plot" / "summaries" / "_template.md"
    template = read_file(template_file)

    return f"""# あらすじ作成指示

以下の第{episode_num}話の本文を読み、あらすじを作成してください。

## 本文
{episode_content}

## 出力フォーマット
{template}

上記フォーマットに従って、あらすじを作成してください。
"""


def generate_consistency_check_prompt(episode_num: int, episode_content: str) -> str:
    """整合性チェック用プロンプトを生成"""

    rules = get_rules()
    prev_summary = get_previous_summary(episode_num)

    return f"""# 整合性チェック指示

以下の第{episode_num}話の内容に矛盾がないかチェックしてください。

## チェック対象
{episode_content}

## 前話のあらすじ
{prev_summary}

## ルール
{rules}

## チェック項目
1. キャラクターの口調は設定通りか？
2. 五行の相生相剋に矛盾はないか？
3. 干支の組み合わせ効果は正しいか？
4. 冥界の力を使った場合、代償は描写されているか？
5. 前話との時系列・設定に矛盾はないか？
6. 新しい設定が出た場合、既存設定と矛盾しないか？

問題があれば指摘し、修正案を提示してください。
問題がなければ「整合性に問題なし」と回答してください。
"""


# ===== 実行例 =====
if __name__ == "__main__":
    # 使用例：第1話のプロンプト生成
    prompt = generate_writing_prompt(
        episode_num=1,
        episode_title="理を視る目",
        episode_plot="""
- 主人公の平穏な日常（短く）
- 師匠が突然、命刻を消す
- 家族が処刑される報せ
- 村人・元仲間による集団リンチ
- 九死に一生で能力覚醒
- 最初の十二大従星（シズメ）が現れる
- リンチ首謀者への蹂躙開始
        """,
        characters=["主人公", "シズメ"],
        target_length=4500
    )

    print("=" * 60)
    print("生成されたプロンプト")
    print("=" * 60)
    print(prompt)

    # プロンプトをファイルに保存
    output_file = ROOT_DIR / "tools" / "generated_prompt.txt"
    output_file.write_text(prompt, encoding="utf-8")
    print(f"\nプロンプトを保存しました: {output_file}")
