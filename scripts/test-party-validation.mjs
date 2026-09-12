import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
const require = createRequire(import.meta.url)
const ts = require('typescript')
const exports = {}
runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/validation/party.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports })
const validate = exports.validatePartyAction
let checks = 0
function bad(value) { assert.throws(() => validate(value)); checks++ }
for (const value of [null, [], {}, { action: 'delete' }, { action: 'create', payload: { name: 'x' } }, { action: 'join', payload: { code: 'wrong' } }]) bad(value)
const challenge = { title: 'Read a book', target: 10, unit: 'pages', start_date: '2026-09-12', end_date: '2026-09-13' }
for (const override of [{ target: 1.5 }, { target: -1 }, { target: '10' }, { end_date: '2026-02-30' }, { end_date: '2026-09-01' }, { end_date: '2028-01-01' }]) bad({ action: 'create_challenge', payload: { ...challenge, ...override } })
const filtered = validate({ action: 'create', payload: { name: ' Heroes ', user_id: 'someone', party_id: 'other' } })
assert.equal(JSON.stringify(filtered), JSON.stringify({ action: 'create', payload: { name: 'Heroes' } })); checks++
assert.equal(validate({ action: 'join', payload: { code: 'irlxp-abcdef123456' } }).payload.code, 'IRLXP-ABCDEF123456'); checks++
const id = '00000000-0000-4000-8000-000000000001'
bad({ action: 'progress', payload: { challenge_id: id, progress: 1.5 } })
assert.equal(validate({ action: 'progress', payload: { challenge_id: id, progress: 0, user_id: 'other' } }).payload.user_id, undefined); checks++
console.log(`PASS: ${checks} party input-validation checks.`)
