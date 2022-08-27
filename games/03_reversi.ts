// [1]ヘッダーをインクルードする場所
import { _getch, printf } from './stdio';
import { system } from './stdlib';

// [2]定数を定義する場所

const BOARD_WIDTH = 8; // [2-1]盤面の幅を定義する
const BOARD_HEIGHT = 8; // [2-2]盤面の高さを定義する

// [3]列挙定数を定義する場所

// [3-1]ターンの種類を定義する
enum Turn {
  TURN_BLACK, // [3-1-1]黒
  TURN_WHITE, // [3-1-2]白
  TURN_NONE, // [3-1-3]なし
  TURN_MAX, // [3-1-4]ターンの数
}

// [3-2]方向の種類を定義する
enum Direction {
  DIRECTION_UP, // [3-2-1]上
  DIRECTION_UP_LEFT, // [3-2-2]左上
  DIRECTION_LEFT, // [3-2-3]左
  DIRECTION_DOWN_LEFT, // [3-2-4]左下
  DIRECTION_DOWN, // [3-2-5]下
  DIRECTION_DOWN_RIGHT, // [3-2-6]右下
  DIRECTION_RIGHT, // [3-2-7]右
  DIRECTION_UP_RIGHT, // [3-2-8]右上
  DIRECTION_MAX, // [3-2-9]方向の数
}

// [3-3]ゲームモードの種類を定義する
enum GameMode {
  MODE_1P, // [3-3-1]AIと対戦するモード
  MODE_2P, // [3-3-2]人間どうしの対戦モード
  MODE_WATCH, // [3-3-3]AI間どうし対決の観戦モード
  MODE_MAX, // [3-3-4]モードの数
}

// [4]構造体を宣言する場所

// [4-1]ベクトル構造体を宣言する
type VEC2 = {
  // [4-1-1]座標
  x: number;
  y: number;
};

// [5]変数を宣言する場所

// [5-1]石のアスキーアートを宣言する
const diskAA = [
  '@', // [5-1-1]TURN_BLACK    黒い石が置かれている
  'O', // [5-1-2]TURN_WHITE    白い石が置かれている
  '-', // [5-1-3]TURN_NONE     石が置かれていない
] as const;

// [5-2]ターンの名前を宣言する
const turnNames = [
  '@', // TURN_BLACK
  'O', // TURN_WHITE
] as const;

// [5-3]モードの名前を宣言する
const modeNames = [
  '１Ｐ　ＧＡＭＥ', // [5-3-1]MODE_1P   AIと対戦するモード
  '２Ｐ　ＧＡＭＥ', // [5-3-2]MODE_2P   人間どうしの対戦モード
  'ＷＡＴＣＨ', // [5-3-3]MODE_WATCH    AI間どうし対決の観戦モード
] as const;

// [5-4]方向を宣言する
const directions: VEC2[] = [
  { x: 0, y: -1 }, // [5-4-1]DIRECTION_UP          上
  { x: -1, y: -1 }, // [5-4-2]DIRECTION_UP_LEFT     左上
  { x: -1, y: 0 }, // [5-4-3]DIRECTION_LEFT        左
  { x: -1, y: 1 }, // [5-4-4]DIRECTION_DOWN_LEFT   左下
  { x: 0, y: 1 }, // [5-4-5]DIRECTION_DOWN        下
  { x: 1, y: 1 }, // [5-4-6]DIRECTION_DOWN_RIGHT  右下
  { x: 1, y: 0 }, // [5-4-7]DIRECTION_RIGHT       右
  { x: 1, y: -1 }, // [5-4-8]DIRECTION_UP_RIGHT    右上
];

// [5-5]盤面の各マスの状態を宣言する
const board: number[][] = [...Array(BOARD_HEIGHT)].map(() => [...Array(BOARD_WIDTH)].fill(0));

let cursorPosition: VEC2; // [5-6]カーソルの座標を宣言する

let turn: number = 0; // [5-7]現在のターンを宣言する

let mode: number = 0; // [5-8]現在のゲームモードを宣言する

