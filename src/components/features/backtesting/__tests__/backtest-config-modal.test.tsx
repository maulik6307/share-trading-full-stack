import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BacktestConfigModal } from '../backtest-config-modal';
import { mockStrategies } from '@/mocks/data/strategies';

const mockProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  strategy: mockStrategies[0],
};

describe('BacktestConfigModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(<BacktestConfigModal {...mockProps} />);
    
    expect(screen.getByText('Configure Backtest')).toBeInTheDocument();
    expect(screen.getByText('Basic Settings')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Financial Settings')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<BacktestConfigModal {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('Configure Backtest')).not.toBeInTheDocument();
  });

  it('shows strategy name when strategy is provided', () => {
    render(<BacktestConfigModal {...mockProps} />);
    
    expect(screen.getByText('Strategy:')).toBeInTheDocument();
    expect(screen.getByText(mockStrategies[0].name)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<BacktestConfigModal {...mockProps} />);
    
    const submitButton = screen.getByText('Start Backtest');
    
    // Clear the name field
    const nameInput = screen.getByLabelText('Backtest Name');
    fireEvent.change(nameInput, { target: { value: '' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Backtest name is required')).toBeInTheDocument();
    });
    
    expect(mockProps.onSubmit).not.toHaveBeenCalled();
  });

  it('has date inputs', () => {
    render(<BacktestConfigModal {...mockProps} />);
    
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('submits valid configuration', async () => {
    render(<BacktestConfigModal {...mockProps} />);
    
    const nameInput = screen.getByLabelText('Backtest Name');
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    const capitalInput = screen.getByLabelText('Initial Capital ($)');
    
    fireEvent.change(nameInput, { target: { value: 'Test Backtest' } });
    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2023-12-31' } });
    fireEvent.change(capitalInput, { target: { value: '50000' } });
    
    const submitButton = screen.getByText('Start Backtest');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith({
        name: 'Test Backtest',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        initialCapital: 50000,
        commission: 0.1,
        slippage: 0.05,
      });
    });
  });

  it('calls onClose when cancel is clicked', () => {
    render(<BacktestConfigModal {...mockProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});