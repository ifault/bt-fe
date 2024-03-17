/* eslint-disable react/jsx-key */
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import axiso from 'axios'
import API from '@/lib/api'
import { Device } from '@/lib/utils'
import TCard from './t_card'
import { Button } from '@/components/ui/button'
export default function TDevices({ devices }: { devices: Device[] }) {
  
  
  const reset = () => {
    API.post('/api/reset', {})
   }
  return (
    <div>
     
      <TCard title={devices.length === 0 ? "等待设备连接" : devices.length +" 台连接的设备"}>
      <Button
            onClick={reset}
            variant="destructive"
           >
            重置
          </Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>序号</TableHead>
              <TableHead>设备名</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device: Device,index: number) => {
              return (
                <TableRow key={device.device_id}>
                    <TableCell>{index}</TableCell>
                  <TableCell className="font-medium">
                    {device.device_id}
                  </TableCell>
                  <TableCell>{device.status}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TCard>
    </div>
  )
}
