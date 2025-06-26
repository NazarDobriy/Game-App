import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule} from "@angular/forms";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";

import {GameComponent} from './game.component';
import {GameRoutingModule} from "@pages/game/game-routing.module";
import {WebsocketService} from "@pages/game/providers/websocket.service";
import {GameService} from "@pages/game/providers/game.service";
import {GameSettingsComponent} from './components/game-settings/game-settings.component';
import {GameBoardComponent} from './components/game-board/game-board.component';

@NgModule({
  declarations: [
    GameComponent,
    GameSettingsComponent,
    GameBoardComponent,
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
  ],
  providers: [GameService, WebsocketService],
})
export class GameModule { }
