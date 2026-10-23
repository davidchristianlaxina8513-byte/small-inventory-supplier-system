import { expect, test } from 'vitest'
import { GET } from './route'

test('returns the public health contract without internal details', async () => {
  const response = GET()

  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toContain('application/json')
  expect(await response.json()).toEqual({ status: 'ok' })
})
