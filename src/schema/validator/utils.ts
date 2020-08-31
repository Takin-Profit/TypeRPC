import {
  MethodSignature,
  Node,
  ParameterDeclaration,
  PropertySignature,
  SourceFile,
  TypeAliasDeclaration,
  TypeNode,
} from 'ts-morph'
import {containers, make} from '../types'
import {parseNamedImports} from '../parser'

// is the type found is a typerpc scalar type?
export const isScalar = (type: TypeNode | Node): boolean => Boolean(make.scalar(type))

// is the type found a typerpc container type?
export const isContainer = (type: TypeNode | Node): boolean => containers.some(container => type.getText().trim().startsWith(container))

// is the type alias or node an rpc.Msg?
export const isMsg = (type: TypeAliasDeclaration | PropertySignature | ParameterDeclaration): boolean =>
  Boolean(type.getTypeNode()?.getText().startsWith('rpc.Msg'))

const getTypeNodeText = (type: TypeAliasDeclaration): string|undefined => type.getTypeNode()?.getText()

// is the type alias an rpc.QuerySvc?
export const isQuerySvc = (type: TypeAliasDeclaration): boolean => Boolean(getTypeNodeText(type)?.trim().startsWith('rpc.QuerySvc'))

// determines if the type alias an rpc.MutationSvc
export const isMutationSvc = (type: TypeAliasDeclaration): boolean => Boolean(getTypeNodeText(type)?.trim().startsWith('rpc.MutationSvc'))

// determines if the type alias is a valid rpc.Msg that was either
// defined is this file or imported from another file in this project.
export const isValidMsg = (type: TypeNode | Node): boolean => {
  const file = type.getSourceFile()
  const typeText = type.getText().trim()
  const isLocal = file.getTypeAliases().flatMap(alias => alias.getName()).includes(typeText)
  const isImported = parseNamedImports(file).includes(typeText)
  return isLocal || isImported
}

// A ts-morph declaration found in a schema file that has a getName() method
// E.G. FunctionDeclaration, VariableDeclaration
interface GetNameViolator {
  getName(): string | undefined;

  getStartLineNumber(includeJsDocComments?: boolean): number;

  getKindName(): string;

  getSourceFile(): SourceFile;
}

const canGetName = (type: Violator): type is GetNameViolator => 'getName' in type
// A ts-morph declaration found in a schema that does not have a getName() method
// but does have a getText() method

interface GetTextViolator {
  getText(includeJsDocComments?: boolean): string;

  getStartLineNumber(includeJsDocComments?: boolean): number;

  getKindName(): string;

  getSourceFile(): SourceFile;
}

// Anything that is not a type alias is a violator
export type Violator = GetNameViolator | GetTextViolator

// Returns an error about number of schema violation
export const multiValidationErr = (violators: Violator[]): Error =>
  new Error(`${violators[0].getSourceFile().getFilePath()?.toString()} contains ${violators.length} ${violators[0].getKindName()} declarations
   errors: ${violators.map(vio => canGetName(vio) ? vio.getName()?.trim() : vio.getText().trim() + ', at line number: ' + String(vio?.getStartLineNumber()) + '\n')}
   message: typerpc schemas can only contain a single import statement (import {t} from '@typerpc/types'), typeAlias (message), and interface (service) declarations.`)

// Returns a single schema violation error
export const singleValidationErr = (node: Node | undefined, msg: string): Error => {
  return new Error(
    `error in file: ${node?.getSourceFile()?.getFilePath()}
     at line number: ${node?.getStartLineNumber()}
     message: ${msg}`)
}

// error message for generic messages
const genericsErrMsg = (type: TypeAliasDeclaration | MethodSignature) => `${type.getName().trim()} defines a generic type . typerpc types and methods cannot be generic`

// validates that a type alias or method is not generic
export const validateNotGeneric = (type: TypeAliasDeclaration | MethodSignature): Error[] => {
  return type.getTypeParameters().length > 0 ? [singleValidationErr(type, genericsErrMsg(type))] : []
}

// is the node an rpc.Msg literal?
export const isMsgLiteral = (type: TypeNode| Node): boolean => type.getText().trim().startsWith('rpc.Msg<{')

// is the node a valid typerpc data type?
export const isValidDataType = (type: TypeNode| Node | undefined): boolean => {
  if (typeof type === 'undefined') {
    return false
  }
  return isScalar(type) || isContainer(type) || isValidMsg(type) || isMsgLiteral(type)
}
