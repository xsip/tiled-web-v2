export class KeyboardHandlerService {
  private static pressed: Record<KeyboardEvent['key'], boolean> = {};
  private static isListening = false;
  private static _lastPressedKey: KeyboardEvent['key'] = '';

  public static listen() {
    if(KeyboardHandlerService.isListening)
      return;
    KeyboardHandlerService.isListening = true;
    window.addEventListener('keydown', (e) => KeyboardHandlerService.handleKeyDown(e));
    window.addEventListener('keyup', (e) => KeyboardHandlerService.handleKeyUp(e));

  }

  public static handleKeyDown(e: KeyboardEvent) {
    KeyboardHandlerService.pressed[e.key] = true;
    KeyboardHandlerService._lastPressedKey = e.key;
    console.log(e.key);
  }

  public static handleKeyUp(e: KeyboardEvent) {
    KeyboardHandlerService.pressed[e.key] = false;
  }

  public static isKeyDown(key: KeyboardEvent['key'], checkForLastKey?: boolean, resetAfterPressed?: boolean, ignoreLastKeys: string[] = []) {
    let isPressed = false;
    if(checkForLastKey) {
      isPressed = KeyboardHandlerService.pressed[key] &&  (KeyboardHandlerService._lastPressedKey === key || ignoreLastKeys.includes(KeyboardHandlerService._lastPressedKey));
    } else {
      isPressed = KeyboardHandlerService.pressed[key];
    }
    if(resetAfterPressed)
      (KeyboardHandlerService.pressed[key] = false);
    return isPressed;
  }
  public static isKeyDownAnyOf(keys: KeyboardEvent['key'][]) {
    return Object.keys(KeyboardHandlerService.pressed).find(k => KeyboardHandlerService.pressed[k] && keys.includes(k));
  }

  public static get lastPressedKey() {
    return KeyboardHandlerService._lastPressedKey;
  }

  public static set lastPressedKey(lastPressedKey: KeyboardEvent['key']) {

  }
}
