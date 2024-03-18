'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Accounts from '@/components/tk/accounts'
import Tickets from '@/components/tk/tickets'
import Devices from '@/components/tk/devices'
import API from '@/lib/api'
import createSocket from '@/lib/socket'
export default function Home() {
  const { toast } = useToast()
  const [devices, setDevices] = useState([])
  const [accounts, setAccounts] = useState([])
  const [tickets, setTickets] = useState([])
  useEffect(() => {
    API.get('/api/info').then((res) => {
      setAccounts(res.data['accounts'])
      setTickets(res.data['tickets'])
      console.log(res.data)
    })
    const manager = createSocket()
     manager.onmessage = function (event) {
      if (event.data === '401') {
        toast({
          description: '密钥失效，请重新登录',
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        return;
      }
      const message = JSON.parse(event.data);
      setDevices(message['devices'])
    };
  }, [])

  return (
    <div className="flex min-h-screen p-5 justify-center">
      <Toaster />
      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="grid w-2/3 grid-cols-3">
          <TabsTrigger value="accounts">账号</TabsTrigger>
          <TabsTrigger value="tickets">订票</TabsTrigger>
          <TabsTrigger value="devices">设备</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts">
          <Accounts data={accounts}></Accounts>
        </TabsContent>
        <TabsContent value="tickets">
          <Tickets data={tickets}></Tickets>
        </TabsContent>
        <TabsContent value="devices" >
          <Devices data={devices}></Devices>
        </TabsContent>
      </Tabs>
    </div>
  )
}