import * as core from '@actions/core'
import { rewriteRepositories } from './rewrite'
import { parseReposToProxies } from './utils'
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

    const reposToProxies = parseReposToProxies(
      core.getInput('repos_to_proxies')
    )

    const lines = fs.readFileSync(inputPath, 'utf8').split('\n')

    fs.writeFileSync(
      outputPath,
      rewriteRepositories(lines, mavenCentralProxy, reposToProxies).join('\n')
    )
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
