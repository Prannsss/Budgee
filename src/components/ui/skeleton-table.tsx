import { Skeleton } from "./skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./table";

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  className 
}: SkeletonTableProps) {
  return (
    <div className={className}>
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton 
                    className={`h-4 ${
                      colIndex === 0 ? 'w-24' : 
                      colIndex === columns - 1 ? 'w-16' : 'w-20'
                    }`} 
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface SkeletonTransactionRowProps {
  className?: string;
}

export function SkeletonTransactionRow({ className }: SkeletonTransactionRowProps) {
  return (
    <TableRow className={className}>
      <TableCell>
        <div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20 mt-1 md:hidden" />
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16 mt-1" />
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </TableCell>
    </TableRow>
  );
}