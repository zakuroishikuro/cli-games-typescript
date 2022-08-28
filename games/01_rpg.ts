// [1]ヘッダーをインクルードする場所
import { _getch } from './stdio';
import { system } from './stdlib';

// [2]定数を定義する場所
const SPELL_COST = 3; // [2-1]呪文の消費MPを定義する

// [3]列挙定数を定義する場所

// [3-1]モンスターの種類を定義する
enum MonsterType {
  MONSTER_PLAYER, // [3-1-1]プレイヤー
  MONSTER_SLIME, // [3-1-2]スライム
  MONSTER_BOSS, // [3-1-3]魔王
  MONSTER_MAX, // [3-1-4]モンスターの種類の数
}

// [3-2]キャラクターの種類を定義する
enum CharacterType {
  CHARACTER_PLAYER, // [3-2-1]プレイヤー
  CHARACTER_MONSTER, // [3-2-2]モンスター
  CHARACTER_MAX, // [3-2-3]キャラクターの種類の数
}

// [3-3]コマンドの種類を定義する
enum CommandType {
  COMMAND_FIGHT, // [3-3-1]戦う
  COMMAND_SPELL, // [3-3-2]呪文
  COMMAND_RUN, // [3-3-3]逃げる
  COMMAND_MAX, // [3-3-4]コマンドの種類の数
}

// [4]構造体を宣言する場所

// [4-1]キャラクターの構造体を宣言する
type Character = {
  hp: number; // [4-1-1]HP
  maxHp: number; // [4-1-2]最大HP
  mp: number; // [4-1-3]MP
  maxMp: number; // [4-1-4]最大MP
  attack: number; // [4-1-5]攻撃力
  name: string; // [4-1-6]名前
  aa?: string; // [4-1-7]アスキーアート
  command?: number; // [4-1-8]コマンド
  target?: number; // [4-1-9]攻撃対象
};

// [5]変数を宣言する場所

// [5-1]モンスターのステータスの配列を宣言する
const monsters: Character[] = [
  // [5-1-1]MONSTER_PLAYER    プレイヤー
  {
    hp: 100, // [5-1-2]int hp                HP
    maxHp: 100, // [5-1-3]int maxHp             最大HP
    mp: 15, // [5-1-4]int mp                MP
    maxMp: 15, // [5-1-5]int maxMp             最大MP
    attack: 30, // [5-1-6]int attack            攻撃力
    name: 'ゆうしゃ', // [5-1-7]char name[4 * 2 + 1]  名前
  },

  // [5-1-8]MONSTER_SLIME スライム
  {
    hp: 3, // [5-1-9]int hp                HP
    maxHp: 3, // [5-1-10]int maxHp            最大HP
    mp: 0, // [5-1-11]int mp               MP
    maxMp: 0, // [5-1-12]int maxMp            最大MP
    attack: 2, // [5-1-13]int attack           攻撃力
    name: 'スライム', // [5-1-14]char name[4 * 2 + 1] 名前

    // [5-1-15]char aa[256] アスキーアート
    aa: ['／・Д・＼', '～～～～～'].join('\n'),
  },

  // [5-1-16]MONSTER_BOSS 魔王
  {
    hp: 255, // [5-1-17]int hp               HP
    maxHp: 255, // [5-1-18]int maxHp            最大HP
    mp: 0, // [5-1-19]int mp               MP
    maxMp: 0, // [5-1-20]int maxMp            最大MP
    attack: 50, // [5-1-21]int attack           攻撃力
    name: 'まおう', // [5-1-22]char name[4 * 2 + 1] 名前

    // [5-1-23]char aa[256] アスキーアート
    aa: ['　　Ａ＠Ａ', 'ψ（▼皿▼）ψ'].join('\n'),
  },
];

// [5-2]キャラクターの配列を宣言する
const characters: Character[] = [];

// [5-3]コマンドの名前を宣言する
const commandNames = [
  'たたかう', // [5-3-1]COMMAND_FIGHT 戦う
  'じゅもん', // [5-3-2]COMMAND_SPELL 呪文
  'にげる', // [5-3-3]COMMAND_RUN   逃げる
];

// [6]関数を宣言する場所

