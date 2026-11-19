import { Injectable, signal } from '@angular/core';
import { fromEvent, map, merge, shareReplay, startWith } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  readonly isOnline = signal<boolean>(navigator.onLine);

  readonly onlineChanges$ = merge(
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  ).pipe(
    startWith(navigator.onLine),
    shareReplay(1)
  );

  constructor() {
    this.onlineChanges$.subscribe(status => this.isOnline.set(status));
  }
}
