"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Download, X } from "lucide-react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().globalFilter?.length > 0

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
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter by description..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) =>
            table.setGlobalFilter(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.setGlobalFilter("")}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="ml-auto h-8"
        onClick={handleExport}
        disabled={table.getFilteredSelectedRowModel().rows.length === 0}
      >
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  )
}
