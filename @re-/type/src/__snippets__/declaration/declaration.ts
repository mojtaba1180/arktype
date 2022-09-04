import { groupDef } from "./group.js"
import { compile } from "./names.js"
import { userDef } from "./user.js"

// Creates your space (or tells you which definition you forgot to include)
export const types = compile({ ...userDef, ...groupDef })

// Mouse over "Group" to see the inferred type...
export type Group = typeof types.group.infer

export const getGroupsForCurrentUser = () => ({
    title: "Type Enjoyers",
    members: [
        {
            name: "Devin Aldai",
            grapes: []
        }
    ]
})

// Try changing the definitions in "group.ts"/"user.ts" or the data in "getGroupsForCurrentUser"
export const { errors } = types.group.check(getGroupsForCurrentUser())
