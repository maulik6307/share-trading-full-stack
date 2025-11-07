const User = require('../models/User');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// @desc    Get user profile settings
// @route   GET /api/v1/settings/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            return res.status(200).json({
                success: true,
                data: {
                    profile: {
                        name: req.user.name,
                        email: req.user.email,
                        username: req.user.username,
                        phone: undefined,
                        country: 'IN',
                        bio: 'Demo user for paper trading',
                        timezone: 'Asia/Kolkata',
                        language: 'en',
                        avatar: undefined
                    },
                    preferences: {
                        theme: 'light',
                        currency: 'INR',
                        defaultCurrency: 'INR',
                        dateFormat: 'DD/MM/YYYY'
                    }
                }
            });
        }

        const user = await User.findById(req.user.id).select('-password');

        res.status(200).json({
            success: true,
            data: {
                profile: {
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    phone: user.phone,
                    country: user.country,
                    bio: user.bio,
                    timezone: user.timezone,
                    language: user.language,
                    avatar: user.avatar
                },
                preferences: {
                    theme: user.preferences?.theme || 'light',
                    currency: user.tradingPreferences?.defaultCurrency || 'USD',
                    defaultCurrency: user.tradingPreferences?.defaultCurrency || 'USD',
                    dateFormat: user.preferences?.dateFormat || 'DD/MM/YYYY'
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/settings/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, phone, country, bio, timezone, language, theme, currency, dateFormat } = req.body;

        const updateFields = {};

        // Basic profile fields
        if (name !== undefined) updateFields.name = name;
        if (email !== undefined) updateFields.email = email.toLowerCase();
        if (phone !== undefined) updateFields.phone = phone;
        if (country !== undefined) updateFields.country = country;
        if (bio !== undefined) updateFields.bio = bio;
        if (timezone !== undefined) updateFields.timezone = timezone;
        if (language !== undefined) updateFields.language = language;

        // Preferences
        if (theme !== undefined) {
            updateFields['preferences.theme'] = theme;
        }
        if (currency !== undefined) {
            updateFields['tradingPreferences.defaultCurrency'] = currency;
        }
        if (dateFormat !== undefined) {
            updateFields['preferences.dateFormat'] = dateFormat;
        }

        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            // Create mock updated user for demo
            const mockUser = {
                id: req.user.id,
                name: name || req.user.name,
                email: email || req.user.email,
                username: req.user.username,
                phone: phone,
                country: country || 'IN',
                bio: bio || 'Demo user for paper trading',
                timezone: timezone || 'Asia/Kolkata',
                language: language || 'en',
                avatar: undefined,
                preferences: {
                    theme: theme || 'light',
                    dateFormat: dateFormat || 'DD/MM/YYYY'
                },
                tradingPreferences: {
                    defaultCurrency: currency || 'INR'
                }
            };

            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully (Demo)',
                data: { user: mockUser }
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Update profile error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
};

// @desc    Get security settings
// @route   GET /api/v1/settings/security
// @access  Private
exports.getSecuritySettings = async (req, res) => {
    try {
        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            return res.status(200).json({
                success: true,
                data: {
                    twoFactorAuth: {
                        enabled: false,
                        method: 'app'
                    },
                    loginAlerts: {
                        enabled: true,
                        newDevice: true,
                        newLocation: true,
                        failedAttempts: true
                    },
                    sessionManagement: {
                        autoLogout: true,
                        timeoutMinutes: 30,
                        maxSessions: 3
                    },
                    privacy: {
                        profileVisibility: 'private',
                        activityTracking: false,
                        dataSharing: false,
                        marketingConsent: false
                    }
                }
            });
        }

        const user = await User.findById(req.user.id).select('-password');

        res.status(200).json({
            success: true,
            data: {
                twoFactorAuth: {
                    enabled: user.twoFactorAuth?.enabled || false,
                    method: user.twoFactorAuth?.method || 'app'
                },
                loginAlerts: user.securitySettings?.loginAlerts || {
                    enabled: true,
                    newDevice: true,
                    newLocation: true,
                    failedAttempts: true
                },
                sessionManagement: user.securitySettings?.sessionManagement || {
                    autoLogout: true,
                    timeoutMinutes: 30,
                    maxSessions: 3
                },
                privacy: user.securitySettings?.privacy || {
                    profileVisibility: 'private',
                    activityTracking: false,
                    dataSharing: false,
                    marketingConsent: false
                }
            }
        });
    } catch (error) {
        console.error('Get security settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching security settings'
        });
    }
};

