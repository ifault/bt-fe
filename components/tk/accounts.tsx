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

export default function Accounts({data}: { data: IAccount[] }) {
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const {toast} = useToast()
    const handlePaste = (e) => {
        const result = handleClipboardData(e, 2).map((account: IAccount) => {
            return {
                username: account[0],
                password: account[1]
            }
        })
        setAccounts([...accounts, ...result])
        API.post('/api/accounts', [...accounts, ...result]).then((res) => {
            toast({
                description: '数据保存成功',
            })
            setLoading(false)
        }).catch((err) => {
            console.log(err)
        })
    }
    useEffect(() => {
        setAccounts(data || accounts)
        if (data.length > 0) setLoading(false)
    }, [data])
    const handleClear = () => {
        setAccounts([])
        API.post('/api/accounts', []).then((res) => {
            toast({
                description: '数据保存成功',
            })
            setLoading(false)
        }).catch((err) => {
            console.log(err)
        })
    }
    return (
        <TCard title="账号" loading={loading}>
            <Toaster/>
            <Button onClick={handleClear}>清空</Button>
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
