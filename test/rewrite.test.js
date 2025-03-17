import { expect } from '@jest/globals'
import { rewriteRepositories } from '../src/rewrite.js'

describe('rewriteRepositories', () => {
  it('replaces maven central repository with proxy', () => {
    const lines = [
      '@file:Repository("https://repo.maven.apache.org/maven2")',
      '@file:DependsOn("some-dependency")'
    ]
    const mavenCentralProxy = 'https://central.proxy.org/maven2'
    const reposWithProxies = new Map()

    const result = rewriteRepositories(lines, mavenCentralProxy, reposWithProxies)

    expect(result).toBe(
    '@file:Repository("https://central.proxy.org/maven2")\n' +
    '@file:DependsOn("some-dependency")'
    )
  })

  it('replaces custom repository with proxy', () => {
    const lines = [
      '@file:Repository("https://repo.example.org/maven/")',
      '@file:DependsOn("some-dependency")'
    ]
    const mavenCentralProxy = 'https://central.proxy.org/maven2'
    const reposWithProxies = new Map([
      ['https://repo.example.org/maven/', 'https://repo.proxy.org/maven/']
    ])

    const result = rewriteRepositories(lines, mavenCentralProxy, reposWithProxies)

    expect(result).not.toContain('@file:Repository("https://repo.example.org/maven/")')
    expect(result).toContain('@file:Repository("https://repo.proxy.org/maven/")')
  })

  it('adds maven central repository if not found', () => {
    const lines = [
      '@file:DependsOn("some-dependency")'
    ]
    const mavenCentralProxy = 'https://proxy.maven.org/maven2'
    const reposWithProxies = new Map()

    const result = rewriteRepositories(lines, mavenCentralProxy, reposWithProxies)

    expect(result).toBe(
        '@file:Repository("https://proxy.maven.org/maven2")\n' +
        '@file:DependsOn("some-dependency")'
      )
  })
})
