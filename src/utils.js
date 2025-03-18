import * as core from '@actions/core'

export function trimEnd(str, chars) {
  let end = str.length
  while (chars.includes(str[end - 1])) {
    end--
  }
  return str.slice(0, end)
}

export function parseReposToProxies(reposToProxies) {
  const result = new Map()

  if (!reposToProxies) {
    return result
  }

  for (const line of reposToProxies.split('\n')) {
    const parts = line.split(' -> ')
    if (parts.length === 2) {
      result.set(parts[0].trim(), parts[1].trim())
    } else {
      core.warning(`Invalid repos_to_proxies line: ${line}`)
    }
  }

  return result
}
