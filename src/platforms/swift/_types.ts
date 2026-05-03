export interface Any {
  readonly type: 'any';
}

export interface Nil {
  readonly type: 'nil';
}

export interface String {
  readonly type: 'string';
}

export interface Bool {
  readonly type: 'bool';
}

export interface Int {
  readonly type: 'int';
}

export interface Double {
  readonly type: 'double';
}

export interface Date {
  readonly type: 'date';
}

export type Primitive = Any | Nil | String | Bool | Int | Double | Date;

export interface Tuple {
  readonly type: 'tuple';
  readonly elements: Type[];
}

export interface List {
  readonly type: 'list';
  readonly elementType: Type;
}

export interface Dictionary {
  readonly type: 'dictionary';
  readonly valueType: Type;
}

export interface Alias {
  readonly type: 'alias';
  readonly name: string;
}

export type Type = Primitive | Tuple | List | Dictionary | Alias;

export interface StringEnum {
  readonly type: 'string-enum';
  readonly cases: StringEnumCase[];
}

export interface StringEnumCase {
  readonly key: string;
  readonly value: string;
}

export interface IntEnum {
  readonly type: 'int-enum';
  readonly cases: IntEnumCase[];
}

export interface IntEnumCase {
  readonly key: string;
  readonly value: number;
}

export interface DiscriminatedUnionEnum {
  readonly type: 'discriminated-union-enum';
  readonly discriminant: string;
  readonly values: DiscriminatedUnionEnumCase[];
}

export interface DiscriminatedUnionEnumCase {
  readonly discriminantValue: string;
  readonly structName: string;
}

export interface SimpleUnionEnum {
  readonly type: 'simple-union-enum';
  readonly values: SimpleUnionEnumCase[];
}

export interface SimpleUnionEnumCase {
  readonly type: Type;
}

export interface Struct {
  readonly type: 'struct';
  /**
   * When non-null, the struct is a Firestore document model and the renderer
   * emits a `@DocumentID var <name>: String?` property whose value the
   * Firebase SDK populates from the document path. Null for alias-derived
   * structs that are not document models. Modeled as an object (rather than a
   * boolean) so the property name can become user-configurable in the future
   * without changing the type contract.
   */
  readonly documentIdProperty: DocumentIdProperty | null;
  readonly literalProperties: LiteralStructProperty[];
  readonly regularProperties: RegularStructProperty[];
}

/** Description of the auto-generated `@DocumentID` property on a document struct. */
export interface DocumentIdProperty {
  /** Property name in the generated Swift struct. Defaults to `id`. */
  readonly name: string;
}

export interface LiteralStructProperty {
  /** Field name as written to Firestore (the schema field name). */
  readonly originalName: string;
  /**
   * Property name in the generated Swift struct. Always equal to
   * `camelCase(originalName)` for now; literal properties are not user
   * remappable.
   */
  readonly name: string;
  readonly docs: string | null;
  readonly type: String | Bool | Int;
  readonly literalValue: string;
}

export interface RegularStructProperty {
  /** Field name as written to Firestore (the schema field name). */
  readonly originalName: string;
  /**
   * Property name in the generated Swift struct. Resolved by the generator
   * from `swift.name` if the user provided it, else `camelCase(originalName)`.
   */
  readonly name: string;
  readonly optional: boolean;
  readonly docs: string | null;
  readonly type: Type;
}
