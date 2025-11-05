import { render, screen } from '@testing-library/react';
import { BacktestEquityCurve } from '../backtest-equity-curve';
import { EquityPoint } from '@/types/trading';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
}));

const mockEquityData: EquityPoint[] = [
  {
    date: new Date('2023-01-01'),
    equity: 100000,
    drawdown: 0,
    returns: 0,
  },
  {
    date: new Date('2023-01-02'),
    equity: 105000,
    drawdown: 0,
    returns: 5,
  },
  {
    date: new Date('2023-01-03'),
    equity: 110000,
    drawdown: 0,
    returns: 4.76,
  },
];

describe('BacktestEquityCurve', () => {
  it('renders equity curve with data', () => {
    render(<BacktestEquityCurve data={mockEquityData} />);
    
    expect(screen.getByText('Equity Curve')).toBeInTheDocument();
    expect(screen.getByText('Final Equity')).toBeInTheDocument();
    expect(screen.getAllByText('$110,000')).toHaveLength(2); // Header and summary
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders empty state when no data provided', () => {
    render(<BacktestEquityCurve data={[]} />);
    
    expect(screen.getByText('Equity Curve')).toBeInTheDocument();
    expect(screen.getByText('No equity curve data available')).toBeInTheDocument();
  });

  it('displays custom title when provided', () => {
    render(<BacktestEquityCurve data={mockEquityData} title="Custom Equity Chart" />);
    
    expect(screen.getByText('Custom Equity Chart')).toBeInTheDocument();
  });

  it('shows summary statistics', () => {
    render(<BacktestEquityCurve data={mockEquityData} />);
    
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
    expect(screen.getByText('$100,000')).toBeInTheDocument(); // Start value
    expect(screen.getByText('10.00%')).toBeInTheDocument(); // Change percentage
  });
});