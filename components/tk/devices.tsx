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

export default function Devices({data}: { data: IDevice[] }) {

    const handlePrepare = () => {
        API.post('/api/prepare').then((res) => {
            console.log(res)
        })
    }



    const handleReset = () => {
        API.post('/api/reset').then((res) => {
            console.log(res)
        })
    }

    return (
        <TCard title="设备">
            <div className="flex">
                <Button onClick={handlePrepare}>准备账户</Button>

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
                    {data &&
                        data.map((account: IDevice, index: number) => {
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