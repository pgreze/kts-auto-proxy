import { jest } from '@jest/globals'
import * as core from './fixtures/core.js'
import * as fs from './fixtures/fs.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('fs', () => fs)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.js', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('overwrites input file if output path is not provided', async () => {
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'input_path':
          return 'input.txt'
        case 'output_path':
          return ''
        case 'maven_central_proxy':
          return 'https://proxy.maven.org/maven2'
        case 'repos_with_proxies':
          return ''
        default:
          return ''
      }
    })

    fs.readFileSync.mockReturnValue('@file:DependsOn("some-dependency")\n')

    await run()

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'input.txt',
      '@file:Repository("https://proxy.maven.org/maven2")\n@file:DependsOn("some-dependency")\n'
    )
  })

  it('writes to output file if output path is provided', async () => {
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'input_path':
          return 'input.txt'
        case 'output_path':
          return 'output.txt'
        case 'maven_central_proxy':
          return 'https://proxy.maven.org/maven2'
        case 'repos_with_proxies':
          return ''
        default:
          return ''
      }
    })

    fs.readFileSync.mockReturnValue('@file:DependsOn("some-dependency")\n')

    await run()

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'output.txt',
      '@file:Repository("https://proxy.maven.org/maven2")\n@file:DependsOn("some-dependency")\n'
    )
  })

  it('sets failed status on error', async () => {
    core.getInput.mockImplementation(() => {
      throw new Error('input_path is required')
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('input_path is required')
  })
})
