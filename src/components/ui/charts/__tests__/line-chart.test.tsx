import { render, screen } from '@testing-library/react';
import { LineChart } from '../line-chart';

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
  Brush: () => <div data-testid="brush" />,
}));

const mockData = [
  { timestamp: new Date('2023-01-01'), value: 100 },
  { timestamp: new Date('2023-01-02'), value: 105 },
  { timestamp: new Date('2023-01-03'), value: 110 },
];

describe('LineChart', () => {
  it('renders line chart with data', () => {
    render(<LineChart data={mockData} title="Test Chart" />);
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('renders empty state when no data provided', () => {
    render(<LineChart data={[]} title="Empty Chart" />);
    
    expect(screen.getByText('Empty Chart')).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<LineChart data={mockData} title="Loading Chart" loading={true} />);
    
    expect(screen.getByText('Loading Chart')).toBeInTheDocument();
    expect(screen.getByText('Loading Chart')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<LineChart data={mockData} title="Error Chart" error="Test error" />);
    
    expect(screen.getByText('Error Chart')).toBeInTheDocument();
    expect(screen.getByText('Error loading chart')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders with custom actions', () => {
    const actions = <button>Custom Action</button>;
    render(<LineChart data={mockData} title="Chart with Actions" actions={actions} />);
    
    expect(screen.getByText('Chart with Actions')).toBeInTheDocument();
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });
});