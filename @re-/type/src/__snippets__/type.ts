import { type } from "../index.js"

// Define a type...
export const user = type({
    name: "string",
    browser: {
        kind: "'chrome'|'firefox'|'safari'",
        version: "number?"
    }
})

// Infer it...
export type User = typeof user.infer

export const fetchUser = () => ({
    name: "Dan Abramov",
    browser: {
        kind: "Internet Explorer" // R.I.P.
    }
})

// Types can validate your data anytime, anywhere, with the same clarity and precision you expect from TypeScript.
export const { errors, data } = user.check(fetchUser())

if (errors) {
    // "At path browser, 'Internet Explorer' is not assignable to any of 'chrome'|'firefox'|'other'|null."
    console.log(errors.summary)
}
