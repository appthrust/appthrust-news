import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parseArgs, promisify } from 'node:util'
import { compareEditions, parseEditionItem, selectBaseTag, type Edition, type EditionItem } from './edition'

const exec = promisify(execFile)
const repository = fileURLToPath(new URL('../', import.meta.url))

async function git(...args: string[]): Promise<string> {
  const { stdout } = await exec('git', args, { cwd: repository, timeout: 30_000, maxBuffer: 16 * 1024 * 1024 })
  return stdout
}

async function loadEdition(ref: string): Promise<Edition> {
  const commit = (await git('rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`)).trim()
  const paths = (await git('ls-tree', '-r', '--name-only', '-z', commit, '--', 'content/news/')).split('\0').filter(Boolean)
  const edition: Record<string, Partial<Record<'ja' | 'en', EditionItem>>> = Object.create(null)
  for (const path of paths) {
    const match = /^content\/news\/([^/]+)\/(.+)$/.exec(path)
    if (!match) continue
    const id = match[1]!
    const item = edition[id] ??= {}
    if (match[2] !== 'ja.md' && match[2] !== 'en.md') continue
    const locale = match[2] === 'ja.md' ? 'ja' : 'en'
    item[locale] = parseEditionItem(await git('show', `${commit}:${path}`), `${ref}:${path}`)
  }
  return edition
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: { base: { type: 'string' }, 'exclude-tag': { type: 'string' } },
    strict: true,
  })
  if (values.base !== undefined && (!values.base || values['exclude-tag'] !== undefined)) {
    throw new Error('usage: bun hack/check-edition.ts [--base <git-ref> | --exclude-tag <current-tag>]')
  }
  let base = values.base
  if (base === undefined) {
    const tags = (await git('tag', '--merged', 'HEAD', '--list', 'v*', '--sort=-version:refname')).trim().split('\n').filter(Boolean)
    base = selectBaseTag(tags, values['exclude-tag'])
  }
  if (base === undefined) {
    console.log('No base edition: no earlier reachable v* tag; append-only check passes')
    return
  }
  const [previous, current] = await Promise.all([loadEdition(base), loadEdition('HEAD')])
  const violations = compareEditions(previous, current)
  if (violations.length > 0) {
    for (const violation of violations) console.error(violation)
    console.error(`Edition check failed: ${violations.length} violation(s) against ${base}`)
    process.exitCode = 1
    return
  }
  console.log(`Edition check passed: HEAD preserves the edition at ${base}`)
}

if (import.meta.main) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
