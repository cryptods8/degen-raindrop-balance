import { Generated, Selectable } from "kysely";

export interface Database {
  degen_raindrop: DegenRainDropTable;
}

export interface DegenRainDropTable {
  id: Generated<number>;
  createdAt: Date;

  fromFid: string;
  value: number;
  originalText: string;
  castHash: string;
  castTimestamp: Date;
  rootParentUrl: string | null;
  parentUrl: string | null;
}

export type DBDegenRaindrop = Selectable<DegenRainDropTable>;
