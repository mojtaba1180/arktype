import { ApolloClient } from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory"
import { HttpLink } from "apollo-link-http"
import gql from "graphql-tag"
import "isomorphic-fetch"
import { createStore, Handler } from "../store"
import {
    Root,
    initialRoot,
    initialRootWithTypeNames,
    initialA,
    initialAWithTypeNames
} from "./common"

const client = new ApolloClient<Root>({
    cache: new InMemoryCache() as any,
    link: new HttpLink()
})

const store = createStore({
    rootClass: Root,
    client
})

const cHandler = jest.fn()
const bing = jest.fn()
const dHandler = jest.fn()
const handler: Handler<Root> = {
    c: cHandler,
    b: bing,
    d: dHandler
}
const storeWithSideEffects = createStore({
    rootClass: Root,
    client,
    handler
})

describe("initialization", () => {
    test("doesn't crash", async () => {
        await store.initialize(initialRoot)
    })
})

describe("queries", () => {
    beforeEach(() => {
        client.writeData({ data: initialRootWithTypeNames })
    })
    test("handle shallow", () => {
        expect(store.query({ b: null })).toStrictEqual({ b: false })
    })
    test("handle deep", () => {
        expect(store.query({ a: null })).toStrictEqual({ a: initialA })
    })
    test("handle object arrays", () => {
        expect(store.query({ d: null })).toStrictEqual({
            d: [initialA, initialA]
        })
    })
    test("handle filtered object within array", () => {
        expect(store.query({ d: { a: null } })).toStrictEqual({
            d: [{ a: 0 }, { a: 0 }]
        })
    })
    test("don't include extraneous keys", () => {
        expect(store.query({ a: { a: null } })).toStrictEqual({
            a: { a: initialA.a }
        })
    })
})

describe("mutations", () => {
    beforeEach(() => {
        client.writeData({ data: initialRootWithTypeNames })
    })
    test("handles shallow", async () => {
        await store.mutate({ c: value => value + "suffix" })
        expect(
            client.readQuery({
                query: gql`
                    {
                        c
                    }
                `
            })
        ).toStrictEqual({ c: initialRoot.c + "suffix" })
    })
    test("handles deep", async () => {
        await store.mutate({ a: { b: { a: value => value.concat([1]) } } })
        expect(
            client.readQuery({
                query: gql`
                    {
                        a {
                            b {
                                a
                            }
                        }
                    }
                `
            })
        ).toStrictEqual({
            a: {
                b: {
                    a: initialRoot.a.b.a.concat([1]),
                    __typename: "B"
                },
                __typename: "A"
            }
        })
    })
    test("handles object arrays", async () => {
        await store.mutate({ d: value => value.concat(initialA) })
        expect(
            client.readQuery({
                query: gql`
                    {
                        d {
                            a
                            b {
                                a
                            }
                        }
                    }
                `
            })
        ).toStrictEqual({
            d: [
                initialAWithTypeNames,
                initialAWithTypeNames,
                initialAWithTypeNames
            ]
        })
    })
    test("sets array value", async () => {
        await store.mutate({ d: [] })
        expect(
            client.readQuery({
                query: gql`
                    {
                        d {
                            a
                            b {
                                a
                            }
                        }
                    }
                `
            })
        ).toStrictEqual({
            d: []
        })
    })

    test("doesn't update extraneous keys", async () => {
        const expected = store.queryAll()
        expected.a.b.a = [0, 1]
        await store.mutate({ a: { b: { a: value => value.concat([1]) } } })
        expect(store.queryAll()).toStrictEqual(expected)
    })
    test("handle side effects", async () => {
        await storeWithSideEffects.mutate({ b: true })
        expect(bing).toBeCalledWith(true)
    })
    test("handles array side effects", async () => {
        await storeWithSideEffects.mutate({ d: _ => _.concat(initialA) })
        expect(dHandler).toBeCalledWith([initialA, initialA, initialA])
    })
    test("doesn't trigger extraneous side effects", async () => {
        await storeWithSideEffects.mutate({
            b: current => current,
            c: current => current + "new"
        })
        expect(cHandler).toHaveBeenCalled()
        expect(bing).not.toHaveBeenCalled()
    })
})