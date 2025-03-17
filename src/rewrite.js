import * as core from '@actions/core'

export function rewriteRepositories(lines, mavenCentralProxy, reposToProxies) {
  let mavenCentralRepositoryFound = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const repositoryLine = parseFileRepositoryLine(line)
    if (!repositoryLine) {
      continue
    }

    if (isUrlMavenCentral(repositoryLine)) {
      core.debug(`Replace ${repositoryLine.url} by ${mavenCentralProxy}`)
      mavenCentralRepositoryFound = true
      lines[i] =
        `@file:Repository("${mavenCentralProxy}")${repositoryLine.rest}`
      continue
    }

    const proxyUrl = reposToProxies.get(repositoryLine.url)
    if (proxyUrl) {
      core.debug(`Replace ${repositoryLine.url} by ${proxyUrl}`)
      lines[i] = `@file:Repository("${proxyUrl}")${repositoryLine.rest}`
      continue
    }

    core.debug(`No proxy found for ${repositoryLine.url}`)
  }

  // Add maven central repository before the first file:DependsOn if not found
  if (!mavenCentralRepositoryFound) {
    const firstDependsOnIndex = lines.findIndex((line) =>
      line.includes('@file:DependsOn')
    )
    if (firstDependsOnIndex === -1) {
      core.debug(
        'No @file:DependsOn found, maven central repository will not be added'
      )
    } else {
      core.debug(`Add maven central repository before @file:DependsOn`)
      lines.splice(
        firstDependsOnIndex,
        0,
        `@file:Repository("${mavenCentralProxy}")`
      )
    }
  }

  return lines.join('\n')
}

const mavenCentralRepoUrls = [
  'repo.maven.apache.org/maven2',
  'repo1.maven.org/maven2'
]

function parseFileRepositoryLine(line) {
  // Implement the parsing getting '@file:Repository("(.*)")(.*)'
  const match = line.match(/@file:Repository\("(.*)"\)(.*)/)
  if (!match) {
    return null
  }
  return {
    url: match[1],
    rest: match[2]
  }
}

function isUrlMavenCentral(parsedLine) {
  const url = parsedLine.url.match(/^(http|https):\/\/(.*)\/?/)
  if (!url) {
    core.error(`Invalid url: ${parsedLine.url}`)
    return false
  }
  return mavenCentralRepoUrls.includes(url[2])
}
