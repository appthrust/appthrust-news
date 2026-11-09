import { describe, expect, mock, test } from 'bun:test'
import { YAML } from 'bun'
import { catalogContainsRelease, recordedDigest, renderEntry, submitEntry } from './publish-entry'

const template = await Bun.file(new URL('../catalog/entry.yaml', import.meta.url)).text()
const digest = `sha256:${'a'.repeat(64)}`
const nextDigest = `sha256:${'b'.repeat(64)}`

describe('renderEntry', () => {
  test('publishes the first public app image as the only default', () => {
    const entry = renderEntry(template, '1.0.0', digest)
    expect(entry.slug).toBe('appthrust-news')
    expect(entry.display).toEqual({ category: 'collaborate', icon: 'sparkles' })
    expect(entry.updatePolicy).toEqual({ default: 'follow', allowed: ['follow', 'pinned'] })
    expect(entry.publishedAt).toBeNull()
    expect(entry.versions).toHaveLength(1)
    expect(entry.versions[0]).toEqual({ name: '1.0.0', images: { web: `ghcr.io/appthrust/appthrust-news@${digest}` }, stream: '1', default: true, served: true })
    const definition = YAML.parse(entry.definitionYAML) as { spec: { versions: unknown; components: unknown[]; releaseIdentityEnvPrefix: string } }
    expect(definition.spec.versions).toEqual(entry.versions)
    expect(definition.spec.components).toHaveLength(1)
    expect(definition.spec.releaseIdentityEnvPrefix).toBe('APPTHRUST_NEWS')
  })

  test('refuses a description whose unquoted comma became an unknown key', () => {
    const broken = template.replace(
      '"Product news from AppThrust: releases, new marketplace apps, maintenance and incidents."',
      'Product news from AppThrust releases, new marketplace apps, maintenance and incidents.',
    )
    expect(broken).not.toBe(template)
    expect(() => renderEntry(broken, '1.0.0', digest)).toThrow(/spec\.display has unknown keys: new marketplace apps/)
  })

  test('merges persisted history on subsequent tags without mutating it', () => {
    const previous = renderEntry(template, '1.0.0', digest)
    previous.publishedAt = '2026-11-06T00:00:00Z'
    const entry = renderEntry(template, '1.0.1', nextDigest, previous)
    expect(entry.versions.map(version => version.name)).toEqual(['1.0.0', '1.0.1'])
    expect(entry.versions.filter(version => version.default).map(version => version.name)).toEqual(['1.0.1'])
    expect(entry.versions.every(version => version.served)).toBe(true)
    expect(entry.versions[0]!.images.web).toBe(`ghcr.io/appthrust/appthrust-news@${digest}`)
    expect(entry.publishedAt).toBe(previous.publishedAt)
    expect(previous.versions[0]!.default).toBe(true)
  })

  test('keeps minor releases and every carried version in stream 1', () => {
    const previous = renderEntry(template, '1.0.0', digest)
    previous.versions[0]!.stream = '1.0'
    const entry = renderEntry(template, '1.1.0', nextDigest, previous)
    expect(entry.versions.map(version => version.stream)).toEqual(['1', '1'])
    expect(entry.versions[0]!.images).toEqual(previous.versions[0]!.images)
    expect(previous.versions[0]!.stream).toBe('1.0')
  })

  test('rejects any release outside major 1, including carried history', () => {
    for (const version of ['0.9.0', '2.0.0', '10.0.0']) {
      expect(() => renderEntry(template, version, digest)).toThrow('AppThrust News versions must have major 1 (stream "1")')
    }
    const previous = renderEntry(template, '1.0.0', digest)
    previous.versions[0]!.name = '2.0.0'
    expect(() => renderEntry(template, '1.1.0', nextDigest, previous)).toThrow('major 1')
  })

  test('repeating an immutable release does not duplicate it', () => {
    const previous = renderEntry(template, '1.0.0', digest)
    expect(renderEntry(template, '1.0.0', digest, previous)).toEqual(previous)
  })

  test('refuses to replace an existing image digest', () => {
    const previous = renderEntry(template, '1.0.0', digest)
    expect(() => renderEntry(template, '1.0.0', nextDigest, previous)).toThrow('version 1.0.0 already has different immutable images')
  })

  test('rejects malformed release coordinates before publication', () => {
    for (const version of ['v1.0.0', '0.2', '01.2.3', '1.0.0+build', '1.0.0-01']) {
      expect(() => renderEntry(template, version, digest)).toThrow('version must be SemVer')
    }
    for (const invalid of ['latest', `sha256:${'0'.repeat(64)}`, `sha256:${'G'.repeat(64)}`]) {
      expect(() => renderEntry(template, '1.0.0', invalid)).toThrow('digest must be a non-placeholder')
    }
  })
})

