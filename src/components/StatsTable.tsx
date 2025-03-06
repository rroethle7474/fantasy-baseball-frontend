import React from 'react';

interface StatsTableProps {
  headers: string[];
  values: (number | string)[];
  title: string;
}

const StatsTable: React.FC<StatsTableProps> = ({ headers, values, title }) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              {headers.map((header, index) => (
                <th key={index} className="py-3 px-4 text-left font-semibold text-gray-700 border-b">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              {values.map((value, index) => (
                <td key={index} className="py-3 px-4 font-medium text-gray-800">
                  {typeof value === 'number' ? 
                    // Format numbers: integers as whole numbers, decimals with 3 places
                    Number.isInteger(value) ? value : value.toFixed(3) 
                    : value}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsTable; 