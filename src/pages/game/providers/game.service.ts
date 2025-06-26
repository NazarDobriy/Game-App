import {Injectable} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  filter,
  fromEvent,
  interval,
  map,
  merge,
  Observable, share,
  Subject,
  switchMap,
  takeUntil, tap, withLatestFrom,
} from "rxjs";

import {
  BALL_HEIGHT,
  BALL_WIDTH,
  BOARD_HEIGHT, BOARD_WIDTH,
  GAME_TICK_INTERVAL,
  INITIAL_PLAYER_X,
  MAX_PLAYER_X,
  PLAYER_WIDTH
} from "@pages/game/constants/game-board.constants";
import {PlayerMoveEvent} from "@pages/game/types/game-settings.type";
import {Ball} from "@pages/game/types/ball.type";

@Injectable()
export class GameService {
  private readonly score$ = new BehaviorSubject<number>(0);
  private readonly timer$ = new BehaviorSubject<number | null>(null);
  private readonly playerX = new BehaviorSubject<number>(INITIAL_PLAYER_X);
  private readonly balls$ = new BehaviorSubject<Ball[]>([]);
  private readonly playerSpeed$ = new BehaviorSubject<number | null>(null);
  private readonly fallingSpeed$ = new BehaviorSubject<number | null>(null);
  private readonly fallingFrequency$ = new BehaviorSubject<number | null>(null);
  private readonly timeLeft$ = new BehaviorSubject<number>(0);
  private readonly gameStop$ = new Subject<void>();
  private ballId = 0;

  constructor() {
    this.handlePlayerControls();
    this.handleTimer();
    this.handleSpawningBalls();
    this.handleBallsFalling();
  }

  getScore$(): Observable<number> {
    return this.score$.asObservable();
  }

  getTimeLeft$(): Observable<number> {
    return this.timeLeft$.asObservable();
  }

  getPlayer$(): Observable<number> {
    return this.playerX.asObservable();
  }

  getBalls$(): Observable<Ball[]> {
    return this.balls$.asObservable();
  }

  setPlayerSpeed(speed: number): void {
    if (this.playerSpeed$.value !== speed) {
      this.playerSpeed$.next(speed);
    }
  }

  setFallingSpeed(speed: number): void {
    if (this.fallingSpeed$.value !== speed) {
      this.fallingSpeed$.next(speed);
    }
  }

  setFallingFrequency(frequency: number): void {
    if (this.fallingFrequency$.value !== frequency) {
      this.fallingFrequency$.next(frequency);
    }
  }

  setGameTime(time: number): void {
    if (this.timer$.value !== time) {
      this.timer$.next(time);
    }
  }

  private handleSpawningBalls(): void {
    this.fallingFrequency$.pipe(
      switchMap((fallingFrequency) => {
        if (fallingFrequency === null) {
          return EMPTY;
        }

        return interval(fallingFrequency * 1000).pipe(
          takeUntil(this.gameStop$),
        );
      }),
    ).subscribe({
      next: () => {
        const newBall: Ball = {
          id: this.ballId++,
          x: Math.floor(Math.random() * (BOARD_WIDTH - BALL_WIDTH)),
          y: 0,
        };
        const current = this.balls$.value;
        this.balls$.next([...current, newBall]);
      },
    });
  }

  private handleBallsFalling(): void {
    // combineLatest([
    //   this.timer$,
    //   this.playerSpeed$,
    //   this.fallingSpeed$,
    //   this.fallingFrequency$,
    // ]).pipe(
    //   switchMap(([time, playerSpeed, fallSpeed, fallingFrequency]) => {
    //     if (time === null || playerSpeed === null || fallingFrequency === null || fallSpeed === null) {
    //       return EMPTY;
    //     }
    //
    //     return interval(GAME_TICK_INTERVAL).pipe(
    //       map(() => fallSpeed),
    //       takeUntil(this.gameStop$),
    //     );
    //   }),
    // ).subscribe({
    //   next: (speed: number) => {
    //     const currentBalls = this.balls$.value.map((ball: Ball) => ({
    //       ...ball,
    //       y: ball.y + speed,
    //     }));
    //
    //     const filtered = currentBalls.filter((ball: Ball) => {
    //       const caught = this.detectCollision(ball);
    //       if (caught) {
    //         this.score$.next(this.score$.value + 1);
    //       }
    //       return ball.y < (BOARD_HEIGHT - BALL_HEIGHT) && !caught;
    //     });
    //
    //     this.balls$.next(filtered);
    //   }
    // });

    const sharedInterval$ = interval(GAME_TICK_INTERVAL).pipe(
      share(),
    );

    this.timer$.pipe(
      switchMap((time: number | null) => {
        if (time === null) return EMPTY;

        return sharedInterval$.pipe(
          withLatestFrom(this.fallingSpeed$),
          map(([_, fallSpeed]) => fallSpeed),
          takeUntil(this.gameStop$),
        );
      })
    ).subscribe((speed: number | null) => {
      if (speed) {
        const currentBalls = this.balls$.value.map((ball: Ball) => ({
          ...ball,
          y: ball.y + speed,
        }));

        const filtered = currentBalls.filter((ball: Ball) => {
          const caught = this.detectCollision(ball);
          if (caught) {
            this.score$.next(this.score$.value + 1);
          }
          return ball.y < (BOARD_HEIGHT - BALL_HEIGHT) && !caught;
        });

        this.balls$.next(filtered);
      }
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

  private handleTimer(): void {
    this.timer$.pipe(
      switchMap((duration: number | null) => {
        if (duration === null) {
          return EMPTY;
        }

        this.timeLeft$.next(duration);

        return interval(1000).pipe(
          map((sec: number) => duration - sec),
          takeUntil(this.gameStop$),
        );
      }),
    ).subscribe({
      next: (timeLeft: number) => {
        this.timeLeft$.next(timeLeft - 1);

        if (timeLeft - 1 <= 0) {
          this.restartGame();
        }
      },
    });
  }

  restartGame(): void {
    this.gameStop$.next();
    this.balls$.next([]);
    this.score$.next(0);
    this.playerSpeed$.next(null);
    this.playerX.next(INITIAL_PLAYER_X);
    this.timer$.next(null);
    this.timeLeft$.next(0);
  }

  private handlePlayerControls(): void {
    const left$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      filter((e: KeyboardEvent) => e.key === 'ArrowLeft'),
    );
    const right$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      filter((e: KeyboardEvent) => e.key === 'ArrowRight'),
    );

    this.playerSpeed$.pipe(
      switchMap((speed: number | null) => {
        if (speed === null) {
          return EMPTY;
        }

        return merge(left$, right$).pipe(
          map((event: KeyboardEvent) => ({ event, speed })),
        );
      }),
    ).subscribe({
      next: ({ event, speed }: PlayerMoveEvent) => {
        const current = this.playerX.value;
        const newX = event.key === 'ArrowLeft' ? current - speed : current + speed;
        this.playerX.next(Math.max(0, Math.min(newX, MAX_PLAYER_X)));
      }
    });
  }
}
