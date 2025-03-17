import * as core from '@actions/core'
import { rewriteRepositories } from './rewrite'
import * as fs from 'fs'

export async function run() {
  try {
    const inputPath = core.getInput('input_path')

    let outputPath = core.getInput('output_path')
    if (!outputPath) {
      core.debug('Output path not provided, overwriting input file')
      outputPath = inputPath
    }

    const mavenCentralProxy = core.getInput('maven_central_proxy')

    const reposWithProxies = parseReposWithProxies(core.getInput('repos_with_proxies'))

    const lines = fs.readFileSync(inputPath, 'utf8').split('\n')

    fs.writeFileSync(outputPath, rewriteRepositories(lines, mavenCentralProxy, reposWithProxies))
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function parseReposWithProxies(reposWithProxies) {
  const result = new Map()

  if (!reposWithProxies) {
    return result
  }

  for (const line of reposWithProxies.split('\n')) {
    const parts = line.split(' -> ')
    if (parts.length === 2) {
      result.set(parts[0].trim(), parts[1].trim())
    } else {
      core.warning(`Invalid repos_with_proxies line: ${line}`)
    }
  }

  return result
}