// @desc    Update security settings
// @route   PUT /api/v1/settings/security
// @access  Private
exports.updateSecuritySettings = async (req, res) => {
    try {
        const { loginAlerts, sessionManagement, privacy } = req.body;

        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            return res.status(200).json({
                success: true,
                message: 'Security settings updated successfully (Demo)',
                data: { 
                    user: {
                        id: req.user.id,
                        securitySettings: {
                            loginAlerts,
                            sessionManagement,
                            privacy
                        }
                    }
                }
            });
        }

        const updateFields = {};

        if (loginAlerts) {
            updateFields['securitySettings.loginAlerts'] = loginAlerts;
        }
        if (sessionManagement) {
            updateFields['securitySettings.sessionManagement'] = sessionManagement;
        }
        if (privacy) {
            updateFields['securitySettings.privacy'] = privacy;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Security settings updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Update security settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating security settings'
        });
    }
};

// @desc    Enable two-factor authentication
// @route   POST /api/v1/settings/security/2fa/enable
// @access  Private
exports.enable2FA = async (req, res) => {
    try {
        const { method = 'app' } = req.body;

        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            let qrCodeUrl, backupCodes;

            if (method === 'app') {
                // Generate demo QR code
                const demoSecret = speakeasy.generateSecret({
                    name: `ShareTrading (demo@example.com)`,
                    issuer: 'ShareTrading'
                });
                qrCodeUrl = await QRCode.toDataURL(demoSecret.otpauth_url);
            }

            // Generate demo backup codes
            backupCodes = [
                'DEMO1234', 'DEMO5678', 'DEMO9012', 'DEMO3456',
                'DEMO7890', 'DEMO2468', 'DEMO1357', 'DEMO9753'
            ];

            return res.status(200).json({
                success: true,
                message: 'Two-factor authentication enabled successfully (Demo)',
                data: {
                    qrCodeUrl: method === 'app' ? qrCodeUrl : undefined,
                    backupCodes: backupCodes,
                    demo: true
                }
            });
        }

        const user = await User.findById(req.user.id);

        if (user.twoFactorAuth?.enabled) {
            return res.status(400).json({
                success: false,
                message: 'Two-factor authentication is already enabled'
            });
        }

        let secret, qrCodeUrl, backupCodes;

        if (method === 'app') {
            // Generate secret for authenticator app
            secret = speakeasy.generateSecret({
                name: `ShareTrading (${user.email})`,
                issuer: 'ShareTrading'
            });

            // Generate QR code
            qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
        }

        // Generate backup codes
        backupCodes = Array.from({ length: 8 }, () =>
            crypto.randomBytes(4).toString('hex').toUpperCase()
        );

        // Update user with 2FA settings
        user.twoFactorAuth = {
            enabled: true,
            method,
            secret: secret?.base32,
            backupCodes: backupCodes.map(code => crypto.createHash('sha256').update(code).digest('hex'))
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Two-factor authentication enabled successfully',
            data: {
                qrCodeUrl: method === 'app' ? qrCodeUrl : undefined,
                backupCodes: backupCodes // Send plain codes to user (only once)
            }
        });
    } catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error enabling two-factor authentication'
        });
    }
};

// @desc    Disable two-factor authentication
// @route   POST /api/v1/settings/security/2fa/disable
// @access  Private
exports.disable2FA = async (req, res) => {
    try {
        const { password } = req.body;

        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            return res.status(200).json({
                success: true,
                message: 'Two-factor authentication disabled successfully (Demo)'
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        // Verify password
        if (!(await user.matchPassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Disable 2FA
        user.twoFactorAuth = {
            enabled: false,
            method: 'app',
            secret: undefined,
            backupCodes: []
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Two-factor authentication disabled successfully'
        });
    } catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error disabling two-factor authentication'
        });
    }
};

// @desc    Verify 2FA code during setup
// @route   POST /api/v1/settings/security/2fa/verify
// @access  Private
exports.verify2FA = async (req, res) => {
    try {
        const { code, method = 'app' } = req.body;

        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            // Accept demo codes
            const validDemoCodes = ['123456', '000000', 'DEMO1234'];
            if (validDemoCodes.includes(code)) {
                return res.status(200).json({
                    success: true,
                    message: 'Two-factor authentication code verified successfully (Demo)'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid verification code. Try: 123456, 000000, or DEMO1234'
                });
            }
        }

        const user = await User.findById(req.user.id);

        if (method === 'app' && user.twoFactorAuth?.secret) {
            // Verify TOTP code
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorAuth.secret,
                encoding: 'base32',
                token: code,
                window: 2 // Allow 2 time steps (60 seconds) tolerance
            });

            if (verified) {
                return res.status(200).json({
                    success: true,
                    message: 'Two-factor authentication code verified successfully'
                });
            }
        }

        // Check if it's a backup code
        if (user.twoFactorAuth?.backupCodes?.length > 0) {
            const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
            const codeIndex = user.twoFactorAuth.backupCodes.indexOf(hashedCode);
            
            if (codeIndex !== -1) {
                // Remove used backup code
                user.twoFactorAuth.backupCodes.splice(codeIndex, 1);
                await user.save();

                return res.status(200).json({
                    success: true,
                    message: 'Backup code verified successfully',
                    remainingBackupCodes: user.twoFactorAuth.backupCodes.length
                });
            }
        }

        res.status(400).json({
            success: false,
            message: 'Invalid verification code'
        });
    } catch (error) {
        console.error('Verify 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error verifying two-factor authentication code'
        });
    }
};

