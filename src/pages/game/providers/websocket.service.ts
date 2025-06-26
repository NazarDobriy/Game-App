import {Injectable} from '@angular/core';
import {combineLatest, interval, Subject, switchMap, takeUntil} from "rxjs";

import {GameState} from "@pages/game/types/game-settings.type";
import {GameService} from "@pages/game/providers/game.service";

@Injectable()
export class WebsocketService {
  readonly data$ = new Subject<GameState>();
  private readonly stop$ = new Subject<void>();

  constructor(private gameService: GameService) { }

  connect(): void {
    interval(1000).pipe(
      takeUntil(this.stop$),
      switchMap(() => {
        return combineLatest([
          this.gameService.getScore$(),
          this.gameService.getTimeLeft$(),
        ]);
      }),
    ).subscribe({
      next: ([score, time]: [number, number]) => {
        this.data$.next({ caughtObjects: score, timeRemaining: time });
      },
    });
  }

  disconnect(): void {
    this.stop$.next();
  }
}
