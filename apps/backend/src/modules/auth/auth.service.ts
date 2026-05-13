import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { AppDataSource } from '../../data-source';
import { User } from '../../entities/User';
import { sendMail } from '../../utils/send-mail';

const userRepository = AppDataSource.getRepository(User);

interface FacebookResponse {
  id?: string;
  email?: string;
  name?: string;
  error?: any;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return secret;
}

function getGoogleClientId(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not defined');
  return clientId;
}

function getClientBaseUrl(): string {
  const rawValue =
    process.env.CLIENT_URL ||
    process.env.CORS_ORIGIN ||
    'http://localhost:5180';

  const firstValue = rawValue.split(',')[0].trim();

  return firstValue.endsWith('/') ? firstValue.slice(0, -1) : firstValue;
}

const googleClient = new OAuth2Client(getGoogleClientId());

export class AuthService {
  static async googleLogin(credential: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: getGoogleClientId(),
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error('Invalid Google token');
    }

    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name;

    let user = await userRepository.findOne({
      where: [{ googleId }, { email }],
    });

    if (!user) {
      user = userRepository.create({
        email,
        googleId,
        username: name || email.split('@')[0],
        password: null,
        phone: null,
        facebookId: null,
        twitterId: null,
        resetOtp: null,
        resetOtpExpiresAt: null,
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      });

      await userRepository.save(user);
    } else if (!user.googleId) {
      user.googleId = googleId;
      await userRepository.save(user);
    }

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
      token,
    };
  }

  static async facebookLogin(accessToken: string) {
    const fbRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );
    const fbData = (await fbRes.json()) as FacebookResponse;

    if (!fbData || fbData.error || !fbData.id) {
      throw new Error('Invalid Facebook token');
    }

    const facebookId = fbData.id;
    const email = fbData.email;
    const name = fbData.name;

    if (!email) {
      throw new Error('Facebook account must have an email associated');
    }

    let user = await userRepository.findOne({
      where: [{ facebookId }, { email }],
    });

    if (!user) {
      user = userRepository.create({
        email,
        facebookId,
        username: name || email.split('@')[0],
        password: null,
        phone: null,
        googleId: null,
        twitterId: null,
        resetOtp: null,
        resetOtpExpiresAt: null,
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      });

      await userRepository.save(user);
    } else if (!user.facebookId) {
      user.facebookId = facebookId;
      await userRepository.save(user);
    }

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
      token,
    };
  }

  static async twitterLogin(twitterId: string, username: string, email?: string) {
    if (!twitterId) throw new Error('Twitter ID is required');

    let user = await userRepository.findOne({
      where: email ? [{ twitterId }, { email }] : [{ twitterId }],
    });

    if (!user) {
      if (!email) {
        throw new Error('Email is required for new Twitter users');
      }

      user = userRepository.create({
        email,
        twitterId,
        username: username || email.split('@')[0],
        password: null,
        phone: null,
        googleId: null,
        facebookId: null,
        resetOtp: null,
        resetOtpExpiresAt: null,
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      });

      await userRepository.save(user);
    } else if (!user.twitterId) {
      user.twitterId = twitterId;
      await userRepository.save(user);
    }

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
      token,
    };
  }

  static async register(
    username: string,
    email: string,
    password: string,
    phone?: string
  ) {
    const existingUser = await userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) throw new Error('Email already in use');
      if (existingUser.username === username) throw new Error('Username already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = userRepository.create({
      username,
      email,
      password: hashedPassword,
      phone: phone ?? null,
      googleId: null,
      facebookId: null,
      twitterId: null,
      resetOtp: null,
      resetOtpExpiresAt: null,
      resetPasswordTokenHash: null,
      resetPasswordExpiresAt: null,
    });

    await userRepository.save(user);

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
      token,
    };
  }

  static async login(email: string, password: string) {
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.password) {
      throw new Error('This account uses Google login. Please continue with Google.');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
      token,
    };
  }

  static async forgotPassword(identifier: string) {
    const normalizedIdentifier = identifier.trim();

    if (!normalizedIdentifier) {
      throw new Error('Username or email is required');
    }

    const loweredIdentifier = normalizedIdentifier.toLowerCase();

    const user = await userRepository.findOne({
      where: [
        { username: normalizedIdentifier },
        { email: loweredIdentifier },
      ],
    });

    if (!user) {
      return {
        message: 'If that account exists, a reset link has been sent to the registered email.',
      };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    user.resetPasswordTokenHash = hashedToken;
    user.resetPasswordExpiresAt = expiresAt;

    await userRepository.save(user);

    const clientBaseUrl = getClientBaseUrl();
    const resetUrl = `${clientBaseUrl}/reset-password?token=${rawToken}`;

    await sendMail(
      user.email,
      'Velnor House Password Reset',
      `You requested a password reset.

Click the link below to reset your password:
${resetUrl}

This link will expire in 30 minutes.

If you did not request this, you can safely ignore this email.`
    );

    return {
      message: 'If that account exists, a reset link has been sent to the registered email.',
    };
  }

  static async resetPassword(token: string, newPassword: string) {
    if (!token) throw new Error('Reset token is required');
    if (!newPassword) throw new Error('New password is required');

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userRepository.findOne({
      where: { resetPasswordTokenHash: hashedToken },
    });

    if (!user || !user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    user.resetOtp = null;
    user.resetOtpExpiresAt = null;

    await userRepository.save(user);

    return {
      message: 'Password reset successfully ✅',
    };
  }
}