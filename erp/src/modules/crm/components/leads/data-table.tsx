
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    getFilteredRowModel,
    type ColumnFiltersState,
    type RowSelectionState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useMemo, type ReactNode } from "react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey: string
    /** Pass controlled search value + handler to replace the built-in search bar */
    searchValue?: string
    onSearchChange?: (value: string) => void
    searchPlaceholder?: string
    /** Enable row checkboxes. Requires rows to have an `id` field. */
    enableSelection?: boolean
    onSelectionChange?: (ids: string[]) => void
    /** If provided, renders this on mobile instead of the table. */
    renderMobileCard?: (row: TData, meta: { isSelected: boolean; onSelect: (v: boolean) => void }) => ReactNode
    /** Called when a table row body is clicked (not checkbox/actions cells). */
    onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search…",
    enableSelection,
    onSelectionChange,
    renderMobileCard,
    onRowClick,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

    const isControlled = searchValue !== undefined && onSearchChange !== undefined;

    // Reset selection when data changes
    useEffect(() => { setRowSelection({}) }, [data])

    // Notify parent when selection changes
    useEffect(() => {
        if (!onSelectionChange) return;
        const ids = Object.keys(rowSelection).filter(k => rowSelection[k]);
        onSelectionChange(ids);
    }, [rowSelection, onSelectionChange])

    const checkboxColumn: ColumnDef<TData, unknown> = useMemo(() => ({
        id: "__select__",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected()
                        ? true
                        : table.getIsSomePageRowsSelected()
                        ? "indeterminate"
                        : false
                }
                onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={v => row.toggleSelected(!!v)}
                aria-label="Select row"
                onClick={e => e.stopPropagation()}
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
    }), [])

    const allColumns = useMemo(
        () => (enableSelection ? [checkboxColumn, ...columns] : columns),
        [enableSelection, checkboxColumn, columns]
    )

    const table = useReactTable({
        data,
        columns: allColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        getRowId: (row: any) => row.id,
        state: { sorting, columnFilters, rowSelection },
    })

    const rows = table.getRowModel().rows;

    const searchBar = (
        <div className="flex items-center py-4">
            <Input
                placeholder={searchPlaceholder}
                value={
                    isControlled
                        ? searchValue
                        : ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "")
                }
                onChange={e => {
                    if (isControlled) {
                        onSearchChange!(e.target.value);
                    } else {
                        table.getColumn(searchKey)?.setFilterValue(e.target.value);
                    }
                }}
                className="w-full"
            />
        </div>
    );

    const pagination = (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
            </Button>
        </div>
    );

    return (
        <div>
            {searchBar}

            {/* ── Mobile card list ─────────────────────────────────── */}
            {renderMobileCard && (
                <div className="md:hidden">
                    {rows.length === 0 ? (
                        <p className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                            No leads found.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {rows.map(row =>
                                renderMobileCard(row.original, {
                                    isSelected: row.getIsSelected(),
                                    onSelect: v => row.toggleSelected(v),
                                })
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Desktop table ─────────────────────────────────────── */}
            <div className={renderMobileCard ? "hidden md:block" : ""}>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id} style={header.column.id === "__select__" ? { width: 40 } : undefined}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {rows.length ? (
                                rows.map(row => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={onRowClick ? "cursor-pointer" : ""}
                                        onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={allColumns.length} className="h-24 text-center text-muted-foreground">
                                        No leads found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {pagination}
        </div>
    )
}
