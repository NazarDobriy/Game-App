import {Injectable, OnDestroy} from '@angular/core';
import {
  BehaviorSubject,
  EMPTY,
  filter,
  fromEvent,
  interval,
  map,
  merge,
  Observable,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  throttleTime,
  withLatestFrom,
} from "rxjs";

import {
  BALL_HEIGHT,
  BALL_WIDTH,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  GAME_TICK_INTERVAL,
  INITIAL_PLAYER_X,
  MAX_PLAYER_X,
  PLAYER_WIDTH
} from "@pages/game/constants/game-board.constants";
import {GameSettings} from "@pages/game/types/game-settings.type";
import {Ball} from "@pages/game/types/ball.type";

@Injectable()
export class GameService implements OnDestroy {
  private ballId = 0;
  private spawnSub = new Subscription();
  private timerSub = new Subscription();
  private playerSub = new Subscription();
  private readonly gameStop$ = new Subject<void>();
  private readonly settings$ = new BehaviorSubject<GameSettings | null>(null);
  private readonly playerX = new BehaviorSubject<number>(INITIAL_PLAYER_X);
  private readonly balls$ = new BehaviorSubject<Ball[]>([]);
  private readonly score$ = new BehaviorSubject<number>(0);
  private readonly timer$ = new BehaviorSubject<number>(0);

  constructor() {
    this.handlePlayerControls();
  }

  getScore$(): Observable<number> {
    return this.score$.asObservable();
  }

  getPlayer$(): Observable<number> {
    return this.playerX.asObservable();
  }

  getTime$(): Observable<number> {
    return this.timer$.asObservable();
  }

  getBalls$(): Observable<Ball[]> {
    return this.balls$.asObservable();
  }

  setSettings(newSettings: GameSettings): void {
    const prevSettings = this.settings$.value;
    this.settings$.next(newSettings);

    if (!prevSettings || prevSettings.gameTime !== newSettings.gameTime) {
      this.restartGame();
    }
  }

  private startSpawning(settings: GameSettings): void {
    this.spawnSub.add(
      this.settings$.pipe(
        switchMap((value: GameSettings | null) => {
          if (!value) {
            return EMPTY;
          }

          if (value.fallingFrequency !== settings.fallingFrequency) {
            return this.startBallGeneration(value.fallingFrequency)
          }

          return this.startBallGeneration(settings.fallingFrequency);
        }),
      ).subscribe(),
    );

    this.spawnSub.add(
      interval(GAME_TICK_INTERVAL).pipe(
        withLatestFrom(this.settings$),
        tap(([_, settings]) => {
          if (!settings || this.timer$.value === 0) {
            return;
          }

          const currentBalls = this.balls$.value.map((ball: Ball) => ({
            ...ball,
            y: ball.y + settings.fallingSpeed,
          }));

          const filtered = currentBalls.filter(ball => {
            const caught = this.detectCollision(ball);
            if (caught) this.score$.next(this.score$.value + 1);
            return ball.y < (BOARD_HEIGHT - BALL_HEIGHT) && !caught;
          });

          this.balls$.next(filtered);
        }),
        takeUntil(this.gameStop$),
      ).subscribe(),
    );
  }

  private startBallGeneration(fallingFrequency: number): Observable<number> {
    return interval(fallingFrequency * 1000).pipe(
      takeUntil(this.gameStop$),
      tap(() => {
        const newBall: Ball = {
          id: this.ballId++,
          x: Math.floor(Math.random() * (BOARD_WIDTH - BALL_WIDTH)),
          y: 0,
        };
        const current = this.balls$.value;
        this.balls$.next([...current, newBall]);
      })
    );
  }

  private startTimer(duration: number): void {
    this.timerSub = interval(1000).pipe(
      takeUntil(this.gameStop$),
      map((sec: number) => duration - sec),
      takeWhile((time: number) => time >= 0),
    ).subscribe({
      next: (time: number)=> this.timer$.next(time),
      complete: () => this.stopGame(),
    });
  }

  private stopGame(): void {
    this.gameStop$.next();
    this.timer$.next(0);
    this.balls$.next([]);
    this.score$.next(0);
  }

  private restartGame(): void {
    this.spawnSub.unsubscribe();
    this.spawnSub = new Subscription();

    this.gameStop$.next();
    this.balls$.next([]);
    this.score$.next(0);

    const settings = this.settings$.value;

    if (!settings) {
      return;
    }

    this.startSpawning(settings);
    this.startTimer(settings.gameTime);
  }

  private handlePlayerControls(): void {
    const left$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      filter((e: KeyboardEvent) => e.key === 'ArrowLeft')
    );
    const right$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      filter((e: KeyboardEvent) => e.key === 'ArrowRight')
    );

    this.playerSub = merge(left$, right$).pipe(
      throttleTime(GAME_TICK_INTERVAL),
    ).subscribe({
      next: (e: KeyboardEvent) => {
        if (this.timer$.value !== 0) {
          const current = this.playerX.value;
          const speed = this.settings$.value?.playerSpeed || 1;
          const newX = e.key === 'ArrowLeft' ? current - speed : current + speed;
          this.playerX.next(Math.max(0, Math.min(newX, MAX_PLAYER_X)));
        }
      },
    });
  }

  private detectCollision(ball: Ball): boolean {
    const playerX = this.playerX.value;
    const playerY = (BOARD_HEIGHT - BALL_HEIGHT);
    return (
      ball.y >= playerY - BALL_HEIGHT &&
      ball.x >= playerX - BALL_WIDTH &&
      ball.x <= playerX + PLAYER_WIDTH
    );
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
    this.playerSub?.unsubscribe();
    this.spawnSub?.unsubscribe();
  }

}