const isPlayer = Array(Turn.TURN_MAX).fill(false); // [5-9]各ターンがプレイヤーかどうかを宣言する

// [6]関数を宣言する場所

// [6-1]ベクトルを加算する関数を宣言する
function VecAdd(_v0: VEC2, _v1: VEC2): VEC2 {
  // [6-1-2]加算したベクトルを返す
  return {
    x: _v0.x + _v1.x,
    y: _v0.y + _v1.y,
  };
}

// [6-2]石を置けるかどうかの判定、または石をひっくり返す関数を宣言する
function CheckCanPlace(
  _color: number, // 石の色
  _position: VEC2, // 座標
  _turnOver = false, // ひっくり返すかどうか
): boolean {
  let canPlace = false; // [6-2-1]置けるかどうかのフラグを宣言する

  // [6-2-2]対象の座標に石が置かれていないか判定する
  if (board[_position.y][_position.x] != Turn.TURN_NONE) {
    return false; // [6-2-3]石が置かれていたら置けないという結果を返す
  }

  const opponent = _color ^ 1; // [6-2-4]相手の石の色を宣言する

  // [6-2-5]すべての方向を反復する
  for (let i = 0; i < Direction.DIRECTION_MAX; i++) {
    // [6-2-6]現在チェック中の座標を宣言する
    let currentPosition = _position;

    // [6-2-7]隣のマスに移動する
    currentPosition = VecAdd(currentPosition, directions[i]);

    // [6-2-8]相手の石でないか判定する
    if (board[currentPosition.y]?.[currentPosition.x] != opponent) {
      // メモ：配列ない場合は無視するため`?.`をつける
      // [6-2-9]相手の石でなければ、その方向のチェックを中止する
      continue;
    }

    // [6-2-10]無限ループする
    while (true) {
      // [6-2-11]隣のマスに移動する
      currentPosition = VecAdd(currentPosition, directions[i]);

      // [6-2-12]チェックするマスが盤面の範囲内でないか判定する
      if (currentPosition.x < 0 || currentPosition.x >= BOARD_WIDTH || currentPosition.y < 0 || currentPosition.y >= BOARD_HEIGHT) {
        // [6-2-13]盤面の外側に出てしまったら、現在の方向のチェックを抜ける
        break;
      }

      // [6-2-14]チェックするマスに石がないかどうかを判定する
      if (board[currentPosition.y][currentPosition.x] == Turn.TURN_NONE) {
        break; // [6-2-15]石がなければ、現在の方向のチェックを抜ける
      }

      // [6-2-16]チェックするマスに自分の石があれば
      if (board[currentPosition.y][currentPosition.x] == _color) {
        // [6-2-17]石を置けることが確定する
        canPlace = true;

        // [6-2-18]ひっくり返しフラグが立っているかどうか判定する
        if (_turnOver) {
          // [6-2-19]ひっくり返す座標を宣言する
          let reversePosition = _position;

          // [6-2-20]隣のマスに移動する
          reversePosition = VecAdd(reversePosition, directions[i]);

          // [6-2-21]現在のターンの石が見つかるまで反復する
          do {
            // [6-2-22]相手の石をひっくり返す
            board[reversePosition.y][reversePosition.x] = _color;

            // [6-2-23]隣のマスに移動する
            reversePosition = VecAdd(reversePosition, directions[i]);
          } while (board[reversePosition.y][reversePosition.x] != _color);
        }
      }
    }
  }

  return canPlace; // [6-2-24]石を置けるかどうかを返す
}

// [6-3]盤面上に石を置けるマスがあるかどうか判定する関数を宣言する
function CheckCanPlaceAll(_color: number): boolean {
  // [6-3-1]盤面のすべての行を反復する
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    // [6-3-2]盤面のすべての列を反復する
    for (let x = 0; x < BOARD_WIDTH; x++) {
      // [6-3-3]判定する座標を宣言する
      let position: VEC2 = { x, y };

      // [6-3-4]対象の座標に石を置けるかどうか判定する
      if (
        CheckCanPlace(
          _color, // int _color       石の色
          position,
        )
      ) {
        // VEC2 _position   座標
        return true; // [6-3-5]石を置けるマスがあるという結果を返す
      }
    }
  }

  return false; // [6-3-6]石を置けるマスがないという結果を返す
}

