import {GameSettingsField} from "@pages/game/types/game-settings.type";

export const FIELDS: GameSettingsField[] = [
  {
    name: 'fallingSpeed',
    label: 'Falling Speed',
    placeholder: 'Enter ball falling speed',
  },
  {
    name: 'fallingFrequency',
    label: 'Falling Frequency',
    placeholder: 'Enter ball falling frequency',
  },
  {
    name: 'playerSpeed',
    label: 'Player Speed',
    placeholder: 'Enter player speed',
  },
  {
    name: 'gameTime',
    label: 'Game Time',
    placeholder: 'Enter game time',
  },
];