// [6-1]ゲームを初期化する関数を宣言する
function Init() {
  // [6-1-1]プレイヤーのステータスを初期化する
  characters[CharacterType.CHARACTER_PLAYER] = monsters[MonsterType.MONSTER_PLAYER];
}

// [6-2]戦闘シーンの画面を描画する関数を宣言する
function DrawBattleScreen() {
  // [6-2-1]画面をクリアする
  system('cls');

  // [6-2-2]プレイヤーの名前を表示する
  const player = characters[CharacterType.CHARACTER_PLAYER];
  console.log(player.name);

  // [6-2-3]プレイヤーのステータスを表示する
  console.log(`ＨＰ：${player.hp}／${player.maxHp}　ＭＰ：${player.mp}／${player.maxMp}`);

  // [6-2-4]1行空ける
  console.log();

  // [6-2-5]モンスターのアスキーアートを描画する
  const monster = characters[CharacterType.CHARACTER_MONSTER];
  console.log(monster.aa);

  // [6-2-6]モンスターのＨＰを表示する
  console.log(`（ＨＰ：${monster.hp}／${monster.maxHp}）`);

  // [6-2-7]1行空ける
  console.log();
}

// [6-3]コマンドを選択する関数を宣言する
async function SelectCommand() {
  // [6-3-1]プレイヤーのコマンドを初期化する
  const player = characters[CharacterType.CHARACTER_PLAYER];

  player.command = CommandType.COMMAND_FIGHT;

  // [6-3-2]コマンドが決定されるまでループする
  while (true) {
    // [6-3-3]戦闘画面を描画する関数を呼び出す
    DrawBattleScreen();

    // [6-3-4]コマンドの一覧を表示する
    for (let i = 0; i < CommandType.COMMAND_MAX; i++) {
      // [6-3-5]選択中のコマンドなら
      if (i == player.command) {
        // [6-3-6]カーソルを描画する
        process.stdout.write('＞');
      }
      // [6-3-7]選択中のコマンドでなければ
      else {
        // [6-3-8]全角スペースを描画する
        process.stdout.write('　');
      }

      // [6-3-9]コマンドの名前を表示する
      console.log(commandNames[i]);
    }

    // [6-3-10]入力されたキーによって分岐する
    switch (await _getch()) {
      case 'w': // [6-3-11]wキーが押されたら
        // [6-3-12]上のコマンドに切り替える
        player.command--;
        break;

      case 's': // [6-3-13]sキーが押されたら
        // [6-3-14]下のコマンドに切り替える
        player.command++;
        break;

      default: // [6-3-15]上記以外のキーが押されたら
        return; // [6-3-16]関数を抜ける
    }

    // [6-3-17]カーソルを上下にループさせる
    player.command = (CommandType.COMMAND_MAX + player.command) % CommandType.COMMAND_MAX;
  }
}

