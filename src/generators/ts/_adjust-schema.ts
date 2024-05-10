import { schema } from '../../schema/index.js';

export function adjustSchemaForTS(prevSchema: schema.Schema): schema.ts.Schema {
  // Currently no adjustment needed for TS
  const { aliasModels, documentModels } = prevSchema;
  const newAliasModels = aliasModels.map(m =>
    schema.ts.createAliasModel({ name: m.name, docs: m.docs, value: m.type })
  );
  const newDocumentModels = documentModels.map(m =>
    schema.ts.createDocumentModel({ name: m.name, docs: m.docs, type: m.type })
  );
  return schema.ts.createSchemaWithModels([...newAliasModels, ...newDocumentModels]);
}
