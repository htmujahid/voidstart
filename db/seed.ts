import { defineSeed } from "void/seed";

const SAMPLE_PROJECTS = [{ name: "Sample project", slug: "sample-project" }];

export default defineSeed<typeof import("./schema")>(async ({ db, schema }) => {
  await db.insert(schema.projects).values(SAMPLE_PROJECTS);
});
