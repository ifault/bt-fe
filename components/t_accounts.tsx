import TCard from './t_card'
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Toaster } from '@/components/ui/toaster'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useToast } from '@/components/ui/use-toast'
import API from '@/lib/api'
import { v4 as uuidv4 } from 'uuid';
import { IDAccount } from '@/lib/utils'

export default function TAccounts({ tasks }: { tasks: IDAccount[] }) {
  const { toast } = useToast()
  const [rowClassNames, setRowClassNames] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[][]>([])
  const [type, setType] = useState<string>('01')
  const [disabledButton, setDisabledButton] = useState<boolean>(false)
  const formatPastedText = (data: string) => {
    const rows = data.split('\n')
    const result = rows.map((row) => {
      let columns = row.split(',')
      return columns.map((column) => column.trim())
    })
    setAccounts([...result, ...accounts])
  }

  const handlePaste = (event: any) => {
    const clipboardData = event.clipboardData || window.clipboardData
    const pastedText = clipboardData.getData('text')
    formatPastedText(pastedText)
  }

  const clear = () => {
    setAccounts([])
  }

  const submit = () => {
    const formatedAccounts = accounts.map((account) => {
      return {
        id: uuidv4(),
        username: account[0],
        password: account[1],
        idcard: account[2],
        date: account[3],
      }
    })
    const data = {
      type: type,
      accounts: formatedAccounts,
    }
    API.post('/api/prepare', { ...data })
    setDisabledButton(true)
    toast({
      description: '任务创建成功',
    })
  }

  const handleSelect = (value: string) => {
    setType(value)
  }

  function getStatusClassName(status: string) {
    if (status === "1") {
      return 'bg-yellow-500'; // 使用 yellow 样式类名
    } else if (status === "2") {
      return 'bg-green-500'; // 使用 green 样式类名
    } else {
      return ''; // 没有其他样式类名
    }
  }

  return (
    <div onPaste={handlePaste}>
      <Toaster />
      <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">表单</TabsTrigger>
        <TabsTrigger value="password">任务列表</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
      <TCard title="把账户粘贴到这里">
        
        <div className="flex space-x-2 justify-around">
          <Button onClick={clear}>清空</Button>
          <RadioGroup defaultValue={type} onValueChange={handleSelect}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="01" id="oneday" />
              <Label htmlFor="option-one">登录</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="02" id="oneday" />
              <Label htmlFor="option-one">一日票</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="03" id="morning" />
              <Label htmlFor="option-two">早享卡</Label>
            </div>
          </RadioGroup>
          <Button
            onClick={submit}
            variant="destructive">
            准备
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>序号</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>密码</TableHead>
              <TableHead>身份证</TableHead>
              <TableHead>时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts &&
              accounts.map((account: string[], index: number) => {
                return (
                  <TableRow key={index} className={rowClassNames[index]}>
                    <TableCell>{index+1}</TableCell>
                    <TableCell>{account[0]}</TableCell>
                    <TableCell>{account[1]}</TableCell>
                    <TableCell>{account[2]}</TableCell>
                    <TableCell>{account[3]}</TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
        <br />
      </TCard>
      </TabsContent>
      <TabsContent value="password">
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>序号</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>密码</TableHead>
              <TableHead>身份证</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>名称</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks &&
              tasks.map((account: IDAccount, index: number) => {
                return (
                  <TableRow key={index} className={getStatusClassName(account.status)}>
                    <TableCell>{index+1}</TableCell>
                    <TableCell>{account.username}</TableCell>
                    <TableCell>{account.password}</TableCell>
                    <TableCell>{account.idcard}</TableCell>
                    <TableCell>{account.date}</TableCell>
                    <TableCell>{account.category}</TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
      
    </div>
  )
}