// [6-4]任意の石の数を数える関数を宣言する
function GetDiskCount(_color: number): number {
  let count = 0; // [6-4-1]数える石の数を保持する変数を宣言する

  // [6-4-2]盤面のすべての行を反復する
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    // [6-4-3]盤面のすべての列を反復する
    for (let x = 0; x < BOARD_WIDTH; x++) {
      // [6-4-4]対象のマスに、対象の石があるかどうかを判定する
      if (board[y][x] == _color) {
        count++; // [6-4-5]石の数を加算する
      }
    }
  }

  return count; // [6-4-6]数えた石の数を返す
}

// [6-5]画面を描画する関数を宣言する
function DrawScreen() {
  system('cls'); // [6-5-1]画面をクリアする

  // [6-5-2]すべての行を反復する
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    // [6-5-3]すべての列を反復する
    for (let x = 0; x < BOARD_WIDTH; x++) {
      printf('%s', diskAA[board[y][x]]); // [6-5-4]石を描画する
    }

    // [6-5-5]プレイヤーの担当かどうかを判定する
    if (isPlayer[turn]) {
      // [6-5-6]対象の行がカーソルと同じ行かどうかを判定する
      if (y == cursorPosition.y) {
        printf(' <-'); // [6-5-7]カーソルを描画する
      }
    }

    printf('\n'); // [6-5-8]行の描画の最後に改行する
  }

  // [6-5-9]プレイヤーの担当かどうかを判定する
  if (isPlayer[turn]) {
    // [6-5-10]盤面の列の数だけ反復する
    for (let x = 0; x < BOARD_WIDTH; x++) {
      // [6-5-11]カーソルと同じ列かどうかを判定する
      if (x == cursorPosition.x) {
        printf('^'); // [6-5-12]↑矢印を表示する
      } else {
        printf(' '); // [6-5-13]全角スペースを表示する
      }
    }
  }

  // [6-5-14]カーソルの描画が終わったら改行しておく
  printf('\n');

  // [6-5-15]決着が付いていないかどうかを判定する
  if (turn != Turn.TURN_NONE) {
    // [6-5-16]ターンを表示する
    printf('%sのターンです\n', turnNames[turn]);
  }
  // [6-5-17]決着が付いたなら
  else {
    // [6-5-18]黒い石の数を宣言する
    const blackCount = GetDiskCount(Turn.TURN_BLACK);

    // [6-5-19]白い石の数を宣言する
    const whiteCount = GetDiskCount(Turn.TURN_WHITE);

    // [6-5-20]勝者を保持する変数を宣言する
    let winner = 0;

    // [6-5-21]勝者を判定する
    if (blackCount > whiteCount) {
      // [6-5-22]黒のほうが多ければ
      winner = Turn.TURN_BLACK; // [6-5-23]黒の勝ち
    } else if (whiteCount > blackCount) {
      // [6-5-24]白のほうが多ければ
      winner = Turn.TURN_WHITE; // [6-5-25]白の勝ち
    } // [6-5-26]同じ数なら
    else {
      winner = Turn.TURN_NONE; // [6-5-27]引き分け
    }

    // [6-5-28]両者の石の数を表示する
    printf(
      '%s%d, %s%d　',
      turnNames[Turn.TURN_BLACK], // 黒の名前
      GetDiskCount(Turn.TURN_BLACK), // 黒の石の数
      turnNames[Turn.TURN_WHITE], // 白の名前
      GetDiskCount(Turn.TURN_WHITE),
    ); // 白の石の数

    // [6-5-29]引き分けかどうか判定する
    if (winner == Turn.TURN_NONE) {
      printf('引き分け\n'); // [6-5-30]引き分けメッセージを表示する
    } // [6-5-31]優劣が付いたなら
    else {
      // [6-5-32]勝者を表示する
      printf('%sの勝ち\n', turnNames[winner]);
    }
  }
}

