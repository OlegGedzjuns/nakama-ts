abstract class MessageType {
  static readonly SERVER_PLAYER_JOINED: number = 1;
  static readonly SERVER_PLAYER_JOINED_INITIAL_STATE: number = 2;
  static readonly SERVER_PLAYER_LEFT: number = 3;
  static readonly SERVER_PLAYER_MESSAGE: number = 4;
  static readonly SERVER_TERMINATED: number = 5;

  static readonly PLAYER_STATE_UPDATE: number = 101;
}
