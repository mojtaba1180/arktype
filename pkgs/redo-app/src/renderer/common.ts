import ApolloClient, { InMemoryCache, Resolvers } from "apollo-boost"
import { Root, Learner, Bounds, rootHandler } from "state"
import { BrowserEvent } from "redo-model"
import { buildSchemaSync, Resolver } from "type-graphql"
import { createResolversMap } from "type-graphql/dist/utils/createResolversMap"
import { printSchema } from "graphql"
import { createStore } from "shapeql"

const uri = `http://localhost:${process.env.PORT}`

@Resolver(of => BrowserEvent)
export class BrowserEventResolver {}

@Resolver(of => Learner)
export class LearnerResolver {}

@Resolver(of => Bounds)
export class BoundsResolver {}

export const schema = buildSchemaSync({
    resolvers: [BrowserEventResolver, LearnerResolver, BoundsResolver],
    skipCheck: true
})

export const typeDefs = printSchema(schema)

export const resolvers = createResolversMap(schema)

export const cache = new InMemoryCache()
export const client = new ApolloClient<Root>({
    uri,
    headers: {
        authorization: ""
    },
    cache,
    clientState: {
        typeDefs,
        resolvers: resolvers as Resolvers
    }
})
export const store = createStore({
    rootClass: Root,
    client: client as any,
    handler: rootHandler
})
