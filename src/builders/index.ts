import {Schema} from '../schema'

export type Code = {
  readonly fileName: string;
  readonly source: string;
}

export type ProgrammingLanguage = 'go' | 'dart' | 'ts' | 'js' | 'ruby' | 'python' | 'C#' | 'F#' | 'vb' | 'java' | 'kotlin' | 'java' | 'scala' | 'groovy' | 'rust' | 'C' | 'C++' | 'reason' | 'ocaml' | 'haskell' | 'php' | 'clojure' | 'elixir' | 'purescript' | 'ada' | 'D' | 'nim' | 'smalltalk' | 'julia' | 'R' | 'lua' | 'tcl' | 'prolog' | 'erlang' | 'object pascal' | 'delphi' | 'self' | 'ceylon' | 'coffeescript' | 'swift' | 'elm' | 'eiffel' | 'hack' | 'haxe' | 'idris' | 'jython' | 'jruby' | 'objective-c' | 'pascal' | 'moonscript'

export type Target = 'client' | 'server'

export type CodeBuilder = {
  readonly lang: ProgrammingLanguage;
  readonly target: Target;
  readonly framework: string;
  readonly builder: (schemas: ReadonlySet<Schema>) => ReadonlySet<Code>;
}