import { assert, assertNever } from '../util/assert.js';
import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from './abstract.js';
import {
  Alias,
  AliasModel as AliasModelGeneric,
  DiscriminatedUnion as DiscriminatedUnionGeneric,
  DocumentModel as DocumentModelGeneric,
  ObjectField as ObjectFieldGeneric,
  Object as ObjectGeneric,
  Schema as SchemaGeneric,
  StringLiteral,
  Type as TypeGeneric,
} from './generic.js';

export interface CreateAliasModelParams<AliasParameterType> {
  name: string;
  docs: string | null;
  value: AliasParameterType;
}

export interface CreateDocumentModelParams<DocumentParameterType> {
  name: string;
  docs: string | null;
  type: DocumentParameterType;
}

export class AliasModel<AliasParameterType>
  extends AbstractAliasModel<AliasParameterType>
  implements AliasModelGeneric<AliasParameterType>
{
  public clone() {
    return new AliasModel(this.name, this.docs, this.cloneType());
  }
}

export class DocumentModel<DocumentParameterType>
  extends AbstractDocumentModel<DocumentParameterType>
  implements DocumentModelGeneric<DocumentParameterType>
{
  public clone() {
    return new DocumentModel(this.name, this.docs, this.cloneType());
  }
}

interface ResolvedDiscriminatedUnionObjectVariant<ObjectType> {
  type: 'object-variant';
  objectType: ObjectType;
  discriminantType: StringLiteral;
}

interface ResolvedDiscriminatedUnionAliasVariant<ObjectType> {
  type: 'alias-variant';
  aliasType: Alias;
  originalObjectType: ObjectType;
  discriminantType: StringLiteral;
}

type ResolvedDiscriminatedUnionVariant<O> =
  | ResolvedDiscriminatedUnionObjectVariant<O>
  | ResolvedDiscriminatedUnionAliasVariant<O>;

export class Schema<
    T extends TypeGeneric<T>,
    AliasParameterType extends TypeGeneric<T>,
    DocumentParameterType extends TypeGeneric<T>,
    ObjectType extends ObjectGeneric<ObjectFieldGeneric<T>>,
    DiscriminatedUnionType extends DiscriminatedUnionGeneric<Alias | ObjectType>,
  >
  extends AbstractSchema<AliasModel<AliasParameterType>, DocumentModel<DocumentParameterType>>
  implements SchemaGeneric<AliasModel<AliasParameterType>, DocumentModel<DocumentParameterType>>
{
  public clone() {
    return this.cloneModels(
      new Schema<T, AliasParameterType, DocumentParameterType, ObjectType, DiscriminatedUnionType>()
    );
  }

  public resolveDiscriminatedUnionVariants(t: DiscriminatedUnionType) {
    return t.variants.map((variant): ResolvedDiscriminatedUnionVariant<ObjectType> => {
      if (variant.type === 'object') {
        const { fields } = variant;
        const discriminantField = fields.find(f => f.name === t.discriminant);
        assert(discriminantField?.type.type === 'string-literal');
        return {
          type: 'object-variant',
          objectType: variant,
          discriminantType: discriminantField.type,
        };
      } else if (variant.type === 'alias') {
        const aliasModel = this.getAliasModel(variant.name);
        assert(aliasModel?.type.type === 'object');
        // TODO: Fix this
        // @ts-ignore
        const originalObjectType = aliasModel.type as ObjectType;
        const discriminantField = aliasModel.type.fields.find(f => f.name === t.discriminant);
        assert(discriminantField?.type.type === 'string-literal');
        return {
          type: 'alias-variant',
          aliasType: variant,
          originalObjectType,
          discriminantType: discriminantField.type,
        };
      } else {
        assertNever(variant);
      }
    });
  }

  public validateType(_t: unknown) {
    // TODO: Implement
  }
}

export class SchemaFactory<
  T extends TypeGeneric<T>,
  AliasParameterType extends TypeGeneric<T>,
  DocumentParameterType extends TypeGeneric<T>,
  ObjectType extends ObjectGeneric<ObjectFieldGeneric<T>>,
  DiscriminatedUnionType extends DiscriminatedUnionGeneric<Alias | ObjectType>,
> {
  public createSchema() {
    return this.createSchemaWithModels([]);
  }

  public createSchemaWithModels(models: (AliasModel<AliasParameterType> | DocumentModel<DocumentParameterType>)[]) {
    const s = new Schema<T, AliasParameterType, DocumentParameterType, ObjectType, DiscriminatedUnionType>();
    s.addModelGroup(models);
    return s;
  }

  public createAliasModel(params: CreateAliasModelParams<AliasParameterType>) {
    const { name, docs, value } = params;
    return new AliasModel(name, docs, value);
  }

  public createDocumentModel(params: CreateDocumentModelParams<DocumentParameterType>) {
    const { name, docs, type } = params;
    return new DocumentModel(name, docs, type);
  }
}
