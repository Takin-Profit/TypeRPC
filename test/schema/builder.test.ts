/* eslint-disable new-cap */
import {Project} from 'ts-morph'
import {prims} from '../../src/schema/types'

import {genSourceFile, makeStructTestSource, makeTestFile, makeTestFiles, testController, testProp} from './util'
import {containers} from '../../src/schema/types/data-type'
import {is} from '../../src/schema'

const {
  isType,
  useCbor,
  buildSchema,
  buildMethod,
  buildParams,
  buildProps,
  buildTypes,
  buildHttpVerb,
  buildErrCode,
  buildResponseCode,
  makeDataType,
} = internalTesting

let project: Project
beforeEach(() => {
  project = new Project()
})

test('buildMethod() should return method with correct params and return type', () => {
  const interfaces = makeTestFile(project).getInterfaces()
  const methods = interfaces.flatMap(interfc => interfc.getMethods())
  for (const method of methods) {
    const builtMethod = buildMethod(method)
    expect(method.getReturnTypeNode()!.getText().trim()).toEqual(builtMethod.returnType.toString())
    expect(method.getNameNode().getText().trim()).toEqual(builtMethod.name)
    expect(method.getParameters().length).toEqual(builtMethod.params.length)
  }
})

test('buildSchema() should have correct name, num messages, and num services', () => {
  for (const source of makeTestFiles(project)) {
    const schema = buildSchema(source)
    expect(schema.fileName).toEqual(source.getBaseNameWithoutExtension())
    expect(schema.services.length).toEqual(source.getInterfaces().length)
    expect(schema.messages.length).toEqual(source.getTypeAliases().length)
  }
})

test('makeStruct() should return a struct with correct useCbor param set', () => {
  const file = genSourceFile(makeStructTestSource, project)
  const hasCbor = file.getTypeAlias('TestType1')!.getTypeNode()!.forEachChildAsArray()
  const noCbor = file.getTypeAlias('TestType2')!.getTypeNode()!.forEachChildAsArray()
  for (const node of hasCbor) {
    const type = makeDataType(getTypeNode(node))
    expect(is.Struct(type)).toBeTruthy()
    if (is.Struct(type)) {
      expect(type.useCbor).toBeTruthy()
    }
  }
  for (const node of noCbor) {
    const type = makeDataType(getTypeNode(node))
    expect(is.Struct(type)).toBeTruthy()
    if (is.Struct(type)) {
      expect(type.useCbor).toBeFalsy()
    }
  }
})
