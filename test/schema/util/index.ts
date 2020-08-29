import {Project, SourceFile} from 'ts-morph'
import {randomNumber} from './data-gen'
import {genMsgNames, genRpcMessages, genTestMessageFiles} from './message-gen'
import {genServices} from './service-gen'

export {genTestMessageFiles, genMsgNames, genRpcMessages, genServices}

export const testQuerySvc = `
type TestQuerySvc = rpc.QuerySvc<{
  /**
   * @throws 404
   * @returns 200
   */
  getSomethingById(id: number): string;

  /**
   * @throws 500
   * @returns 202
   */
  addSomething(something: any): any;

  /**
   * @throws 401
   * @returns 201
   */
  addSomethingElse(something: any): any;

  /**
   * @throws 400
   * @returns 204
   */
  deleteSomething(something: any): any;

  /**
   * @throws 403
   * @returns 301
   */
  preRequest(): boolean;

  /**
   * @access OPTIONS
   */
  getOpts(): string[];

  /**
   * @access PATCH
   */
  updateSomething(something: any): string;
}`

export const genSourceFile = (source: string, project: Project, name = 'test.ts'): SourceFile =>
  project.createSourceFile(name, source, {overwrite: true})

export const genSourceFiles = (sources: [string, string][], project: Project): SourceFile[] => {
  for (const [name, source] of sources) {
    project.createSourceFile(name, source)
  }
  return project.getSourceFiles()
}
export const makeStructTestSource = `
  /** @kind cbor */
type CborType = rpc.Msg<{}>

/** @kind cbor */
type AnotherCbor = rpc.Msg<{}>
type TestType1 = {
  prop1: CborType;
  prop2: AnotherCbor;
}

/**
*
*/
type NoCbor = rpc.Msg<{}>

type MoreNoCbor = rpc.Msg<{}>

type TestType2 = {
  prop1: NoCbor;
  prop2: MoreNoCbor;
}
`
export const optional = () => randomNumber(0, 4) === 1 ? '?' : ''
export const useCbor = () => randomNumber(0, 5) === 1 ? `
  /**
 * @kind cbor
 */
 ` : ''

export const exportTestMessages = `
export type ExportedType = rpc.Msg<{
  name: $.str
}>

type NonExportedType = rpc.Msg<{
  name: $.str
}>
`
export const genImports = (msgNames: string[]): string => {
  let imports = ''
  let i = 0
  while (i < msgNames.length) {
    const useComma = i === msgNames.length - 1 ? '' : ', '
    imports = imports.concat(msgNames[i] + useComma)
    i++
  }
  return `import {${imports}} from './dummy-file'\n`
}

export const hasCborParamsTestData = `

/** @kind cbor */
type CborParam = rpc.Msg<{}>
type TestService1 = rpc.MutationSvc<{
  method1(param: CborParam, param2: $.str): $.List<$.int8>;
  method2(param: $.int8): CborParam;
}>

type TestService2 = rpc.MutationSvc<{
  /** @kind cbor */
  method1(param: $.str, param2: $.int8): $.unit;
  method2(param: $.str, param3: $.int16): $.nil;
}>

type TestService3 = rpc.MutationSvc<{
  method1(param: $.str): $.unit;
}>
`

export const genTestFile = () => {
  const names = genMsgNames()
  const names2 = genMsgNames()
  const messages = genRpcMessages(names, names2)
  const queryServices = genServices('Query', names)
  const mutationServices = genServices('Mutation', names)
  const imports = genImports(names2)
  return imports.concat(messages).concat(queryServices).concat(mutationServices)
}

export const  isValidDataTypeTestSource = `
  type Valid = rpc.Msg<{
      dummy: $.str
  }>
  type SomeSvc = rpc.Msg<{
      invalidType = string
      validType = $.str
      inValid = rpc.Ms<{
      name: $.str
      }>
      valid = $.int8
      invalid1 = $.int
      valid1 = $.uint8
      invalid2 = Who
      valid2 = Valid
  }>
`

export const typesTestData = `
import {SomeStruct} from './somewhere'

type TestType = rpc.Msg<{
  dict: $.Dict<$.int8, $.int8>
  tuple2: $.Tuple2<$.int8, $.int8>
  tuple3: $.Tuple3<$.int8, $.int8, $.int8>
  tuple4: $.Tuple4<$.int8, $.str, $.str, $.str>
  tuple5: $.Tuple5<$.str, $.bool, $.bool, $.str, $.bool>
  list: $.List<$.bool>
  struct: SomeStruct
  structLiteral: rpc.Msg<{name: $.str, age: $.int8}>
}>`
