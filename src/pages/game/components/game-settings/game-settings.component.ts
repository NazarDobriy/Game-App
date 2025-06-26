import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";

import {
  GameSettingsField,
  GameSettingsForm,
  GameSettingsFormValue,
} from "@pages/game/types/game-settings.type";
import {FIELDS} from "@pages/game/constants/game-settings.constants";
import {GameService} from "@pages/game/providers/game.service";
import {integerValidator} from "@pages/game/validators/number.validator";

@Component({
  selector: 'app-game-settings',
  templateUrl: './game-settings.component.html',
  styleUrl: './game-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSettingsComponent implements OnInit {
  form: FormGroup<GameSettingsForm> | null = null;
  readonly fields: GameSettingsField[] = FIELDS;
  private readonly validators: ValidatorFn[] = [
    Validators.required,
    Validators.min(1),
    integerValidator(),
  ];

  constructor(private fb: FormBuilder, private gameService: GameService) {
    this.form = this.fb.group<GameSettingsForm>({
      fallingSpeed: this.fb.control<number | null>(null, this.validators),
      fallingFrequency: this.fb.control<number | null>(null, this.validators),
      playerSpeed: this.fb.control<number | null>(null, this.validators),
      gameTime: this.fb.control<number | null>(null, this.validators),
    });
  }

  ngOnInit(): void {
    this.form?.valueChanges.subscribe({
      next: (value: Partial<GameSettingsFormValue>) => {
        if (Object.values(value).some((item: number | null) => item === null)) {
          this.gameService.restartGame();
          return;
        }

        if (value.gameTime) {
          this.gameService.restartGame();
          this.gameService.setGameTime(value.gameTime);
        }

        if (value.playerSpeed) {
          this.gameService.setPlayerSpeed(value.playerSpeed);
        }

        if (value.fallingSpeed) {
          this.gameService.setFallingSpeed(value.fallingSpeed);
        }

        if (value.fallingFrequency) {
          this.gameService.setFallingFrequency(value.fallingFrequency);
        }
      },
    });
  }

}