// @desc    Regenerate backup codes
// @route   POST /api/v1/settings/security/2fa/backup-codes
// @access  Private
exports.regenerateBackupCodes = async (req, res) => {
    try {
        const { password } = req.body;

        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            const demoCodes = [
                'DEMO1234', 'DEMO5678', 'DEMO9012', 'DEMO3456',
                'DEMO7890', 'DEMO2468', 'DEMO1357', 'DEMO9753'
            ];

            return res.status(200).json({
                success: true,
                message: 'Backup codes regenerated successfully (Demo)',
                data: { backupCodes: demoCodes }
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        // Verify password
        if (!(await user.matchPassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        if (!user.twoFactorAuth?.enabled) {
            return res.status(400).json({
                success: false,
                message: 'Two-factor authentication is not enabled'
            });
        }

        // Generate new backup codes
        const backupCodes = Array.from({ length: 8 }, () =>
            crypto.randomBytes(4).toString('hex').toUpperCase()
        );

        // Update user with new backup codes
        user.twoFactorAuth.backupCodes = backupCodes.map(code => 
            crypto.createHash('sha256').update(code).digest('hex')
        );

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Backup codes regenerated successfully',
            data: { backupCodes } // Send plain codes to user (only once)
        });
    } catch (error) {
        console.error('Regenerate backup codes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error regenerating backup codes'
        });
    }
};

// @desc    Get active sessions
// @route   GET /api/v1/settings/security/sessions
// @access  Private
exports.getActiveSessions = async (req, res) => {
    try {
        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            const sessions = [{
                id: 'session-1',
                device: 'Chrome on Windows (Demo)',
                location: 'Demo Location',
                lastActive: new Date(),
                current: true
            }];

            return res.status(200).json({
                success: true,
                data: { sessions }
            });
        }

        const user = await User.findById(req.user.id);

        // Get recent login history as "sessions"
        const sessions = user.loginHistory.slice(-10).map((login, index) => ({
            id: `session-${index}`,
            device: login.userAgent || 'Unknown Device',
            location: login.location || 'Unknown Location',
            lastActive: login.timestamp,
            current: index === user.loginHistory.length - 1 // Last login is current session
        }));

        res.status(200).json({
            success: true,
            data: { sessions }
        });
    } catch (error) {
        console.error('Get active sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching active sessions'
        });
    }
};

// @desc    Get notification preferences
// @route   GET /api/v1/settings/notifications
// @access  Private
exports.getNotificationPreferences = async (req, res) => {
    try {
        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            const preferences = {
                email: {
                    enabled: true,
                    trading: true,
                    system: true,
                    marketing: false,
                    security: true
                },
                push: {
                    enabled: true,
                    trading: true,
                    system: true,
                    alerts: true,
                    news: false
                },
                sms: {
                    enabled: false,
                    security: true,
                    critical: true
                },
                inApp: {
                    enabled: true,
                    sound: true,
                    desktop: true,
                    trading: true,
                    system: true
                },
                trading: {
                    orderFills: true,
                    positionUpdates: true,
                    riskAlerts: true,
                    priceAlerts: true,
                    strategyUpdates: true,
                    backtestComplete: true
                },
                frequency: {
                    immediate: true,
                    digest: false,
                    digestTime: '09:00',
                    quietHours: {
                        enabled: false,
                        start: '22:00',
                        end: '08:00'
                    }
                }
            };

            return res.status(200).json({
                success: true,
                data: { preferences }
            });
        }

        const user = await User.findById(req.user.id);

        const preferences = user.notificationPreferences || {
            email: {
                enabled: user.tradingPreferences?.notifications?.email || true,
                trading: true,
                system: true,
                marketing: false,
                security: true
            },
            push: {
                enabled: user.tradingPreferences?.notifications?.push || true,
                trading: true,
                system: true,
                alerts: true,
                news: false
            },
            sms: {
                enabled: user.tradingPreferences?.notifications?.sms || false,
                security: true,
                critical: true
            },
            inApp: {
                enabled: true,
                sound: true,
                desktop: true,
                trading: true,
                system: true
            },
            trading: {
                orderFills: true,
                positionUpdates: true,
                riskAlerts: true,
                priceAlerts: true,
                strategyUpdates: true,
                backtestComplete: true
            },
            frequency: {
                immediate: true,
                digest: false,
                digestTime: '09:00',
                quietHours: {
                    enabled: false,
                    start: '22:00',
                    end: '08:00'
                }
            }
        };

        res.status(200).json({
            success: true,
            data: { preferences }
        });
    } catch (error) {
        console.error('Get notification preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching notification preferences'
        });
    }
};