// [6-6]モード選択画面の関数を宣言する
function SelectMode() {
  mode = GameMode.MODE_1P; // [6-6-1]ゲームモードを初期化する

  // [6-6-2]無限ループする
  while (true) {
    system('cls'); // [6-6-3]画面をクリアする

    // [6-6-4]メッセージを表示する
    printf('モードを　選択して\nください\n');

    printf('\n\n'); // [6-6-5]2行空ける

    // [6-6-6]すべてのモードを反復する
    for (let i = 0; i < GameMode.MODE_MAX; i++) {
      // [6-6-7]現在のモードにはカーソルを、それ以外にはスペースを描画する
      printf('%s　', i == mode ? '＞' : '　');

      printf('%s\n', modeNames[i]); // [6-6-8]モードの名前を描画する

      printf('\n'); // [6-6-9]1行空ける
    }

    // [6-6-10]入力されたキーで分岐する
    switch (_getch()) {
      case 'w': // [6-6-11]wキーが押されたら
        mode--; // [6-6-12]前のモードに切り替える
        break;

      case 's': // [6-6-13]sキーが押されたら
        mode++; // [6-6-14]次のモードに切り替える
        break;

      default: // [6-6-15]その他のキーが押されたら
        // [6-6-16]選択されたモードで分岐する
        switch (mode) {
          case GameMode.MODE_1P: // [6-6-17]AIと対戦するモードなら
            isPlayer[Turn.TURN_BLACK] = true; // [6-6-18]黒をプレイヤーにする
            isPlayer[Turn.TURN_WHITE] = false; // [6-6-19]白をプレイヤーにしない

            break;

          case GameMode.MODE_2P: // [6-6-20]人間どうしの対戦モードなら
            // [6-6-21]両者をプレイヤーの担当にする
            isPlayer[Turn.TURN_BLACK] = isPlayer[Turn.TURN_WHITE] = true;

            break;

          case GameMode.MODE_WATCH: // [6-6-22]AIどうし対決の観戦モードなら
            // [6-6-23]両者をプレイヤーの担当にしない
            isPlayer[Turn.TURN_BLACK] = isPlayer[Turn.TURN_WHITE] = false;

            break;
        }

        return; // [6-6-24]モード選択を抜ける
    }

    // [6-6-25]カーソルを上下にループさせる
    mode = (GameMode.MODE_MAX + mode) % GameMode.MODE_MAX;
  }
}

// [6-7]ゲームを初期化する関数を宣言する
function Init() {
  // [6-7-1]盤面のすべての行を反復する
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    // [6-7-2]盤面のすべての列を反復する
    for (let x = 0; x < BOARD_WIDTH; x++) {
      // [6-7-3]対象のマスを石が置かれていない状態にする
      board[y][x] = Turn.TURN_NONE;
    }
  }

  // [6-7-4]盤面中央の右上と左下に黒い石を置く
  board[4][3] = board[3][4] = Turn.TURN_BLACK;

  // [6-7-5]盤面中央の左上と右下に白い石を置く
  board[3][3] = board[4][4] = Turn.TURN_WHITE;

  turn = Turn.TURN_BLACK; // [6-7-6]黒のターンで初期化する

  cursorPosition = { x: 3, y: 3 }; // [6-7-7]カーソルの座標を初期化する

  DrawScreen(); // [6-7-8]画面を描画する関数を呼び出す
}

