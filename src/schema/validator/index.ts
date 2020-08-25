import {SourceFile} from 'ts-morph'
import {validateDeclarations} from './declarations'
import {validateMessages} from './message'
import {isErrCode, isResponseCode, validateServices} from './service'
import {isContainer, isHttpVerb, isMsg, isMsgLiteral, isService, isValidDataType} from './utils'

const validateSchema = (file: SourceFile): Error[] => {
  return [
    ...validateDeclarations(file),
    ...validateMessages(file),
    ...validateServices(file),
  ]
}

export const validateSchemas = (schemas: SourceFile[]): Error[] =>
  schemas.flatMap(schema => [...validateSchema(schema)])

export {isMsg, isMsgLiteral, isService, isContainer, isHttpVerb,  isValidDataType, isErrCode, isResponseCode}
