import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import TCard from '@/components/t_card'
import {IDevice} from "@/lib/utils";
import {Button} from "@/components/ui/button"
import API from "@/lib/api";
import {useEffect, useState} from "react";
import * as React from "react";
import {Switch} from "@/components/ui/switch"
import {ReloadIcon} from "@radix-ui/react-icons";
import createSocket from "@/lib/socket";
import {toast} from "react-toastify";
import {Label} from "@/components/ui/label";

export default function Devices({count}) {
    const [devices, setDevices] = useState<IDevice[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = () => {
        setLoading(true)
        API.get('/api/devices').then((res) => {
            const data = res.data
            setDevices(data['devices'])
            count(data['devices'].length)
            setLoading(false)
        }).catch((err) => {
            console.log(err)
            setLoading(false)
        })
    }
    useEffect(() => {
        refresh()
    }, [])
    const handleRefresh = () => {
        refresh()
    }
    const handleReset = () => {
        API.delete('/api/devices').then((res) => {
            setDevices([])
            count(0)
        })
    }
    return (
        <TCard title="已连接的设备" loading={loading}>
            <div className="flex items-center ">
                <Button onClick={handleRefresh} variant="destructive" disabled={loading} className="mr-5">
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" hidden={!loading}/>
                    刷新
                </Button>
                <Button onClick={handleReset}>重置</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>序号</TableHead>
                        <TableHead>设备ID</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {devices &&
                        devices.map((account: IDevice, index: number) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{account.device_id}</TableCell>
                                </TableRow>
                            )
                        })}
                </TableBody>
            </Table>
        </TCard>
    )
}