
export interface ExhibitStats {
  stamina: number;
  intelligence: number;
  laziness: number;
  charm: number;
}

export interface ExhibitData {
  scientificName: string;
  dangerLevel: string;
  classification: string;
  description: string;
  funFact: string;
  stats: ExhibitStats;
}

export interface UserInput {
  name: string;
  hobby: string;
  worry: string;
}
