import { expect } from '@jest/globals'
import { rewriteRepositories } from '../src/rewrite.js'

describe('rewriteRepositories', () => {
  it('replaces maven central repository with proxy', () => {
    const lines = [
      '@file:Repository("https://repo.maven.apache.org/maven2")',
      '@file:Repository("https://repo.maven.apache.org/maven2/")',
      '@file:DependsOn("some-dependency")'
    ]
    const mavenCentralProxy = 'https://central.proxy.org/maven2'
    const reposToProxies = new Map()

    const result = rewriteRepositories(lines, mavenCentralProxy, reposToProxies)

    expect(result).toStrictEqual([
      '@file:Repository("https://central.proxy.org/maven2")',
      '@file:Repository("https://central.proxy.org/maven2")',
      '@file:DependsOn("some-dependency")'
    ])
  })

  it('replaces custom repository with proxy', () => {
    const lines = [
      '@file:Repository("https://repo.example.org/maven/")',
      '@file:DependsOn("some-dependency")'
    ]
    const mavenCentralProxy = 'https://central.proxy.org/maven2'
    const reposToProxies = new Map([
      ['https://repo.example.org/maven/', 'https://repo.proxy.org/maven/']
    ])

    const result = rewriteRepositories(lines, mavenCentralProxy, reposToProxies)

    expect(result).not.toContain(
      '@file:Repository("https://repo.example.org/maven/")'
    )
    expect(result).toContain(
      '@file:Repository("https://repo.proxy.org/maven/")'
    )
  })

  it('replaces custom repository with proxy being / insentive', () => {
    const lines = [
      '@file:Repository("https://repo.example1.org/maven/")',
      '@file:Repository("https://repo.example2.org/maven/")' // with slash at the end
    ]
    const mavenCentralProxy = 'https://central.proxy.org/maven2'
    const reposToProxies = new Map([
      ['https://repo.example1.org/maven/', 'https://repo.proxy1.org/maven/'],
      ['https://repo.example2.org/maven', 'https://repo.proxy2.org/maven']
    ])

    const result = rewriteRepositories(lines, mavenCentralProxy, reposToProxies)

    expect(result).toStrictEqual([
      '@file:Repository("https://repo.proxy1.org/maven/")',
      '@file:Repository("https://repo.proxy2.org/maven")'
    ])
  })

  it('adds maven central repository if not found', () => {
    const lines = ['@file:DependsOn("some-dependency")']
    const mavenCentralProxy = 'https://proxy.maven.org/maven2'
    const reposToProxies = new Map()

    const result = rewriteRepositories(lines, mavenCentralProxy, reposToProxies)

    expect(result).toStrictEqual([
      '@file:Repository("https://proxy.maven.org/maven2")',
      '@file:DependsOn("some-dependency")'
    ])
  })

  it('does not add maven central repository proxy if found', () => {
    const mavenCentralProxy = 'https://proxy.maven.org/maven2'
    const lines = [`@file:DependsOn("${mavenCentralProxy}")`]
    const reposToProxies = new Map()

    const result = rewriteRepositories(lines, mavenCentralProxy, reposToProxies)

    expect(result).toStrictEqual(lines)
  })
})