// [6-4]戦闘シーンの関数を宣言する
async function Battle(_monster: MonsterType) {
  // [6-4-1]モンスターのステータスを初期化する
  const monster = monsters[_monster];
  characters.push(monster);

  // [6-4-2]プレイヤーの攻撃対象をモンスターに設定する
  const player = characters[CharacterType.CHARACTER_PLAYER];
  player.target = CharacterType.CHARACTER_MONSTER;

  // [6-4-3]モンスターの攻撃対象をプレイヤーに設定する
  monster.target = CharacterType.CHARACTER_PLAYER;

  // [6-4-4]戦闘シーンの画面を描画する関数を呼び出す
  DrawBattleScreen();

  // [6-4-5]戦闘シーンの最初のメッセージを表示する
  console.log(`${monster.name}が　あらわれた！`);

  // [6-4-6]キーボード入力を待つ
  await _getch();

  // [6-4-7]戦闘が終了するまでループする
  while (true) {
    // [6-4-8]コマンドを選択する関数を呼び出す
    await SelectCommand(); // メモ：ここにもawait必要

    // [6-4-9]各キャラクターを反復する
    for (let i = 0; i < CharacterType.CHARACTER_MAX; i++) {
      // [6-4-10]戦闘シーンの画面を描画する関数を呼び出す
      DrawBattleScreen();

      const attacker = characters[i];
      const target = characters[attacker.target!];

      // [6-4-11]選択されたコマンドで分岐する
      switch (attacker.command) {
        case CommandType.COMMAND_SPELL: {
          // [6-4-22]呪文
          // [6-4-23]MPが足りるかどうかを判定する
          if (attacker.mp < SPELL_COST) {
            // [6-4-24]MPが足りないメッセージを表示する
            console.log('ＭＰが　たりない！');

            // [6-4-25]キーボード入力を待つ
            await _getch();

            // [6-4-26]呪文を唱える処理を抜ける
            break;
          }

          // [6-4-27]MPを消費させる
          attacker.mp -= SPELL_COST;

          // [6-4-28]画面を再描画する
          DrawBattleScreen();

          // [6-4-29]呪文を唱えたメッセージを表示する
          console.log(`${attacker.name}は　ヒールを　となえた！`);

          // [6-4-30]キーボード入力を待つ
          await _getch();

          // [6-4-31]HPを回復させる
          attacker.hp = attacker.maxHp;

          // [6-4-32]戦闘シーンの画面を再描画する
          DrawBattleScreen();

          // [6-4-33]HPが回復したメッセージを表示する
          console.log(`${attacker.name}のきずが　かいふくした！`);

          // [6-4-34]キーボード入力を待つ
          await _getch();

          break;
        }
        case CommandType.COMMAND_RUN: {
          // [6-4-35]逃げる
          // [6-4-36]逃げ出したメッセージを表示する
          console.log(`${attacker.name}は　にげだした！`);

          // [6-4-37]キーボード入力を待つ
          await _getch();

          // [6-4-38]戦闘処理を抜ける
          return;
        }
        default: {
          // メモ：敵のcommandを初期化しておらず、敵が動かなかったので「戦う」をデフォルトにした
          // [6-4-12]戦う
          // [6-4-13]攻撃をするメッセージを表示する
          console.log(`${attacker.name}の　こうげき！`);

          // [6-4-14]キーボード入力を待つ
          await _getch();

          // [6-4-15]敵に与えるダメージを計算する
          const damage = 1 + Math.floor(Math.random() * attacker.attack);

          // [6-4-16]敵にダメージを与える
          target.hp -= damage;

          // [6-4-17]敵のHPが負の値になったかどうかを判定する
          if (target.hp < 0) {
            // [6-4-18]敵のHPを0にする
            target.hp = 0;
          }

          // [6-4-19]戦闘シーンの画面を再描画する関数を呼び出す
          DrawBattleScreen();

          // [6-4-20]敵にダメージを与えたメッセージを表示する
          console.log(`${target.name}に　${damage}　の　ダメージ！`);

          // [6-4-21]キーボード入力を待つ
          await _getch();

          break;
        }
      }

      // [6-4-39]攻撃対象を倒したかどうかを判定する
      if (target.hp <= 0) {
        // [6-4-40]攻撃対象によって処理を分岐させる
        switch (attacker.target!) {
          // [6-4-41]プレイヤーなら
          case CharacterType.CHARACTER_PLAYER:
            // [6-4-42]プレイヤーが死んだメッセージを表示する
            console.log('あなたは　しにました');

            break;

          // [6-4-43]モンスターなら
          case CharacterType.CHARACTER_MONSTER:
            // [6-4-44]モンスターのアスキーアートを何も表示しないように書き換える
            target.aa = '\n';

            // [6-4-45]戦闘シーンの画面を再描画する関数を呼び出す
            DrawBattleScreen();

            // [6-4-46]モンスターを倒したメッセージを表示する
            console.log(`${target.name}を　たおした！`);

            break;
        }

        // [6-4-47]キーボード入力を待つ
        await _getch();

        // [6-4-48]戦闘シーンの関数を抜ける
        return;
      }
    }
  }
}

// [6-6]プログラムの実行開始点を宣言する
async function main() {
  // [6-6-1]乱数をシャッフルする
  // JavaScriptでは何もしない

  // [6-6-2]ゲームを初期化する関数を呼び出す
  Init();

  // [6-6-3]戦闘シーンの関数を呼び出す
  Battle(MonsterType.MONSTER_BOSS);
}

main();
