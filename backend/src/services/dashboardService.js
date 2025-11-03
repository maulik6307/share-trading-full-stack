const Portfolio = require('../models/Portfolio');
const PortfolioHistory = require('../models/PortfolioHistory');
const Position = require('../models/Position');
const Activity = require('../models/Activity');
const Alert = require('../models/Alert');

class DashboardService {

    /**
     * Get comprehensive dashboard data for a user
     */
    async getDashboardData(userId, options = {}) {
        const {
            includePerformance = true,
            includeActivities = true,
            includeAlerts = true,
            performanceDays = 30,
            activitiesLimit = 10,
            alertsLimit = 10
        } = options;

        try {
            // Get user's main portfolio
            const portfolio = await this.getUserMainPortfolio(userId);

            if (!portfolio) {
                // Create default portfolio for new users
                await this.createDefaultPortfolio(userId);
                return this.getEmptyDashboardData();
            }

            // Parallel data fetching for performance
            const [
                kpiData,
                performanceData,
                activities,
                alerts
            ] = await Promise.all([
                this.getKPIData(userId, portfolio._id),
                includePerformance ? this.getPerformanceData(userId, portfolio._id, performanceDays) : null,
                includeActivities ? Activity.getRecentActivities(userId, activitiesLimit) : null,
                includeAlerts ? Alert.getActiveAlerts(userId, alertsLimit) : null
            ]);

            return {
                portfolio: {
                    id: portfolio._id,
                    name: portfolio.name,
                    totalValue: portfolio.totalValue,
                    currency: portfolio.currency,
                    lastUpdated: portfolio.lastUpdated
                },
                kpi: kpiData,
                performance: performanceData,
                activities: activities || [],
                alerts: alerts || []
            };
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
            throw new Error('Failed to fetch dashboard data');
        }
    }

    /**
     * Get KPI data for dashboard cards
     */
    async getKPIData(userId, portfolioId) {
        try {
            const [portfolio, positions, history] = await Promise.all([
                Portfolio.findById(portfolioId),
                Position.find({ portfolioId, status: 'open' }),
                PortfolioHistory.find({ portfolioId })
                    .sort({ date: -1 })
                    .limit(30)
            ]);

            if (!portfolio) {
                throw new Error('Portfolio not found');
            }

            // Calculate metrics
            const totalPositions = positions.length;
            const profitablePositions = positions.filter(pos => pos.unrealizedPnL > 0).length;
            const activeStrategies = await this.getActiveStrategiesCount(userId);

            // Calculate win rate from recent history
            const winRate = this.calculateWinRate(history);

            // Get day change from history
            const dayChange = history.length > 1 ?
                ((history[0].totalValue - history[1].totalValue) / history[1].totalValue) * 100 : 0;

            // Calculate 30-day ROI
            const roi30d = history.length >= 30 ?
                ((history[0].totalValue - history[29].totalValue) / history[29].totalValue) * 100 : 0;

            return {
                portfolioValue: {
                    current: portfolio.totalValue,
                    change: {
                        value: dayChange,
                        period: 'today',
                        isPositive: dayChange >= 0
                    }
                },
                roi30d: {
                    current: roi30d,
                    change: {
                        value: roi30d > 0 ? Math.abs(roi30d * 0.1) : 0, // Mock comparison
                        period: 'vs last month',
                        isPositive: roi30d >= 0
                    }
                },
                activeStrategies: {
                    current: activeStrategies.total,
                    profitable: activeStrategies.profitable,
                    description: `${activeStrategies.profitable} profitable`
                },
                openPositions: {
                    current: totalPositions,
                    profitable: profitablePositions,
                    description: `${profitablePositions} in profit`
                },
                totalReturn: {
                    current: portfolio.totalReturn,
                    change: {
                        value: portfolio.totalReturnPercent,
                        period: 'all time',
                        isPositive: portfolio.totalReturn >= 0
                    }
                },
                winRate: {
                    current: winRate,
                    change: {
                        value: winRate > 50 ? 2.1 : -1.5, // Mock trend
                        period: '30d avg',
                        isPositive: winRate >= 50
                    }
                }
            };
        } catch (error) {
            console.error('KPI data fetch error:', error);
            throw new Error('Failed to fetch KPI data');
        }
    }

