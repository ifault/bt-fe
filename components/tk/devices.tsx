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

export default function Devices({data}: { data: IDevice[] }) {
    const [devices, setDevices] = useState<IDevice[]>(data)
    const handlePrepare = () => {
        API.post('/api/prepare').then((res) => {
            console.log(res)
        })
    }

    const handleReset = () => {
        API.post('/api/reset').then((res) => {
            setDevices([])
        })
    }
    useEffect(() => {
        setDevices(data || devices)
    }, [data])
    return (
        <TCard title="设备">
            <blockquote className="mt-6 border-l-2 pl-6 italic">
             如果所有模拟器均已登录账户就不需要点击 "登录账户" 按钮，
                脚本会用已登录账户进行抢票,确保连接的模拟器均已登录账户
            </blockquote>
            <br/>
            <div className="flex">
                <Button onClick={handlePrepare}>登录账户</Button>
                <div style={{ marginLeft: '10px' }}></div>
                <Button onClick={handleReset}>重置</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>序号</TableHead>
                        <TableHead>设备ID</TableHead>
                        <TableHead>设备状态</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {devices &&
                        devices.map((account: IDevice, index: number) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{account.device_id}</TableCell>
                                    <TableCell>{account.status}</TableCell>
                                </TableRow>
                            )
                        })}
                </TableBody>
            </Table>
        </TCard>
    )
}