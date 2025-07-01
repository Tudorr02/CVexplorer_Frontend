import { EducationLevel } from "../enums/education-level.enum";
import { PositionLevel } from "../enums/position-level.enum";

export interface Position{
  publicId?: string; 
  name: string;
  requiredSkills: string[];
  niceToHave: string[];
  languages: string[];
  certifications: string[];
  responsibilities: string[];
  minimumExperienceMonths: number;
  level: PositionLevel;
  minimumEducationLevel: EducationLevel;
  weights: ScoreWeights;
}

export interface ScoreWeights {
  requiredSkills: number ;
  niceToHave: number;
  languages: number;
  certifications: number;
  responsibilities: number;
  experienceMonths: number;
  level: number;
  minimumEducation: number;

}