    /**
     * Get performance chart data
     */
    async getPerformanceData(userId, portfolioId, days = 30) {
        try {
            const performanceData = await PortfolioHistory.getPerformanceData(userId, portfolioId, days);

            return performanceData.map(item => ({
                date: item.date.toISOString().split('T')[0],
                value: Math.round(item.totalValue),
                benchmark: Math.round(item.benchmarkValue || item.totalValue * 0.95) // Mock benchmark
            }));
        } catch (error) {
            console.error('Performance data fetch error:', error);
            throw new Error('Failed to fetch performance data');
        }
    }

    /**
     * Get user's main portfolio
     */
    async getUserMainPortfolio(userId) {
        return Portfolio.findOne({ userId, isActive: true }).sort({ createdAt: 1 });
    }

    /**
     * Create default portfolio for new users
     */
    async createDefaultPortfolio(userId) {
        const portfolio = new Portfolio({
            userId,
            name: 'Main Portfolio',
            totalValue: 100000,
            cashBalance: 100000,
            currency: 'USD',
            isPaperTrading: true
        });

        await portfolio.save();

        // Create initial history entry
        const history = new PortfolioHistory({
            userId,
            portfolioId: portfolio._id,
            date: new Date(),
            totalValue: 100000,
            cashBalance: 100000,
            investedAmount: 0,
            benchmarkValue: 100000
        });

        await history.save();

        return portfolio;
    }

    /**
     * Get active strategies count (mock for now)
     */
    async getActiveStrategiesCount(userId) {
        // TODO: Implement when Strategy model is created
        return {
            total: Math.floor(Math.random() * 8) + 2, // 2-10 strategies
            profitable: Math.floor(Math.random() * 5) + 1 // 1-5 profitable
        };
    }

    /**
     * Calculate win rate from portfolio history
     */
    calculateWinRate(history) {
        if (history.length < 2) return 0;

        let wins = 0;
        let total = 0;

        for (let i = 1; i < history.length; i++) {
            if (history[i - 1].totalValue > history[i].totalValue) {
                wins++;
            }
            total++;
        }

        return total > 0 ? Math.round((wins / total) * 100 * 10) / 10 : 0;
    }

    /**
     * Get empty dashboard data for new users
     */
    getEmptyDashboardData() {
        return {
            portfolio: {
                id: null,
                name: 'Main Portfolio',
                totalValue: 100000,
                currency: 'USD',
                lastUpdated: new Date()
            },
            kpi: {
                portfolioValue: {
                    current: 100000,
                    change: { value: 0, period: 'today', isPositive: true }
                },
                roi30d: {
                    current: 0,
                    change: { value: 0, period: 'vs last month', isPositive: true }
                },
                activeStrategies: {
                    current: 0,
                    profitable: 0,
                    description: 'No strategies yet'
                },
                openPositions: {
                    current: 0,
                    profitable: 0,
                    description: 'No positions'
                },
                totalReturn: {
                    current: 0,
                    change: { value: 0, period: 'all time', isPositive: true }
                },
                winRate: {
                    current: 0,
                    change: { value: 0, period: '30d avg', isPositive: true }
                }
            },
            performance: [{
                date: new Date().toISOString().split('T')[0],
                value: 100000,
                benchmark: 100000
            }],
            activities: [],
            alerts: []
        };
    }

    /**
     * Update portfolio metrics (called by background job)
     */
    async updatePortfolioMetrics(userId, portfolioId) {
        try {
            const portfolio = await Portfolio.findById(portfolioId);
            if (!portfolio) return;

            await portfolio.calculateMetrics();

            // Create daily history snapshot
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existingHistory = await PortfolioHistory.findOne({
                portfolioId,
                date: today,
                snapshotType: 'daily'
            });

            if (!existingHistory) {
                const history = new PortfolioHistory({
                    userId,
                    portfolioId,
                    date: today,
                    totalValue: portfolio.totalValue,
                    cashBalance: portfolio.cashBalance,
                    investedAmount: portfolio.investedAmount,
                    dayChange: portfolio.dayChange,
                    dayChangePercent: portfolio.dayChangePercent,
                    totalReturn: portfolio.totalReturn,
                    totalReturnPercent: portfolio.totalReturnPercent,
                    benchmarkValue: portfolio.totalValue * 0.95, // Mock benchmark
                    snapshotType: 'daily'
                });

                await history.save();
            }
        } catch (error) {
            console.error('Portfolio metrics update error:', error);
        }
    }
}

module.exports = new DashboardService();