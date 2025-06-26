import {Component, OnInit} from '@angular/core';

import {GameService} from "@pages/game/providers/game.service";
import {Ball} from "@pages/game/types/ball.type";

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent implements OnInit {
  time = 0;
  score = 0;
  playerX = 200;
  balls: Ball[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.getPlayer$().subscribe((x: number) => this.playerX = x);
    this.gameService.getTimeLeft$().subscribe((time: number) => this.time = time);
    this.gameService.getBalls$().subscribe((balls: Ball[]) => this.balls = balls);
    this.gameService.getScore$().subscribe((score: number) => this.score = score);
  }
}
