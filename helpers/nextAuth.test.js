jest.mock('./discordAuth.ts')
jest.mock('./middleware/user')
jest.mock('./middleware/session')
jest.mock('./middleware/logger')
import { updateRefreshandAccessTokens } from './discordAuth'
import { signIn } from './nextAuth'
import loggingMiddleware from './middleware/logger'
import sessionMiddleware from './middleware/session'
import userMiddleware from './middleware/user'
import { getUserSession } from './getUserSession'

const res = {
  setHeader: jest.fn(),
  json: jest.fn(),
  status: jest.fn()
}
const req = {}

const defaultMiddleware = (_req, _res, next) => next()

loggingMiddleware.mockImplementation(defaultMiddleware)
sessionMiddleware.mockReturnValue(defaultMiddleware)

describe('Signin callback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('Should return true when provider is not discord', async () => {
    expect.assertions(1)
    const signInCallback = signIn(req, res)

    const value = await signInCallback({
      account: {
        provider: 'credentials'
      },
      user: {
        id: 123
      }
    })

    expect(value).toBe(true)
  })
  describe('Connect to discord', () => {
    it('Should connect-to-discord with the provider is discord and no previous session', async () => {
      expect.assertions(2)
      userMiddleware.mockImplementation((req, _res, next) => {
        req.user = {
          id: 123,
          username: 'fakeUser'
        }
        next()
      })

      const signInCallback = signIn(req, res)

      const value = await signInCallback({
        account: {
          provider: 'discord'
        },
        user: {
          id: 123
        }
      })

      expect(updateRefreshandAccessTokens).toBeCalled()
      expect(value).toBe('/discord/success')
    })

    it('Should return true if there is no previous session', async () => {
      expect.assertions(2)
      userMiddleware.mockImplementation((req, _res, next) => {
        req.user = {}
        next()
      })

      const signInCallback = signIn(req, res)

      const value = await signInCallback({
        account: {
          provider: 'discord'
        }
      })

      expect(updateRefreshandAccessTokens).toBeCalledTimes(0)
      expect(value).toBe(true)
    })

    test('Should return the user in getUserSession if found', async () => {
      expect.assertions(1)
      userMiddleware.mockImplementation((req, _res, next) => {
        req.user = {
          id: 123,
          username: 'fakeUser'
        }
        next()
      })

      const c0d3User = await getUserSession(req, res)

      expect(c0d3User).toStrictEqual({
        id: 123,
        username: 'fakeUser'
      })
    })

    test('Should return null in getUserSession if user not found', async () => {
      userMiddleware.mockImplementation((req, _res, next) => {
        req.user = null
        next()
      })

      const c0d3User = await getUserSession(req, res)

      expect(c0d3User).toBe(null)
    })
  })
})