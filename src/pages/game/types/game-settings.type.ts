import {FormControl} from "@angular/forms";

type GameSettings = {
  fallingSpeed: number;
  fallingFrequency: number;
  playerSpeed: number;
  gameTime: number;
};

export type GameState = {
  caughtObjects: number;
  timeRemaining: number;
};

export type GameSettingsForm = {
  [K in keyof GameSettings]: FormControl<GameSettings[K] | null>;
};

export type GameSettingsFormValue = {
  [K in keyof GameSettings]: GameSettings[K] | null;
};

export type GameSettingsField = {
  name: keyof GameSettingsForm;
  label: string;
  placeholder: string;
};

export type PlayerMoveEvent = {
  event: KeyboardEvent;
  speed: number;
};
