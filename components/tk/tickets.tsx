"use client"
import {v4 as uuidv4} from 'uuid';
import * as React from "react"
import {
    CaretSortIcon,
    DotsHorizontalIcon, ReloadIcon,
} from "@radix-ui/react-icons"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable, PaginationState,
} from "@tanstack/react-table"
import {useToast} from '@/components/ui/use-toast'
import {Toaster} from '@/components/ui/toaster'
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Input} from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {useEffect, useState} from "react";
import {handleClipboardData} from "@/lib/utils";
import API from "@/lib/api";
import {BeatLoader} from "react-spinners";
import TCard from "@/components/t_card";

export type ITicket = {
    uuid: string,
    category: string
    card: string
    zhifubao: string
    date: string
    count: number
}

const NewTableCell = ({getValue, row, column, table}) => {
    const initialValue = getValue()
    const [value, setValue] = useState(initialValue)
    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    const onBlur = () => {
        table.options.meta?.updateData(row.index, column.id, value)
    }
    return (
        <Input
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={onBlur}
        />
    )
}


export const columns: ColumnDef<ITicket>[] = [
    {
        id: "select",
        header: ({table}) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({row}) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "category",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    种类
                    <CaretSortIcon className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        cell: NewTableCell,
    },
    {
        accessorKey: "card",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    身份证
                    <CaretSortIcon className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        cell: NewTableCell,
    },
    {
        accessorKey: "zhifubao",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    支付宝
                    <CaretSortIcon className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        // cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
        cell: NewTableCell,
    },
    {
        accessorKey: "date",
        header: () => <div className="text-right">日期</div>,
        cell: NewTableCell,
    },
    {
        accessorKey: "count",
        header: () => <div className="text-right">数量</div>,
        cell: NewTableCell,
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({getValue, row, column, table}) => {
            const ticket = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">打开菜单</span>
                            <DotsHorizontalIcon className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => {
                                table.options.meta?.removeRow(row.index, ticket.uuid)
                            }}
                        >
                            删除
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export default function Tickets({count}) {
    const {toast} = useToast()
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    let [loading, setLoading] = useState(false);
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 200,
    });
    const [editedRows, setEditedRows] = useState({});
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [data, setData] = useState(() => []);
    useEffect(() => {
        setLoading(true)
        API.get('/api/tickets',{}).then((res) => {
            setData(res.data)
            count(res.data.length)
            setLoading(false)
        }).catch((err) => {
            console.log(err)
            setLoading(false)
        })
    }, [])

    const handlePaste = (e) => {
        setLoading(true)
        const result = handleClipboardData(e, 5).map((account: ITicket) => {
            return {
                category: account[0],
                card: account[1],
                zhifubao: account[2],
                date: account[3],
                count: account[4],
                uuid: uuidv4()
            }
        })

        const formated = [...data, ...result]
        API.post('/api/tickets', result).then((res) => {
            setData(formated)
            toast({
                description: '数据保存成功',
            })
            count(formated.length)
            setLoading(false)
        }).catch((err) => {
            setLoading(false)
            console.log(err)
        })
    }
    const updateRow = (data) => {
        setLoading(true)
        API.put('/api/tickets', data).then((res) => {
            setLoading(false)
            toast({
                description: '数据更新成功',
            })
        }).catch((err) => {
            console.log(err)
            setLoading(false)
        })
    }
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            pagination,
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        meta: {
            editedRows,
            setEditedRows,
            removeRow: (rowIndex: number, uuid: string) => {
                const setFilterFunc = (old: ITicket[]) =>
                    old.filter((_row: ITicket, index: number) => index !== rowIndex);
                setData(setFilterFunc);
                API.delete('/api/tickets', {data: {uuid: uuid}}).then((res) => {
                    toast({
                        description: '数据删除成功',
                    })
                }).catch((err) => {
                    console.log(err)
                })
            },
            updateData: (rowIndex: number, columnId: string, value: string) => {
                setData((old) =>
                    old.map((row, index) => {
                        if (index === rowIndex) {
                            const res = {
                                ...old[rowIndex],
                                [columnId]: value,
                            }

                            if(old[rowIndex][columnId] != value){
                                updateRow(res)
                            }
                            return res;
                        }
                        return row;
                    })
                );
            },
        }
    })
    const handleBook = () => {
        setLoading(true)
        const selected = table.getSelectedRowModel().flatRows.map((row) => {
            return row.original
        })
        if (selected.length > 0) {
            API.post('/api/book', selected).then((res) => {
                toast({
                    description: '开始创建任务',
                })
                setLoading(false)
            }).catch((err) => {
                toast({
                    variant: "destructive",
                    description: '任务创建失败',
                })
                setLoading(false)
            })
        }
    }
    return (

        <TCard title="已连接的设备" loading={loading} onPaste={handlePaste}>
        <div className="w-full" onPaste={handlePaste}>
            <Toaster/>
            <div className="flex items-center py-4 justify-between">
                <Button onClick={handleBook} variant="destructive" disabled={loading} className="mr-5">
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" hidden={!loading}/>
                    开始
                </Button>
                <Input
                    placeholder="过滤身份证..."
                    value={(table.getColumn("card")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("card")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <div className="flex-1 text-sm text-muted-foreground pl-20">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} 个 被选择.
                </div>


            </div>
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
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    没有记录.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
        </TCard>
    )
}
