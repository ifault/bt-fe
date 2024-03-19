import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import TCard from '@/components/t_card'
import {handleClipboardData, ITicket} from "@/lib/utils";
import API from "@/lib/api";
import {useEffect, useState} from "react";
import {useToast} from '@/components/ui/use-toast'
import {Toaster} from '@/components/ui/toaster'
import {Button} from "@/components/ui/button";
import { v4 as uuidv4 } from 'uuid';
export default function Tickets({data}: { data: ITicket[] }) {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const {toast} = useToast()
    const handlePaste = (e) => {
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

        const formated = [...tickets, ...result]
        setTickets(formated)
        API.post('/api/tickets', formated).then((res) => {
            toast({
                description: '数据保存成功',
            })
            setLoading(false)
        }).catch((err) => {
            console.log(err)
        })
    }
    useEffect(() => {
        setTickets(data || tickets)
        if (data.length > 0) setLoading(false)
    }, [])

    const handleClear = () => {
        setTickets([])
        API.post('/api/tickets', []).then((res) => {
            toast({
                description: '数据保存成功',
            })
            setLoading(false)
        }).catch((err) => {
            console.log(err)
        })
    }
    const handleBook = () => {
        API.post('/api/book').then((res) => {
            console.log(res)
        })
    }
    return (
        <TCard title="订票信息" loading={loading}>
            <Toaster/>
            <div className="flex">
                <Button onClick={handleClear}>清空</Button>
                <div style={{marginLeft: '10px'}}></div>
                <Button onClick={handleBook} variant="destructive">开始抢票</Button>
            </div>

            <Table onPaste={(e) => handlePaste(e)}>
                <TableHeader>
                    <TableRow>
                        <TableHead>序号</TableHead>
                        <TableHead>种类</TableHead>
                        <TableHead>身份证号码</TableHead>
                        <TableHead>支付宝账户</TableHead>
                        <TableHead>订票日期</TableHead>
                        <TableHead>订票数量</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets &&
                        tickets.map((ticket: ITicket, index: number) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{ticket.category}</TableCell>
                                    <TableCell>{ticket.card}</TableCell>
                                    <TableCell>{ticket.zhifubao}</TableCell>
                                    <TableCell>{ticket.date}</TableCell>
                                    <TableCell>{ticket.count}</TableCell>
                                </TableRow>
                            )
                        })}
                </TableBody>
            </Table>
        </TCard>
    )
}