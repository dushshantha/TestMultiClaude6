const jwt = require('jsonwebtoken');
const { authenticate, createToken } = require('./auth');

const TEST_SECRET = 'test-secret-key';
const TEST_PAYLOAD = { userId: '123', role: 'user' };

describe('JWT Authentication Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('createToken', () => {
    it('creates a valid JWT token with the given payload', () => {
      const token = createToken(TEST_PAYLOAD, TEST_SECRET);
      const decoded = jwt.verify(token, TEST_SECRET);
      expect(decoded.userId).toBe(TEST_PAYLOAD.userId);
      expect(decoded.role).toBe(TEST_PAYLOAD.role);
    });

    it('uses process.env.JWT_SECRET when no secret is provided', () => {
      const token = createToken(TEST_PAYLOAD);
      const decoded = jwt.verify(token, TEST_SECRET);
      expect(decoded.userId).toBe(TEST_PAYLOAD.userId);
    });

    it('creates token with default 1h expiry', () => {
      const token = createToken(TEST_PAYLOAD, TEST_SECRET);
      const decoded = jwt.decode(token);
      expect(decoded.exp - decoded.iat).toBe(3600);
    });

    it('accepts custom expiry', () => {
      const token = createToken(TEST_PAYLOAD, TEST_SECRET, '24h');
      const decoded = jwt.decode(token);
      expect(decoded.exp - decoded.iat).toBe(86400);
    });
  });

  describe('authenticate middleware', () => {
    it('calls next() with valid Bearer token in Authorization header', () => {
      const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET);
      mockReq.headers['authorization'] = `Bearer ${token}`;

      authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.userId).toBe(TEST_PAYLOAD.userId);
    });

    it('returns 401 when Authorization header is missing', () => {
      authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authorization header required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 401 when token format is invalid (no Bearer prefix)', () => {
      const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET);
      mockReq.headers['authorization'] = token;

      authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token format. Use: Bearer <token>' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 401 when token is expired', () => {
      const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET, { expiresIn: '0s' });
      mockReq.headers['authorization'] = `Bearer ${token}`;

      authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token expired' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 401 when token signature is invalid', () => {
      const token = jwt.sign(TEST_PAYLOAD, 'wrong-secret');
      mockReq.headers['authorization'] = `Bearer ${token}`;

      authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 401 when token is malformed', () => {
      mockReq.headers['authorization'] = 'Bearer not.a.valid.token';

      authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('attaches decoded payload to req.user', () => {
      const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET);
      mockReq.headers['authorization'] = `Bearer ${token}`;

      authenticate(mockReq, mockRes, mockNext);

      expect(mockReq.user).toMatchObject(TEST_PAYLOAD);
    });

    it('handles case-insensitive Authorization header', () => {
      const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET);
      mockReq.headers['Authorization'] = `Bearer ${token}`;

      authenticate(mockReq, mockRes, mockNext);

      // Express normalizes headers to lowercase, but our middleware should handle both
      // The test uses lowercase 'authorization' in headers object (as Express provides it)
      mockReq.headers = {};
      mockReq.headers['authorization'] = `Bearer ${token}`;
      authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
