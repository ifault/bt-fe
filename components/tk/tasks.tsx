import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import TCard from '@/components/t_card'
import API from "@/lib/api";
import {useEffect, useState} from "react";
import {ITask} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {ReloadIcon} from "@radix-ui/react-icons";

export default function Tasks({count}) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const refresh = () => {
        setLoading(true)
        API.get('/api/tasks', {}).then((res) => {
            setTasks(res.data)
            count(res.data.length)
            setLoading(false)
        }).catch((err) => {
            console.log(err)
            setLoading(false)
        })
    }
    useEffect(() => {
        refresh()
    }, [])
    const handleReset = () => {
        API.delete('/api/tasks').then((res) => {
            setTasks([])
            count(0)
        })
    }
    const handleRefresh = () => {
        refresh()
    }
    return (
        <TCard title="任务" loading={loading}>
            <br/>
            <div className="flex">
                <Button onClick={handleRefresh} variant="destructive" disabled={loading} className="mr-5">
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" hidden={!loading}/>
                    刷新
                </Button>
                <Button onClick={handleReset}>清空</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>序号</TableHead>
                        <TableHead>运行设备</TableHead>
                        <TableHead>任务</TableHead>
                        <TableHead>内容</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>创建时间</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks &&
                        tasks.map((account: ITask, index: number) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{account.device}</TableCell>
                                    <TableCell>{account.category}</TableCell>
                                    <TableCell>{account.content}</TableCell>
                                    <TableCell>{account.status}</TableCell>
                                    <TableCell>{account.created_at}</TableCell>
                                </TableRow>
                            )
                        })}
                </TableBody>
            </Table>
        </TCard>
    )
}