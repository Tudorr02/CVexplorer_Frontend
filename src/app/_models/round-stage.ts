import { RoundEntry } from "./round-entry";

export interface RoundStage {
  name: string;
  ordinal: number;
  entries: RoundEntry[];

}