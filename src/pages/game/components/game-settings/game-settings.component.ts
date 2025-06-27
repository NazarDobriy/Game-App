import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Subscription} from "rxjs";

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
export class GameSettingsComponent implements OnInit, OnDestroy {
  form: FormGroup<GameSettingsForm> | null = null;
  readonly fields: GameSettingsField[] = FIELDS;
  private formSub = new Subscription();
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
    if (!!this.form) {
      this.formSub = this.form.valueChanges.subscribe({
        next: (value: Partial<GameSettingsFormValue>) => {
          if (!!value.gameTime && !!value.playerSpeed && !!value.fallingSpeed && !!value.fallingFrequency) {
            this.gameService.setSettings({
              fallingFrequency: value.fallingFrequency,
              fallingSpeed: value.fallingSpeed,
              playerSpeed: value.playerSpeed,
              gameTime: value.gameTime,
            });
          }
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

}
