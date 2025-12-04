# -*- coding: utf-8 -*-
"""
対話式執筆支援ツール

コマンドラインから対話的にプロンプトを生成する。
"""

from generate_prompt import (
    generate_writing_prompt,
    generate_summary_prompt,
    generate_consistency_check_prompt,
    ROOT_DIR
)
from pathlib import Path


def input_multiline(prompt: str) -> str:
    """複数行入力を受け付ける（空行で終了）"""
    print(prompt)
    print("（入力後、空行を入力すると確定）")
    lines = []
    while True:
        line = input()
        if line == "":
            break
        lines.append(line)
    return "\n".join(lines)


def save_prompt(prompt: str, filename: str):
    """プロンプトをファイルに保存"""
    output_path = ROOT_DIR / "tools" / filename
    output_path.write_text(prompt, encoding="utf-8")
    print(f"\n保存しました: {output_path}")


def main_menu():
    """メインメニュー"""
    while True:
        print("\n" + "=" * 50)
        print("執筆支援ツール - メインメニュー")
        print("=" * 50)
        print("1. 執筆用プロンプトを生成")
        print("2. あらすじ生成用プロンプトを生成")
        print("3. 整合性チェック用プロンプトを生成")
        print("4. 終了")
        print("-" * 50)

        choice = input("選択してください (1-4): ").strip()

        if choice == "1":
            create_writing_prompt()
        elif choice == "2":
            create_summary_prompt()
        elif choice == "3":
            create_check_prompt()
        elif choice == "4":
            print("終了します。")
            break
        else:
            print("無効な選択です。")


def create_writing_prompt():
    """執筆用プロンプトを対話的に生成"""
    print("\n--- 執筆用プロンプト生成 ---")

    # 話数
    episode_num = int(input("話数を入力（数字のみ）: "))

    # タイトル
    episode_title = input("タイトルを入力: ")

    # プロット
    episode_plot = input_multiline("プロットを入力:")

    # 登場キャラクター
    chars_input = input("登場キャラクター（カンマ区切り）: ")
    characters = [c.strip() for c in chars_input.split(",") if c.strip()]

    # 文字数
    length_input = input("目標文字数（デフォルト4500）: ").strip()
    target_length = int(length_input) if length_input else 4500

    # ルール含めるか
    include_rules = input("ルール参照を含める？ (y/n, デフォルトy): ").strip().lower()
    include_rules = include_rules != "n"

    # 生成
    prompt = generate_writing_prompt(
        episode_num=episode_num,
        episode_title=episode_title,
        episode_plot=episode_plot,
        characters=characters,
        target_length=target_length,
        include_rules=include_rules
    )

    print("\n" + "=" * 50)
    print("生成完了！")
    print("=" * 50)

    # 保存
    save_prompt(prompt, f"prompt_ep{episode_num:03d}_writing.txt")

    # クリップボードにコピーするか確認
    show = input("プロンプトを表示しますか？ (y/n): ").strip().lower()
    if show == "y":
        print("\n" + prompt)


def create_summary_prompt():
    """あらすじ生成用プロンプトを対話的に生成"""
    print("\n--- あらすじ生成用プロンプト ---")

    episode_num = int(input("話数を入力（数字のみ）: "))

    # 本文の入力方法
    print("本文の入力方法を選択:")
    print("1. ファイルから読み込む")
    print("2. 直接入力する")
    method = input("選択 (1/2): ").strip()

    if method == "1":
        chapter_file = ROOT_DIR / "chapters" / f"{episode_num:03d}.md"
        if chapter_file.exists():
            episode_content = chapter_file.read_text(encoding="utf-8")
            print(f"読み込みました: {chapter_file}")
        else:
            filepath = input("ファイルパスを入力: ")
            episode_content = Path(filepath).read_text(encoding="utf-8")
    else:
        episode_content = input_multiline("本文を入力:")

    # 生成
    prompt = generate_summary_prompt(episode_num, episode_content)

    print("\n生成完了！")
    save_prompt(prompt, f"prompt_ep{episode_num:03d}_summary.txt")


def create_check_prompt():
    """整合性チェック用プロンプトを対話的に生成"""
    print("\n--- 整合性チェック用プロンプト ---")

    episode_num = int(input("話数を入力（数字のみ）: "))

    # 本文の入力方法
    print("本文の入力方法を選択:")
    print("1. ファイルから読み込む")
    print("2. 直接入力する")
    method = input("選択 (1/2): ").strip()

    if method == "1":
        chapter_file = ROOT_DIR / "chapters" / f"{episode_num:03d}.md"
        if chapter_file.exists():
            episode_content = chapter_file.read_text(encoding="utf-8")
            print(f"読み込みました: {chapter_file}")
        else:
            filepath = input("ファイルパスを入力: ")
            episode_content = Path(filepath).read_text(encoding="utf-8")
    else:
        episode_content = input_multiline("本文を入力:")

    # 生成
    prompt = generate_consistency_check_prompt(episode_num, episode_content)

    print("\n生成完了！")
    save_prompt(prompt, f"prompt_ep{episode_num:03d}_check.txt")


if __name__ == "__main__":
    main_menu()
