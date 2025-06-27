import {Injectable, OnDestroy} from '@angular/core';
import {combineLatest, interval, Subject, Subscription, switchMap, takeUntil} from "rxjs";

import {GameState} from "@pages/game/types/game-settings.type";
import {GameService} from "@pages/game/providers/game.service";

@Injectable()
export class WebsocketService implements OnDestroy {
  readonly data$ = new Subject<GameState>();
  private stop$ = new Subject<void>();
  private subscription = new Subscription();

  constructor(private gameService: GameService) { }

  connect(): void {
    this.disconnect();

    this.stop$ = new Subject<void>();

    this.subscription.add(
      interval(1000).pipe(
        switchMap(() => {
          return combineLatest([
            this.gameService.getScore$(),
            this.gameService.getTime$(),
          ]);
        }),
        takeUntil(this.stop$),
      ).subscribe({
        next: ([score, time]: [number, number]) => {
          this.data$.next({ caughtObjects: score, timeRemaining: time });
        },
      }),
    );
  }

  disconnect(): void {
    this.stop$.next();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
