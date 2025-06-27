import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal} from '@angular/core';
import {Subscription} from "rxjs";

import {GameService} from "@pages/game/providers/game.service";
import {Ball} from "@pages/game/types/ball.type";
import {WebsocketService} from "@pages/game/providers/websocket.service";
import {GameState} from "@pages/game/types/game-settings.type";

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent implements OnInit, OnDestroy {
  time = signal<number>(0);
  score = signal<number>(0);
  playerX = signal<number>(200);
  balls = signal<Ball[]>([]);
  private readonly subscriptions = new Subscription();

  constructor(
    private gameService: GameService,
    private websocketService: WebsocketService,
  ) {
    this.websocketService.connect();
  }

  ngOnInit(): void {
    this.subscriptions.add(this.gameService.getPlayer$().subscribe((x: number) => this.playerX.set(x)));
    this.subscriptions.add(this.gameService.getBalls$().subscribe((balls: Ball[]) => this.balls.set(balls)));

    this.subscriptions.add(
      this.websocketService.data$.subscribe({
        next: (gameState: GameState) => {
          this.time.set(gameState.timeRemaining);
          this.score.set(gameState.caughtObjects);
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
    this.websocketService.disconnect();
  }
}
