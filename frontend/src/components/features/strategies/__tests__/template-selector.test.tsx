import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateSelector } from '../template-selector';
import { mockStrategyTemplates } from '@/mocks/data/strategies';

const mockProps = {
  templates: mockStrategyTemplates,
  onSelectTemplate: jest.fn(),
  onCloneTemplate: jest.fn(),
  onPreviewTemplate: jest.fn(),
};

describe('TemplateSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders templates correctly', () => {
    render(<TemplateSelector {...mockProps} />);
    
    expect(screen.getByText('Moving Average Crossover')).toBeInTheDocument();
    expect(screen.getByText('RSI Mean Reversion')).toBeInTheDocument();
  });

  it('filters templates by search query', () => {
    render(<TemplateSelector {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'RSI' } });
    
    expect(screen.getByText('RSI Mean Reversion')).toBeInTheDocument();
    expect(screen.queryByText('Moving Average Crossover')).not.toBeInTheDocument();
  });

  it('calls onSelectTemplate when Use is clicked', () => {
    render(<TemplateSelector {...mockProps} />);
    
    const useButtons = screen.getAllByText('Use');
    fireEvent.click(useButtons[0]);
    
    expect(mockProps.onSelectTemplate).toHaveBeenCalledTimes(1);
  });

  it('calls onPreviewTemplate when Preview is clicked', () => {
    render(<TemplateSelector {...mockProps} />);
    
    const previewButtons = screen.getAllByText('Preview');
    fireEvent.click(previewButtons[0]);
    
    expect(mockProps.onPreviewTemplate).toHaveBeenCalledTimes(1);
  });

  it('calls onCloneTemplate when Clone is clicked', () => {
    render(<TemplateSelector {...mockProps} />);
    
    const cloneButtons = screen.getAllByText('Clone');
    fireEvent.click(cloneButtons[0]);
    
    expect(mockProps.onCloneTemplate).toHaveBeenCalledTimes(1);
  });
});