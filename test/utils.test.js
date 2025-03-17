import { expect } from '@jest/globals'
import { trimEnd, parseReposToProxies } from '../src/utils.js'

describe('utils.js', () => {
  describe('trimEnd', () => {
    it('trims specified characters from the end of the string', () => {
      const result = trimEnd('hello world!!!', '!')
      expect(result).toBe('hello world')
    })

    it('returns the same string if no characters are trimmed', () => {
      const result = trimEnd('hello world', '!')
      expect(result).toBe('hello world')
    })

    it('trims multiple characters from the end of the string', () => {
      const result = trimEnd('hello world!!!???', '!?')
      expect(result).toBe('hello world')
    })
  })

  describe('parseReposToProxies', () => {
    it('parses repos_to_proxies correctly', () => {
      const input =
        'https://example1.org/maven/ -> https://proxied-repo.example2.com/maven/\n' +
        'https://custom-maven.example3.org/ -> https://us-east4-maven.pkg.dev/gcp-project/repository-name'

      const result = parseReposToProxies(input)

      const expected = new Map([
        [
          'https://example1.org/maven/',
          'https://proxied-repo.example2.com/maven/'
        ],
        [
          'https://custom-maven.example3.org/',
          'https://us-east4-maven.pkg.dev/gcp-project/repository-name'
        ]
      ])
      expect(result).toStrictEqual(expected)
    })

    it('returns an empty map if input is empty', () => {
      const result = parseReposToProxies('')
      expect(result).toStrictEqual(new Map())
    })

    it('ignore invalid lines', () => {
      const input = 'invalid line'

      const result = parseReposToProxies(input)

      expect(result).toStrictEqual(new Map())
    })
  })
})
