import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataTable, ColumnDef } from '../data-table';

// Mock data for testing
interface TestData {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const mockData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
];

const mockColumns: ColumnDef<TestData>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortable: true,
    searchable: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    sortable: true,
    searchable: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    sortable: true,
  },
];

describe('DataTable', () => {
  it('renders table with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('active')).toHaveLength(2);
  });

  it('displays empty message when no data', () => {
    render(
      <DataTable 
        data={[]} 
        columns={mockColumns} 
        emptyMessage="No users found" 
      />
    );
    
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<DataTable data={[]} columns={mockColumns} loading />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles sorting functionality', async () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    // After sorting, Bob should come first (alphabetically)
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Bob Johnson');
  });

  it('handles search functionality', async () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns}
        filtering={{ globalSearch: true, searchPlaceholder: 'Search...' }}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'john' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('handles pagination', () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns}
        pagination={{ pageSize: 2 }}
      />
    );
    
    expect(screen.getByText('Showing 1 to 2 of 3 results')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('handles row selection', () => {
    const onRowSelect = jest.fn();
    
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns}
        selectable
        onRowSelect={onRowSelect}
      />
    );
    
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Click first data row checkbox
    
    expect(onRowSelect).toHaveBeenCalledWith([mockData[0]]);
  });

  it('handles row click', () => {
    const onRowClick = jest.fn();
    
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns}
        onRowClick={onRowClick}
      />
    );
    
    const firstRow = screen.getByText('John Doe').closest('tr');
    fireEvent.click(firstRow!);
    
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('renders custom cell content', () => {
    const customColumns: ColumnDef<TestData>[] = [
      {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        cell: ({ value }) => <strong>{value}</strong>,
      },
    ];
    
    render(<DataTable data={mockData} columns={customColumns} />);
    
    const strongElement = screen.getByText('John Doe');
    expect(strongElement.tagName).toBe('STRONG');
  });

  it('handles column alignment', () => {
    const alignedColumns: ColumnDef<TestData>[] = [
      {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        align: 'center',
      },
    ];
    
    render(<DataTable data={mockData} columns={alignedColumns} />);
    
    const headerCell = screen.getByText('Name').closest('th');
    expect(headerCell).toHaveClass('text-center');
  });
});