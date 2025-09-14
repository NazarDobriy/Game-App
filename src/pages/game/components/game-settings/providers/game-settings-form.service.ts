import {Injectable} from '@angular/core';
import {FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";

import {GameSettingsForm} from "@pages/game/types/game-settings.type";
import {integerValidator} from "@pages/game/validators/number.validator";

@Injectable()
export class GameSettingsFormService {
  form: FormGroup<GameSettingsForm> | null = null;
  private readonly validators: ValidatorFn[] = [
    Validators.required,
    Validators.min(1),
    integerValidator(),
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group<GameSettingsForm>({
      fallingSpeed: this.fb.control<number | null>(null, this.validators),
      fallingFrequency: this.fb.control<number | null>(null, this.validators),
      playerSpeed: this.fb.control<number | null>(null, this.validators),
      gameTime: this.fb.control<number | null>(null, this.validators),
    });
  }
}
