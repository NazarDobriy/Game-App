import {ChangeDetectionStrategy, Component, DestroyRef, OnInit} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {FormGroup} from "@angular/forms";

import {GameService} from "@pages/game/providers/game.service";
import {FIELDS} from "@pages/game/constants/game-settings.constants";
import {GameSettingsField, GameSettingsForm, GameSettingsFormValue} from "@pages/game/types/game-settings.type";
import {GameSettingsFormService} from "@pages/game/components/game-settings/providers/game-settings-form.service";

@Component({
  selector: 'app-game-settings',
  templateUrl: './game-settings.component.html',
  styleUrl: './game-settings.component.scss',
  providers: [GameSettingsFormService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSettingsComponent implements OnInit {
  form: FormGroup<GameSettingsForm> | null = null;
  readonly fields: GameSettingsField[] = FIELDS;

  constructor(
    public gameSettingsFormService: GameSettingsFormService,
    private gameService: GameService,
    private destroyRef: DestroyRef,
  ) {
    this.form = this.gameSettingsFormService.form;
  }

  ngOnInit(): void {
    this.form?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
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
