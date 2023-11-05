import * as React from "react";

import { save } from "@tauri-apps/api/dialog";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { stringify } from "csv-stringify/browser/esm/sync";

import {
    Text,
    Grid,
    Flex,
    Card,
    Group,
    Stack,
} from "@mantine/core";

import {
    ColumnDef,
    flexRender,
    SortingState,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";



interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),

        getPaginationRowModel: getPaginationRowModel(),

        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),

        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),

        onColumnVisibilityChange: setColumnVisibility,

        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    const exportClicked = async () => {
        console.log("exportClicked");
        console.log(table.getFilteredRowModel().flatRows.length);
        console.log(table.getVisibleFlatColumns().length);

        let data: {}[] = [];
        for (let row of table.getFilteredRowModel().rows) {
            let object: {
                [key: string]: string
            } = {};
            for (let column of table.getVisibleFlatColumns()) {
                object[column.id] = row.getValue(column.id);
            }
            data.push(object);
        }

        try {
            const file_path = await save({
                title: "Export CSV",
                filters: [
                    {
                        name: "CSV",
                        extensions: ["csv"],
                    },
                ],
            });

            if (file_path === null) {
                console.log("canceld.");
            } else {
                if (typeof file_path === "string") {
                    const output = stringify(data, { header: true });
                    await writeTextFile(file_path, output, { append: false });
                }
            }
        } catch (err) {
            console.error(err);
        }

    };

    return (
        <Grid align="stretch" columns={12}>
            <Grid.Col span={12}>
                <Grid align="stretch" columns={12}>
                    <Grid.Col span={10}>
                        <Flex
                            mih={50}
                            gap="xl"
                            justify="flex-start"
                            align="center"
                            direction="row"
                            wrap="wrap"
                        >
                            {/* <Group> */}
                            <Input
                                placeholder="Filter authors..."
                                value={(table.getColumn("author_name")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("author_name")?.setFilterValue(event.target.value)
                                }
                                className="max-w-sm"
                            />
                            <Flex
                                mih={50}
                                gap="xl"
                                justify="flex-start"
                                align="center"
                                direction="row"
                                wrap="wrap"
                            >
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="ml-auto">
                                            Visible Columns
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {table
                                            .getAllColumns()
                                            .filter((column) => column.getCanHide())
                                            .map((column) => {
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        key={column.id}
                                                        className="capitalize"
                                                        checked={column.getIsVisible()}
                                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                    >
                                                        {column.id}
                                                    </DropdownMenuCheckboxItem>
                                                );
                                            })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </Flex>
                            {/* </Group> */}

                        </Flex>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Flex
                            mih={50}
                            gap="xl"
                            justify="flex-start"
                            align="center"
                            direction="row"
                            wrap="wrap"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportClicked}
                                disabled={table.getRowModel().rows.length == 0}
                            >
                                Export
                            </Button>
                        </Flex>

                    </Grid.Col>

                    <Grid.Col span={12}>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead key={header.id}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </TableHead>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </Grid.Col>
                </Grid>
            </Grid.Col>
        </Grid >

    );
}
