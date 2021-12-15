import { ParseTypeOptions } from "./parse.js"
import { ElementOf, TreeOf } from "@re-/utils"
import { Num, StringLiteral } from "./definition"

export type ControlCharacters = [
    "|",
    "?",
    "(",
    ")",
    ",",
    "[",
    "]",
    "=",
    ">",
    " "
]

export type ControlCharacter = ElementOf<ControlCharacters>

// These are the non-literal types we can extract from a value at runtime
export const namedExtractableTypes = {
    bigint: BigInt(0),
    true: true as true,
    false: false as false,
    null: null,
    symbol: Symbol(),
    undefined: undefined,
    function: (...args: any[]) => null as any
}

export type NamedExtractableTypeMap = typeof namedExtractableTypes

export type ExtractableTypeName = keyof NamedExtractableTypeMap

export type ExtractableType =
    | ExtractableTypeName
    | StringLiteral.Definition
    | Num.Definition

export type ExtractableDefinition = TreeOf<ExtractableType, true>

/**
 * These types can be used to specify a type definition but
 * will never be used to represent a value at runtime, either
 * because they are abstract type constructs (e.g. "never") or
 * because a more specific type will always be from (e.g.
 * "boolean", which will always evaluate as "true" or "false")
 */
let placeholder: any
export const unextractableTypes = {
    unknown: placeholder as unknown,
    any: placeholder as any,
    object: placeholder as object,
    boolean: placeholder as boolean,
    void: placeholder as void,
    never: placeholder as never,
    string: placeholder as string,
    number: placeholder as number
}
export type UnextractableTypes = typeof unextractableTypes

export type UnextractableTypeName = keyof UnextractableTypes

export const builtInTypes = { ...namedExtractableTypes, ...unextractableTypes }

export type BuiltInTypes = typeof builtInTypes

export type BuiltInTypeName = keyof BuiltInTypes

export * from "./errors.js"

// Allow a user to extract types from arbitrary chains of props
export const typeDefProxy: any = new Proxy({}, { get: () => getTypeDefProxy() })
export const getTypeDefProxy = () => typeDefProxy

export type ParseConfig = Required<ParseTypeOptions>
