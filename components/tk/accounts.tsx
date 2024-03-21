import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import TCard from '@/components/t_card'
import {useEffect, useState} from 'react'
import API from '@/lib/api'
import {useToast} from '@/components/ui/use-toast'
import {Toaster} from '@/components/ui/toaster'
import {handleClipboardData, IAccount} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {v4 as uuidv4} from 'uuid';
import {ReloadIcon} from "@radix-ui/react-icons";

export default function Accounts({count}) {
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const {toast} = useToast()
    const handlePaste = (e) => {
        const result = handleClipboardData(e, 2).map((account: IAccount) => {
            return {
                uuid: uuidv4(),
                username: account[0],
                password: account[1]
            }
        })
        const total = [...accounts, ...result]
        setAccounts(total)
        count(total.length)
        API.post('/api/accounts', total).then((res) => {
            toast({
                description: '数据保存成功',
            })
            setLoading(false)
        }).catch((err) => {
            setLoading(false)
        })
    }
    useEffect(() => {
        API.get('/api/accounts').then((res) => {
            setAccounts(res.data)
            count(res.data.length)
            setLoading(false)
        }).catch((err) => {
            setLoading(false)
        })
    }, [])
    const handleClear = () => {
        setLoading(true)
        setAccounts([])
        API.delete('/api/accounts',).then((res) => {
            toast({
                description: '数去删除成功',
            })
            setLoading(false)
        }).catch((err) => {
            console.log(err)
            setLoading(false)
        })
    }
    const handlePrepare = () => {
        setLoading(true)
        API.post('/api/prepare', accounts).then((res) => {
            toast({
                description: '登录任务已提交',
            })
            setLoading(false)
        }).catch((err) => {
            setLoading(false)
        })
    }
    return (
        <TCard title="账号" loading={loading}>
            <Toaster/>
            <div className="flex justify-between">
                <Button onClick={handlePrepare} variant="destructive" disabled={loading} className="mr-5">
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" hidden={!loading}/>
                    登录账户
                </Button>

                <Button onClick={handleClear}>清空</Button>
            </div>
            <Table onPaste={(e) => handlePaste(e)}>
                <TableHeader>
                    <TableRow>
                        <TableHead>序号</TableHead>
                        <TableHead>用户名</TableHead>
                        <TableHead>密码</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {accounts &&
                        accounts.map((account: IAccount, index: number) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{account.username}</TableCell>
                                    <TableCell>{account.password}</TableCell>
                                </TableRow>
                            )
                        })}
                </TableBody>
            </Table>
        </TCard>
    )
}
