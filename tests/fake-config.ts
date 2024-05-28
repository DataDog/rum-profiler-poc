import type { RumProfilerConfig } from '../src/types'

export const fakeConfig: RumProfilerConfig = {
  applicationId: 'my-application-id',
  clientToken: 'my-client-token',
  service: 'my-service',
  version: 'my-version',
  env: 'my-env',
  site: 'datad0g.com',
  commitHash: 'my-commit-hash',
  repositoryUrl: 'https://my-repository-url',
}
