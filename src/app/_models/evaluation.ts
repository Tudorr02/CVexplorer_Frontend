import { EducationLevel } from "../enums/education-level.enum";
import { PositionLevel } from "../enums/position-level.enum";
import { Position } from "./position";

export interface Evaluation {
    fileData?: string;
    score?: number;
    evaluation : CvEvaluationResult;
    positionData: Position;
}

export interface ScoreScrapedField<TScraped> {
    scraped: TScraped;
    score:   number;
    
}
  
export interface ScoreValueField<TValue> {
    value: TValue;
    score: number;
}

export interface CvEvaluationResult {
    candidateName: string;
  
    requiredSkills:        ScoreScrapedField<string[]>;
    niceToHave:            ScoreScrapedField<string[]>;
    languages:             ScoreValueField<string[]>;
    certifications:        ScoreScrapedField<string[]>;
    responsibilities:      ScoreScrapedField<string[]>;
    minimumExperienceMonths: ScoreValueField<number>;
    level:                 ScoreValueField<EducationLevel>;
    minimumEducationLevel: ScoreValueField<PositionLevel>;
  }