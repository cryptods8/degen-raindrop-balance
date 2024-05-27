import { CamelCasePlugin } from "kysely";
import { createKysely } from "@vercel/postgres-kysely";

import { Database } from "./types";

export const pgDb = createKysely<Database>(
  {},
  {
    plugins: [new CamelCasePlugin()],
  }
);
