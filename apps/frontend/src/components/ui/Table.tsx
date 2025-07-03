import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        {children}
      </table>

      <style jsx>{`
        .table-container {
          background: var(--background-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-light);
          overflow: hidden;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-family);
        }

        .table th {
          background: var(--background-light);
          color: var(--text-primary);
          font-weight: var(--font-semibold);
          font-size: var(--text-sm);
          text-align: left;
          padding: var(--space-md);
          border-bottom: 1px solid var(--border-light);
          white-space: nowrap;
        }

        .table td {
          padding: var(--space-md);
          border-bottom: 1px solid var(--border-light);
          font-size: var(--text-sm);
          color: var(--text-primary);
          vertical-align: middle;
        }

        .table tbody tr {
          transition: background-color 0.2s ease;
        }

        .table tbody tr:hover {
          background: var(--background-light);
        }

        .table tbody tr:last-child td {
          border-bottom: none;
        }

        .table tbody tr.cursor-pointer {
          cursor: pointer;
        }

        .table tbody tr.cursor-pointer:hover {
          background: var(--color-primary-light);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .table-container {
            overflow-x: auto;
          }

          .table th,
          .table td {
            padding: var(--space-sm);
            font-size: var(--text-xs);
          }
        }
      `}</style>
    </div>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return (
    <thead className={className}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableRowProps> = ({ children, className = '', onClick }) => {
  return (
    <tr 
      className={`${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export const TableCell: React.FC<TableCellProps> = ({ children, className = '', colSpan }) => {
  return (
    <td className={className} colSpan={colSpan}>
      {children}
    </td>
  );
};

export const TableHeaderCell: React.FC<TableCellProps> = ({ children, className = '', colSpan }) => {
  return (
    <th className={className} colSpan={colSpan}>
      {children}
    </th>
  );
}; 