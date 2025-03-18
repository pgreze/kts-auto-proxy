/**
 * This file is used to mock the `fs` module in tests.
 */
import { jest } from '@jest/globals'

export const readFileSync = jest.fn()
export const writeFileSync = jest.fn()
