// [1]ヘッダーをインクルードする場所
import { _getch } from './stdio';

// [2]定数を定義する場所

// メモ：windows terminalの幅がデフォルトで120なのでその半分。てかサイズ取得すべきかも
const FIELD_WIDTH = 60; // [2-1]フィールドの幅を定義する
const FIELD_HEIGHT = 30; // [2-2]フィールドの高さを定義する

const FPS = 10; // [2-3]1秒当たりの更新回数を定義する
const INTERVAL = 1000 / FPS; // [2-4]更新間隔（ミリ秒）を定義する

// [3]変数を宣言する場所

// [3-1]フィールドを宣言する
let field: boolean[][] = [...Array(FIELD_HEIGHT)].map(() => Array(FIELD_WIDTH).fill(false));

// [4]関数を宣言する場所

// [4-1]フィールドを描画する関数を宣言する
function DrawField() {
  process.stdout.write('\x1b[1;1H'); // [4-1-1]描画前に画面をクリアする (メモ：画面がチカチカするので移動するだけにした)

  // メモ：一文字ずつ描画すると重すぎるので一気に描画するように変更
  const chars: string[] = [];

  // [4-1-2]フィールドのすべての行を反復する
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    // [4-1-3]フィールドのすべての列を反復する
    for (let x = 0; x < FIELD_WIDTH; x++) {
      // [4-1-4]セルが生きていれば「■」を、死んでいれば「　」を描画する
      chars.push(field[y][x] ? '■' : '  '); // メモ：等幅フォントじゃないとズレるのでセルを変えた
    }
    chars.push('\n'); // [4-1-5]1行描画するごとに改行する
  }
  console.log(chars.join("")) // メモ：全体を描画
}

// [4-2]対象のセルと隣接する生きたセルの数を取得する関数を宣言する
function GetLivingCellsCount(_x: number, _y: number): number {
  let count = 0; // [4-2-1]生きているセルを数えるカウンターを宣言する

  // [4-2-2]対象のセルの上下1マスを反復する
  for (let y = _y - 1; y <= _y + 1; y++) {
    /*
    // [4-2-3]上下にループさせない場合は、行が範囲内かどうかを判定する
    if (y < 0 || y >= FIELD_HEIGHT) {
      continue; // [4-2-4]範囲外の行なのでスキップする
    }
    */

    // [4-2-5]上下にループしたY座標を宣言する
    const roopedY = (FIELD_HEIGHT + y) % FIELD_HEIGHT;

    // [4-2-6]対象のセルの左右1マスを反復する
    for (let x = _x + -1; x <= _x + 1; x++) {
      /*
      // [4-2-7]左右にループさせない場合は、列が範囲内かどうかを判定する
      if (x < 0 || x >= FIELD_WIDTH) {
        continue; // [4-2-8]範囲外の列なのでスキップする
      }
      */

      // [4-2-9]左右にループしたX座標を宣言する
      const roopedX = (FIELD_WIDTH + x) % FIELD_WIDTH;

      // [4-2-10]対象の座標が、中心のセルと同じかどうかを判定する
      if (roopedX == _x && roopedY == _y) {
        continue; // [4-2-11]対象の座標をスキップする
      }

      // [4-2-12]対象のセルが生きていれば1を、死んでいれば0を加算する
      if (field[roopedY][roopedX]) count++;
    }
  }

  return count; // [4-2-13]生きているセルの数を返す
}

// [4-3]1ステップ分のシミュレーションを実行する関数を宣言する
function StepSimulation() {
  // [4-3-1]次の世代のフィールドを宣言する
  const nextField: boolean[][] = [...Array(FIELD_HEIGHT)].map(() => [...Array(FIELD_WIDTH)]);

  // [4-3-2]すべての行を反復する
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    //  [4-3-3]すべての列を反復する
    for (let x = 0; x < FIELD_WIDTH; x++) {
      // [4-3-4]対象のセルと隣接する、生きているセルの数を宣言する
      let livingCellCount = GetLivingCellsCount(x, y);

      // [4-3-5]隣接する生きたセルの数で分岐する
      if (livingCellCount <= 1) {
        // [4-3-5]1個なら
        // [4-3-6]対象のセルを死滅させる
        nextField[y][x] = false;
      } else if (livingCellCount == 2) {
        // [4-3-7]2個なら
        // [4-3-8]現状維持
        nextField[y][x] = field[y][x];
      } else if (livingCellCount == 3) {
        // [4-3-9]3個なら
        // [4-3-10]対象のセルを誕生／生存させる
        nextField[y][x] = true;
      } // [4-3-11]4つ以上なら
      else {
        // [4-3-12]対象のセルを死滅させる
        nextField[y][x] = false;
      }
    }
  }

  // [4-3-13]次のステップのフィールドを、現在のフィールドにコピーする
  field = nextField;
}

// [4-4]パターンをフィールドにコピーする関数を宣言する
function PatternTransfer(_destX: number, _destY: number, _srcWidth: number, _srcHeight: number, _pPattern: boolean[][]) {
  // [4-4-1]パターン内のすべての行を反復する
  for (let y = 0; y < _srcHeight; y++) {
    // [4-4-2]パターン内のすべての列を反復する
    for (let x = 0; x < _srcWidth; x++) {
      // [4-4-3]パターンをフィールドにコピーする
      field[_destY + y][_destX + x] = _pPattern[y][x]; // メモ：ここポインタ渡されてたけど普通に配列にした
    }
  }
}

// [4-5]プログラム実行の開始点を宣言する
function main() {
  const patternWidth = 10; // [4-5-1]パターンの幅を宣言する
  const patternHeight = 8; // [4-5-2]パターンの高さを宣言する

  // [4-5-3]パターンを宣言する
  const pattern = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ].map((row) => row.map(Boolean));

  // [4-5-4]パターンをフィールドの中心にコピーする
  PatternTransfer(
    FIELD_WIDTH / 2 - patternWidth / 2, // int _destX
    FIELD_HEIGHT / 2 - patternHeight / 2, // int _destY
    patternWidth, // int _srcWidth
    patternHeight, // int _srcHeight
    pattern,
  ); // bool* _pPattern

  let lastClock = Date.now(); // [4-5-5]前回の経過時間を宣言する

  // [4-5-6]メインループ
  while (true) {
    const newClock = Date.now(); // [4-5-7]現在の経過時間を宣言する

    // [4-5-8]前回の経過時間から、待機時間が経過していなければ
    if (newClock < lastClock + INTERVAL) {
      continue; // [4-5-9]待機状態に戻る
    }

    // [4-5-10]前回経過時間を、現在の経過時間で更新する
    lastClock = newClock;

    DrawField(); // [4-5-11]フィールドを描画する関数を呼び出す

    StepSimulation(); // [4-5-13]シミュレーションを進める
    // _getch(); // [4-5-12]キーボード入力を待つ
  }
}

main();
