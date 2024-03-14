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
  
  import { Task } from '@/lib/utils'
  import TCard from './t_card'
  
  export default function TTasks({ tasks }: { tasks: Task[] }) {
    return (
      <div>
        <TCard title="任务列表">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>任务名</TableHead>
                <TableHead>设备名</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              
            </TableBody>
          </Table>
        </TCard>
      </div>
    )
  }
  