// [6-8]石を置くマスを選択する関数を宣言する
function InputPosition(): VEC2 {
  // [6-8-1]置けるマスが選択されるまで無限ループする
  while (true) {
    DrawScreen(); // [6-8-2]画面を描画する関数を呼び出す

    // [6-8-3]入力されたキーによって分岐する
    switch (_getch()) {
      case 'w': // [6-8-4]wキーが押されたら
        cursorPosition.y--; // [6-8-5]カーソルを上に移動する
        break;

      case 's': // [6-8-6]sキーが押されたら
        cursorPosition.y++; // [6-8-7]カーソルを下に移動する
        break;

      case 'a': // [6-8-8]aキーが押されたら
        cursorPosition.x--; // [6-8-9]カーソルを左に移動する
        break;

      case 'd': // [6-8-10]dキーが押されたら
        cursorPosition.x++; // [6-8-11]カーソルを右に移動する
        break;

      default: // [6-8-12]移動以外のキーが押されたら
        // [6-8-13]カーソルの座標に石が置けるかどうか判定する
        if (CheckCanPlace(turn, cursorPosition)) {
          return cursorPosition; // [6-8-14]カーソルの座標を返す
        }
        // [6-8-15]置けなければ
        else {
          // [6-8-16]置かなかったメッセージを表示し、アラートを鳴らす
          printf('そこには　置けません\x07'); // メモ: `\a`使えないっぽいから`\x07`にする

          _getch(); // [6-8-17]キーボード入力を待つ
        }

        break;
    }

    // [6-8-18]カーソルを左右にループさせる
    cursorPosition.x = (BOARD_WIDTH + cursorPosition.x) % BOARD_WIDTH;

    // [6-8-19]カーソルを上下にループさせる
    cursorPosition.y = (BOARD_HEIGHT + cursorPosition.y) % BOARD_HEIGHT;
  }
}

// [6-9]プログラム実行の開始点を宣言する
function main() {
  // [6-9-1]乱数をシャッフルする
  // メモ：何もしない

  // [6-9-2]開始ラベル
  // [6-9-3]空文
  // メモ: 何もしない

  SelectMode(); // [6-9-4]モードを選択する関数を呼び出す

  Init(); // [6-9-5]ゲームを初期化する関数を呼び出す

  // [6-9-6]メインループ
  while (true) {
    // [6-9-7]置けるマスがないかどうかを判定する
    if (!CheckCanPlaceAll(turn)) {
      turn ^= 1; // [6-9-8]ターンを切り替える

      // [6-9-9]置けるマスがないどうかを判定する
      if (!CheckCanPlaceAll(turn)) {
        turn = Turn.TURN_NONE; // [6-9-10]決着が付いたことにする

        DrawScreen(); // [6-9-11]画面を描画する関数を呼び出す

        _getch(); // [6-9-12]キーボード入力を待つ

        main(); // [6-9-13]開始ラベルにジャンプする
        return; // メモ：雑だけどいいや
      }

      // [6-9-14]相手に置けるマスがあれば
      else {
        continue; // [6-9-15]相手のターンへスキップする
      }
    }

    // [6-9-16]石を置くマスを宣言する
    let placePosition: VEC2;

    // [6-9-17]現在のターンの担当がプレイヤーかどうかを判定する
    if (isPlayer[turn]) {
      // [6-9-18]石を置くマスを選択する関数を呼び出す
      placePosition = InputPosition();
    }
    // [6-9-19]現在のターンの担当がプレイヤーでないなら
    else {
      DrawScreen(); // [6-9-20]盤面を描画する関数を呼び出す

      _getch(); // [6-9-21]キーボード入力を待つ

      // [6-9-22]置ける座標を保持するベクターを宣言する
      const positions: VEC2[] = [];

      // [6-9-23]盤面のすべての行を反復する
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        // [6-9-24]盤面のすべての列を反復する
        for (let x = 0; x < BOARD_WIDTH; x++) {
          // [6-9-25]対象のマスの座標を宣言する
          let position: VEC2 = { x, y };

          // [6-9-26]対象の座標に石を置けるかどうか判定する
          if (CheckCanPlace(turn, position)) {
            // [6-9-27]ベクターに対象の座標を追加する
            positions.push(position);
          }
        }
      }

      // [6-9-28]置ける場所をランダムに取得する
      placePosition = positions[Math.floor(Math.random() * positions.length)];
    }

    // [6-9-29]石をひっくり返す
    CheckCanPlace(turn, placePosition, true);

    // [6-9-30]現在のターンの石を置く
    board[placePosition.y][placePosition.x] = turn;

    turn ^= 1; // [6-9-31]ターンを切り替える
  }
}

main();
