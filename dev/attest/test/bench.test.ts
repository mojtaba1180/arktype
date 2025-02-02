import * as assert from "node:assert/strict"
import { describe, it } from "mocha"
import { fromHere, readFile } from "../../runtime/main.js"
import { runThenGetContents } from "./utils.js"

const benchTemplate = fromHere("benchTemplate.ts")
const expectedOutput = readFile(fromHere("benchExpectedOutput.ts")).replaceAll(
    "\r\n",
    "\n"
)

describe("bench", () => {
    it("populates file", () => {
        const actual = runThenGetContents(benchTemplate, {
            includeBenches: true,
            benchFormat: { noExternal: true }
        })
        assert.equal(actual, expectedOutput)
    }).timeout(30000)
})
