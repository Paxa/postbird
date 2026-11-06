import events from 'events';

export class PostbirdEventEmitter extends events.EventEmitter {
  private _anyListeners: Function[] = [];

  constructor(_options?: any) {
    super();
  }

  onAny(fn: Function) {
    this._anyListeners.push(fn);
    return this;
  }

  offAny(fn: Function) {
    const idx = this._anyListeners.indexOf(fn);
    if (idx !== -1) this._anyListeners.splice(idx, 1);
    return this;
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    for (const fn of this._anyListeners) {
      try {
        fn(event, ...args);
      } catch (e) {
        console.error(e);
      }
    }
    return super.emit(event, ...args);
  }
}

export const EventEmitter2 = PostbirdEventEmitter;

export default {
  EventEmitter2,
};
