"use client"

import { Table } from "@tanstack/react-table"
import { Button } from "../ui/button"
import { Download } from "lucide-react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  rightSlot?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  rightSlot,
}: DataTableToolbarProps<TData>) {
  const handleExport = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const dataToExport = selectedRows.map(row => row.original);
    
    // Simple CSV export
    const headers = Object.keys(dataToExport[0] as any);
    const csvContent = [
      headers.join(','),
      ...dataToExport.map((row: any) => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = `transactions-${new Date().toISOString()}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-2">
        {rightSlot}
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={handleExport}
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}
