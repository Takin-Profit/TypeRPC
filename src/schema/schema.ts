import {DataType} from './types/data-type'

export type HTTPVerb = 'POST' | 'GET'

export type HTTPErrCode = 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 |  409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 |  418 | 422 | 425 | 426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511

export type HTTPResponseCode = 200 | 201 | 202 | 203 | 204 | 205 | 206 |300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308

export type Param = Readonly<{
  name: string;
  type: DataType;
  isOptional: boolean;
}>

export type Method = Readonly<{
  name: string;
  params:  ReadonlyArray<Param>;
  returnType: DataType;
  // serialize|deserialize params using cbor ?
  hasCborParams:  boolean;
  // serialize|deserialize return type using cbor ?
  hasCborReturn:  boolean;
  // method has parameters ?
  hasParams:  boolean;
  // does method Htt Verb === 'GET'
  isGet: boolean;
  isVoidReturn: boolean;
  // Type Of Http Verb this method uses. E.G. GET, POST, ...
  httpVerb: HTTPVerb;
  // HTTP Response Status code for successful requests
  responseCode: HTTPResponseCode;
  // HTTP Response Status code for failed requests
  errorCode: HTTPErrCode;
}>

export type Property = Readonly<{
  name: string;
  type: DataType;
  isOptional: boolean;
}>

export type Service = Readonly<{
  name: string;
  methods: ReadonlyArray<Method>;
  // If true, use CBOR instead of Json for all param
  // and return type of all this service's methods.
  useCbor: boolean;
}>

// rpc.Msg from schema file
export type Message = Readonly<{
  name: string;
  isExported: boolean;
  properties: ReadonlyArray<Property>;
}>

export type Import = Readonly<{
    // names of imported messages
    messageNames: ReadonlyArray<string>;
    // path to the file they are imported from
    filePath: string;
}>
export type Schema = Readonly<{
  // Name of the file this schema was generated from without extension.
  fileName: string;
  imports: ReadonlyArray<Import>;
  messages: ReadonlyArray<Message>;
  services: ReadonlyArray<Service>;
  hasCbor: boolean;
}>
