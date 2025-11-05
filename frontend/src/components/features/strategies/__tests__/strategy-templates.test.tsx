import { render, screen, fireEvent } from '@testing-library/react';
import { StrategyTemplates } from '../strategy-templates';
import { mockStrategyTemplates } from '@/mocks/data/strategies';

const mockProps = {
  templates: mockStrategyTemplates,
  onSelectTemplate: jest.fn(),
  onCloneTemplate: jest.fn(),
  onPreviewTemplate: jest.fn(),
};

describe('StrategyTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders strategy templates correctly', () => {
    render(<StrategyTemplates {...mockProps} />);
    
    expect(screen.getByText('Strategy Templates')).toBeInTheDocument();
    expect(screen.getByText('Moving Average Crossover')).toBeInTheDocument();
    expect(screen.getByText('RSI Mean Reversion')).toBeInTheDocument();
  });

  it('filters templates by search query', () => {
    render(<StrategyTemplates {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'RSI' } });
    
    expect(screen.getByText('RSI Mean Reversion')).toBeInTheDocument();
    expect(screen.queryByText('Moving Average Crossover')).not.toBeInTheDocument();
  });

  it('filters templates by category', () => {
    render(<StrategyTemplates {...mockProps} />);
    
    const categorySelect = screen.getByDisplayValue('All');
    fireEvent.change(categorySelect, { target: { value: 'Mean Reversion' } });
    
    expect(screen.getByText('RSI Mean Reversion')).toBeInTheDocument();
    expect(screen.queryByText('Moving Average Crossover')).not.toBeInTheDocument();
  });

  it('calls onSelectTemplate when Use Template is clicked', () => {
    render(<StrategyTemplates {...mockProps} />);
    
    const useButtons = screen.getAllByText('Use Template');
    fireEvent.click(useButtons[0]);
    
    expect(mockProps.onSelectTemplate).toHaveBeenCalledTimes(1);
    expect(mockProps.onSelectTemplate).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      category: expect.any(String),
    }));
  });

  it('calls onPreviewTemplate when Preview is clicked', () => {
    render(<StrategyTemplates {...mockProps} />);
    
    const previewButtons = screen.getAllByText('Preview');
    fireEvent.click(previewButtons[0]);
    
    expect(mockProps.onPreviewTemplate).toHaveBeenCalledTimes(1);
    expect(mockProps.onPreviewTemplate).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      category: expect.any(String),
    }));
  });

  it('calls onCloneTemplate when Clone is clicked', () => {
    render(<StrategyTemplates {...mockProps} />);
    
    const cloneButtons = screen.getAllByText('Clone');
    fireEvent.click(cloneButtons[0]);
    
    expect(mockProps.onCloneTemplate).toHaveBeenCalledTimes(1);
    expect(mockProps.onCloneTemplate).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      category: expect.any(String),
    }));
  });

  it('shows no templates message when filtered results are empty', () => {
    render(<StrategyTemplates {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText('No templates found')).toBeInTheDocument();
  });
});