// @desc    Update notification preferences
// @route   PUT /api/v1/settings/notifications
// @access  Private
exports.updateNotificationPreferences = async (req, res) => {
    try {
        const { preferences } = req.body;

        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            return res.status(200).json({
                success: true,
                message: 'Notification preferences updated successfully (Demo)',
                data: { 
                    user: {
                        id: req.user.id,
                        notificationPreferences: preferences
                    }
                }
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    notificationPreferences: preferences,
                    // Update legacy fields for backward compatibility
                    'tradingPreferences.notifications.email': preferences.email?.enabled,
                    'tradingPreferences.notifications.push': preferences.push?.enabled,
                    'tradingPreferences.notifications.sms': preferences.sms?.enabled,
                    'tradingPreferences.notifications.trading': preferences.trading?.orderFills,
                    'tradingPreferences.notifications.marketing': preferences.email?.marketing
                }
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Notification preferences updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Update notification preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating notification preferences'
        });
    }
};

// @desc    Get billing information
// @route   GET /api/v1/settings/billing
// @access  Private
exports.getBillingInfo = async (req, res) => {
    try {
        // Handle demo user
        if (req.user.id === 'demo-user-1') {
            const billingInfo = {
                plan: {
                    name: 'Free Trial',
                    price: 0,
                    interval: 'monthly',
                    features: [
                        '5 Backtests per month',
                        '3 Active strategies',
                        'Basic paper trading',
                        'Community support',
                        'Standard data feeds'
                    ],
                    status: 'trial',
                    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                },
                paymentMethod: null,
                billingHistory: [],
                usage: {
                    backtests: { used: 2, limit: 5 },
                    strategies: { used: 1, limit: 3 },
                    paperTrades: { used: 1, limit: 1 },
                    dataFeeds: { used: 1, limit: 1 }
                }
            };

            return res.status(200).json({
                success: true,
                data: billingInfo
            });
        }

        const user = await User.findById(req.user.id);

        // Mock billing data - in real app, this would come from payment processor
        const billingInfo = {
            plan: {
                name: user.subscription?.plan === 'free' ? 'Free Trial' :
                    user.subscription?.plan === 'basic' ? 'Starter' :
                        user.subscription?.plan === 'premium' ? 'Professional' : 'Enterprise',
                price: user.subscription?.plan === 'free' ? 0 :
                    user.subscription?.plan === 'basic' ? 29 :
                        user.subscription?.plan === 'premium' ? 99 : 299,
                interval: 'monthly',
                features: user.subscription?.plan === 'free' ? [
                    '5 Backtests per month',
                    '3 Active strategies',
                    'Basic paper trading',
                    'Community support',
                    'Standard data feeds'
                ] : [
                    'Unlimited backtests',
                    'Unlimited strategies',
                    'Advanced paper trading',
                    'Priority support',
                    'Premium data feeds'
                ],
                status: user.subscription?.status || 'trial',
                trialEndsAt: user.subscription?.endDate,
                nextBillingDate: user.subscription?.endDate
            },
            paymentMethod: user.billingInfo?.paymentMethod || null,
            billingHistory: user.billingInfo?.history || [],
            usage: user.billingInfo?.usage || {
                backtests: { used: 2, limit: 5 },
                strategies: { used: 1, limit: 3 },
                paperTrades: { used: 1, limit: 1 },
                dataFeeds: { used: 1, limit: 1 }
            }
        };

        res.status(200).json({
            success: true,
            data: billingInfo
        });
    } catch (error) {
        console.error('Get billing info error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching billing information'
        });
    }
};

// @desc    Update subscription plan
// @route   POST /api/v1/settings/billing/upgrade
// @access  Private
exports.upgradePlan = async (req, res) => {
    try {
        const { planName, interval = 'monthly' } = req.body;

        // Map plan names to internal plan IDs
        const planMapping = {
            'Starter': 'basic',
            'Professional': 'premium',
            'Enterprise': 'enterprise'
        };

        const planId = planMapping[planName];
        if (!planId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan selected'
            });
        }

        // In a real app, you would integrate with payment processor here
        // For now, we'll just update the user's subscription
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'subscription.plan': planId,
                    'subscription.status': 'active',
                    'subscription.startDate': new Date(),
                    'subscription.endDate': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                }
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: `Successfully upgraded to ${planName} plan`,
            data: { subscription: user.subscription }
        });
    } catch (error) {
        console.error('Upgrade plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error upgrading plan'
        });
    }
};

module.exports = exports;