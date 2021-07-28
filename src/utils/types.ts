class Player {
  id: string;
  username: string;
  x: number;
  y: number;
  coins: number;

  constructor(id: string, username: string, x = 0, y = 0, coins = 0) {
    this.id = id;
    this.username = username;
    this.x = x;
    this.y = y;
    this.coins = coins;
  }
}

class Coin {
  id: number | string;
  x: number;
  y: number;

  constructor(id: number | string, width: number, x?: number, y?: number) {
    this.id = id;
    this.x = x || Math.random() * (width * 2 + 1) - width;
    this.y = y || Math.random() * (width * 2 + 1) - width;
  }
}
