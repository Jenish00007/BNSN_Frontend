export const parseVersion = (versionString) => {
  if (!versionString || typeof versionString !== 'string') {
    return [0, 0, 0]
  }

  return versionString
    .split('.')
    .map((segment) => {
      const numeric = parseInt(segment, 10)
      return Number.isNaN(numeric) ? 0 : numeric
    })
    .slice(0, 3)
}

export const compareVersions = (currentVersion, targetVersion) => {
  const current = parseVersion(currentVersion)
  const target = parseVersion(targetVersion)

  for (let index = 0; index < 3; index += 1) {
    const currentValue = current[index] ?? 0
    const targetValue = target[index] ?? 0

    if (currentValue > targetValue) {
      return 1
    }

    if (currentValue < targetValue) {
      return -1
    }
  }

  return 0
}

export const isVersionLower = (currentVersion, minSupportedVersion) => {
  if (!minSupportedVersion) return false
  return compareVersions(currentVersion, minSupportedVersion) < 0
}