test('catalog readback requires the exact slug, version and image digest', () => {
  const entry = renderEntry(template, '1.0.0', digest)
  expect(catalogContainsRelease({ schemaVersion: 1, entries: [entry] }, '1.0.0', digest)).toBe(true)
  expect(catalogContainsRelease({ schemaVersion: 1, entries: [entry] }, '1.0.0', nextDigest)).toBe(false)
  expect(catalogContainsRelease({ schemaVersion: 1, entries: [entry] }, '1.0.1', digest)).toBe(false)
  expect(catalogContainsRelease({ schemaVersion: 1, entries: [{ ...entry, slug: 'contacts' }] }, '1.0.0', digest)).toBe(false)
  expect(catalogContainsRelease({ entries: [entry] }, '1.0.0', digest)).toBe(false)
  entry.versions[0]!.stream = '1.0'
  expect(catalogContainsRelease({ schemaVersion: 1, entries: [entry] }, '1.0.0', digest)).toBe(false)
})

describe('submitEntry', () => {
  for (const [status, state] of [[202, 'queued'], [200, 'snapshot']] as const) {
    test(`returns the ${state} snapshot without polling when publication returns ${status}`, async () => {
      const fetcher = mock(async (url: string, init: RequestInit) => {
        expect(init.headers).toEqual({ authorization: 'Bearer admin-token', 'content-type': 'application/json' })
        if (url.endsWith('/entries')) {
          expect(init.method).toBe('GET')
          return Response.json({ data: [] })
        }
        if (url.endsWith('/entries/appthrust-news')) {
          expect(init.method).toBe('PUT')
          expect(JSON.parse(init.body as string)).toEqual(renderEntry(template, '1.0.0', digest))
          return Response.json({})
        }
        expect(url).toBe('https://catalog.example/api/v1/catalog/publish')
        expect(init.method).toBe('POST')
        return Response.json({ id: 'immutable-snapshot', state }, { status })
      })
      expect(await submitEntry(template, '1.0.0', digest, 'https://catalog.example', 'admin-token', fetcher))
        .toEqual({ id: 'immutable-snapshot', state })
      expect(fetcher).toHaveBeenCalledTimes(3)
    })
  }

  for (const [status, publication] of [
    [200, { id: 'snapshot', state: 'queued' }],
    [202, { id: 'snapshot', state: 'snapshot' }],
    [200, { state: 'snapshot' }],
    [200, { id: 'snapshot\nstate=queued', state: 'snapshot' }],
    [202, { id: 'snapshot', state: 'complete' }],
    [500, { error: 'dispatch failed' }],
  ] as const) {
    test(`rejects invalid publication response ${status} ${JSON.stringify(publication)}`, async () => {
      const fetcher = mock(async (url: string) => {
        if (url.endsWith('/entries')) return Response.json({ data: [] })
        if (url.endsWith('/entries/appthrust-news')) return Response.json({})
        return Response.json(publication, { status })
      })
      await expect(submitEntry(template, '1.0.0', digest, 'https://catalog.example', 'admin-token', fetcher))
        .rejects.toThrow(status === 500 ? 'POST /catalog/publish failed (500)' : 'catalog publish response must contain')
      expect(fetcher).toHaveBeenCalledTimes(3)
    })
  }
})

describe('recordedDigest', () => {
  test('reuses only the requested app version and its exact immutable image', async () => {
    const entry = renderEntry(template, '1.0.0', digest)
    const fetcher = mock(async (url: string, init: RequestInit) => {
      expect(url).toBe('https://catalog.example/api/v1/catalog/entries')
      expect(init.method).toBe('GET')
      expect(init.redirect).toBe('error')
      return Response.json({ data: [{ ...entry, slug: 'other' }, entry] })
    })
    expect(await recordedDigest('1.0.0', 'https://catalog.example', 'admin-token', fetcher)).toBe(digest)
    expect(await recordedDigest('1.0.1', 'https://catalog.example', 'admin-token', fetcher)).toBeNull()
  })

  test('rejects unsupported majors before making any request', async () => {
    const fetcher = mock(async () => Response.json({ data: [] }))
    await expect(recordedDigest('2.0.0', 'https://catalog.example', 'admin-token', fetcher)).rejects.toThrow('major 1')
    await expect(submitEntry(template, '2.0.0', digest, 'https://catalog.example', 'admin-token', fetcher)).rejects.toThrow('major 1')
    expect(fetcher).not.toHaveBeenCalled()
  })

  test('refuses a recorded version with another image repository or extra image slot', async () => {
    const imageSets: Array<Record<string, string>> = [
      { web: `ghcr.io/appthrust/other@${digest}` },
      { web: `ghcr.io/appthrust/appthrust-news@${digest}`, extra: `ghcr.io/appthrust/appthrust-news@${digest}` },
    ]
    for (const images of imageSets) {
      const entry = renderEntry(template, '1.0.0', digest)
      entry.versions[0]!.images = images
      await expect(recordedDigest('1.0.0', 'https://catalog.example', 'admin-token', async () => Response.json({ data: [entry] })))
        .rejects.toThrow('unexpected image set')
    }
  })
})
