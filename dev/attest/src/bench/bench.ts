import * as process from "node:process"
import { chainableNoOpProxy } from "../../../../src/utils/chainableNoOpProxy.js"
import { caller } from "../../../runtime/main.js"
import { addListener } from "../../../runtime/shell.js"
import type { AttestConfig } from "../config.js"
import { getAttestConfig } from "../config.js"
import type { SourcePosition } from "../utils.js"
import type { BenchFormat } from "../writeSnapshot.js"
import type { TimeAssertionName } from "./call.js"
import { BenchAssertions } from "./call.js"
import type { BenchTypeAssertions } from "./type.js"
import { createBenchTypeAssertion } from "./type.js"

export type UntilOptions = {
    ms?: number
    count?: number
}

export type BaseBenchOptions = {
    until?: UntilOptions
}

export type BenchOptions = BaseBenchOptions & {
    hooks?: {
        beforeCall?: () => void
        afterCall?: () => void
    }
    benchFormat?: BenchFormat
}

export type InternalBenchOptions = BenchOptions & {
    fakeCallMs?: number | "count"
}

export type BenchContext = {
    qualifiedPath: string[]
    qualifiedName: string
    options: InternalBenchOptions
    cfg: AttestConfig
    benchCallPosition: SourcePosition
    lastSnapCallPosition: SourcePosition | undefined
    isAsync: boolean
}

export type BenchAssertionContext = BenchContext & {
    kind: TimeAssertionName | "type"
}

export type BenchableFunction = () => unknown | Promise<unknown>

export type InitialBenchAssertions<Fn extends BenchableFunction> =
    BenchAssertions<Fn> & BenchTypeAssertions

const currentSuitePath: string[] = []
export const unhandledExceptionMessages: string[] = []

addListener("beforeExit", () => {
    if (unhandledExceptionMessages.length) {
        console.error(
            `${unhandledExceptionMessages.length} unhandled exception(s) occurred during your benches (see details above).`
        )
        process.exit(1)
    }
})

const addUnhandledSuiteException = (originalMessage: string) => {
    console.error(
        `Suite ${currentSuitePath.join(
            "/"
        )} failed due to the following error:\n${originalMessage}`
    )
    unhandledExceptionMessages.push(originalMessage)
}

export const suite = <Fn extends BenchableFunction>(name: string, body: Fn) => {
    currentSuitePath.push(...name.split("/"))
    try {
        const result = body()
        if (result instanceof Promise) {
            return new Promise((resolve) => {
                result.then(
                    () => {
                        currentSuitePath.pop()
                        resolve(undefined)
                    },
                    (e) => {
                        addUnhandledSuiteException(String(e))
                        currentSuitePath.pop()
                        resolve(undefined)
                    }
                )
            })
        } else {
            currentSuitePath.pop()
        }
    } catch (e) {
        addUnhandledSuiteException(String(e))
    }
}

export const bench = <Fn extends BenchableFunction>(
    name: string,
    fn: Fn,
    options: BenchOptions = {}
): InitialBenchAssertions<Fn> => {
    const qualifiedPath = [...currentSuitePath, name]
    const ctx: BenchContext = {
        qualifiedPath,
        qualifiedName: qualifiedPath.join("/"),
        options,
        cfg: getAttestConfig(),
        benchCallPosition: caller(),
        lastSnapCallPosition: undefined,
        isAsync: fn.constructor.name === "AsyncFunction"
    }

    if (
        typeof ctx.cfg.filter === "string" &&
        !qualifiedPath.includes(ctx.cfg.filter)
    ) {
        return chainableNoOpProxy
    } else if (
        Array.isArray(ctx.cfg.filter) &&
        ctx.cfg.filter.some((segment, i) => segment !== qualifiedPath[i])
    ) {
        return chainableNoOpProxy
    }
    const assertions = new BenchAssertions(fn, ctx)
    Object.assign(assertions, createBenchTypeAssertion(ctx))
    return assertions as any
}
