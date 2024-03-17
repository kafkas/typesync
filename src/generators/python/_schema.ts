import type { schema } from '../../schema';
import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from '../../schema/abstract';
import type {
  AliasModel,
  DocumentModel,
  FieldType,
  ListType,
  ObjectType,
  Schema,
  TupleType,
  UnionType,
} from '../../schema/generic';

export type FlatType =
  | schema.types.Primitive
  | schema.types.Literal
  | FlatTupleType
  | FlatListType
  | FlatUnionType
  | schema.types.Alias;

export type FlatTupleType = TupleType<FlatType>;
export type FlatListType = ListType<FlatType>;
export type FlatObjectType = ObjectType<FlatType>;
export type FlatFieldType = FieldType<FlatType>;
export type FlatUnionType = UnionType<FlatType>;
export type FlatAliasModel = AliasModel<FlatType | FlatObjectType | schema.types.Enum>;
export type FlatDocumentModel = DocumentModel<FlatType, FlatFieldType>;
export type FlatModel = FlatAliasModel | FlatDocumentModel;
export type FlatSchema = Schema<FlatAliasModel, FlatDocumentModel>;

class FlatSchemaImpl extends AbstractSchema<FlatAliasModel, FlatDocumentModel> implements FlatSchema {
  public clone() {
    const { aliasModelsById, documentModelsById } = this.cloneMaps();
    return new FlatSchemaImpl(aliasModelsById, documentModelsById);
  }
}

class FlatAliasModelImpl
  extends AbstractAliasModel<FlatType | FlatObjectType | schema.types.Enum>
  implements FlatAliasModel
{
  public clone() {
    return new FlatAliasModelImpl(this.name, this.docs, this.cloneValue());
  }
}

class FlatDocumentModelImpl extends AbstractDocumentModel<FlatFieldType> implements FlatDocumentModel {
  public clone() {
    return new FlatDocumentModelImpl(this.name, this.docs, this.cloneFieldsById());
  }
}

interface CreateFlatAliasModelParams {
  name: string;
  docs: string | undefined;
  value: FlatType | FlatObjectType | schema.types.Enum;
}

export function createFlatAliasModel(params: CreateFlatAliasModelParams): FlatAliasModel {
  return new FlatAliasModelImpl(params.name, params.docs, params.value);
}

interface CreateFlatDocumentModelParams {
  name: string;
  docs: string | undefined;
  fieldsById: Record<string, FlatFieldType>;
}
export function createFlatDocumentModel(params: CreateFlatDocumentModelParams): FlatDocumentModel {
  return new FlatDocumentModelImpl(params.name, params.docs, params.fieldsById);
}

export function createFlatSchema(): FlatSchema {
  return new FlatSchemaImpl(new Map(), new Map());
}
