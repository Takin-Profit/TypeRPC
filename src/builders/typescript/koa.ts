import {Code, CodeBuilder} from '..'
import {Interface, Method, Param, Property, Schema, TypeDef} from '../../schema'
import {capitalize, fileHeader, lowerCase} from '../utils'
import {dataType} from './helpers'

const logger = `
interface ErrLogger {
  error(message: string, ...meta: any[]): void;
}

const defaultLogger: ErrLogger = {
  error(message: string, ...meta) {
    console.log(\`error occurred :\${message}, info: \${meta}\`)
  }
}`
const handleOptional = (isOptional: boolean): string => isOptional ? '?' : ''
const buildProps = (props: Property[]): string => {
  let propsString = ''
  for (const prop of props) {
    propsString = propsString.concat(`${prop.name}${handleOptional(prop.isOptional)}: ${dataType(prop.type)}\n`)
  }
  return propsString
}
const buildType = (type: TypeDef): string => {
  return `
export type ${capitalize(type.name)} = {
  ${buildProps(type.properties)}
}\n`
}

const buildTypes = (schema: Schema): string => {
  let types =  ''
  for (const type of schema.types) {
    types = types.concat(buildType(type))
  }
  return types
}

const buildParams = (params: Param[]): string => {
  let paramsString = ''
  const optionals = params.filter(param => param.isOptional)
  const sorted = params.filter(param => !param.isOptional).concat(optionals)
  for (let i = 0; i < sorted.length; i++) {
    const useComma = i === sorted.length - 1 ? '' : ','
    paramsString = paramsString.concat(`${sorted[i].name}: ${dataType(sorted[i].type)}${useComma}`)
  }
  return paramsString
}

const buildMethod = (method: Method): string => {
  return `async ${lowerCase(method.name)}(${buildParams(method.params)}): Promise<${dataType(method.returnType)}>;\n`
}

const buildMethods = (methods: Method[]): string => {
  let methodsString = ''
  for (const method of methods) {
    methodsString = methodsString.concat(buildMethod(method))
  }
  return methodsString
}

const buildInterface = (interfc: Interface): string => {
  return `
export interface ${capitalize(interfc.name)} {
  ${buildMethods(interfc.methods)}
}\n`
}

const buildInterfaces = (interfaces: Interface[]): string => {
  let interfacesString = ''
  for (const interfc of interfaces) {
    interfacesString = interfacesString.concat(buildInterface(interfc))
  }
  return interfacesString
}

const buildPath = (method: Method): string => {
  if (method.isGet || !method.hasParams) {
    return `/${method.name}`
  }
  let params = ''
  for (const param of method.params) {
    params = params.concat(`:${param.name}`)
  }
  return `/${method.name}/${params}`
}

const questionMark =  (isOptional: boolean) => isOptional ? '?' : ''

const paramNames = (params: Param[]) => {
  let names = ''
  for (let i = 0; i < params.length; i++) {
    const useComma = i === params.length - 1 ? '' : ', '
    names = names.concat(`${params[i].name}${useComma}`)
  }
  return names
}

const paramsType = (params: Param[]): string => {
  let paramsTypeString = ''
  for (let i = 0; i < params.length; i++) {
    const useComma = i === params.length - 1 ? '' : ', '
    paramsTypeString = paramsTypeString.concat(`${params[i].name}${questionMark(params[i].isOptional)}: ${dataType(params[i].type)}${useComma}`)
  }
  return paramsTypeString
}
const parseParams = (params: Param[]): string => `
  const {${paramNames(params)}: {${paramsType(params)}} = ctx.params
  `

const methodCallNoParams = (interfaceName: string, method: Method): string => {
  const invoke = `const response =  await ${interfaceName}.${method.name}()\n`
  if (method.hasCborReturn) {
    return invoke.concat(`
    ctx.body = await encodeAsync({data: response})
  `)
  }
  return invoke.concat('ctx.body = {data: response} ')
}

const methodCallNoReturn = (interfaceName: string, method: Method): string => {
  if (method.isGet) {
    return `${parseParams(method.params)}`
  }
  if (metho)
}

const methodCallNoParamsNoReturn = (interfaceName: string, method: Method): string => {

}

const methodCallWithParamsAndReturn = (interfaceName: string, method: Method): string => {

}
const methodCall = (interfaceName: string, method: Method): string => {
  const invoke = ''
  if (!method.hasParams) {

  }
  if (method.isGet) {

  }
}

const setContentType = (method: Method): string => method.hasCborReturn ? 'ctx.type = application/cbor' : ''

const buildHandler = (interfaceName: string, method: Method): string =>  {
  return `
router.${method.httpVerb.toLowerCase()}('${interfaceName}/${method.name}', /${buildPath(method)}, async ctx => {
    try {
      ${setContentType(method)}
      ctx.status = ${method.responseCode}

      ${methodCall(interfaceName, method)}
    } catch (e) {
      logger.error(e)
      ctx.throw(${method.errorCode}, e.message)
    }
	} )
`
}

const buildRoutes = (interfc: Interface): string => {
  return `
export const ${lowerCase(interfc.name)}Routes = (${lowerCase(interfc.name)}: ${capitalize(interfc.name)}, logger: ErrLogger = defaultLogger): Middleware<Koa.ParameterizedContext<any, Router.RouterParamContext>> => {
	const router = new Router<any, {}>({
		prefix: '/${interfc.name}/',
		sensitive: true
	})

	return router.routes()
}\n
`
}

const buildImports = (schema: Schema): string => {
  const cbor = `
import {
	decodeFirst,
	encodeAsync,
} from 'cbor'`
  const useCbor = schema.hasCbor ? cbor : ''
  return `
import Router, {Middleware} from '@koa/router'
${useCbor}
  `
}
const buildFile = (schema: Schema): Code => {
  const source = `
${buildImports(schema)}
${fileHeader()}
${logger}
${buildTypes(schema)}
${buildInterfaces(schema.interfaces)}
`
  return {fileName: schema.fileName + '.ts', source}
}

const builder = (schemas: Schema[]): Code[] => schemas.map(schema => buildFile(schema))

export const KoaBuilder:  CodeBuilder = {
  lang: 'ts',
  target: 'server',
  framework: 'koa',
  builder,
}
