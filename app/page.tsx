'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import TDevices from '@/components/t_devices'
import TAccounts from '@/components/t_accounts'
import { API_URL } from '@/lib/constant';
export default function Home() {
  const { toast } = useToast()
  const [devices, setDevices] = useState([])
  const [tasks, setTasks] = useState([])
  useEffect(() => {
    const token = localStorage.getItem('token') || "ping"
    const manager = new WebSocket(`ws://${API_URL}/ws/manager`)
    let heartbeatInterval: any
    const startHearBeat = () => {
      heartbeatInterval = setInterval(() => {
        manager.send("ping")
      }, 1000)
    }
    const stopHearBeat = () => {
      clearInterval(heartbeatInterval)
    }
    manager.onopen = function () {
      toast({
        description: '服务器已连接',
      })
      manager.send(token || 'ping')
      startHearBeat()
    }
    manager.onmessage = function (event) {
      if (event.data === "401") {
        toast({
          description: '密钥失效，请重新登录',
        })
        setTimeout(() => { 
          window.location.href = '/login'
        }, 1000)
        return
      }
      var message = JSON.parse(event.data)
      setDevices(message.devices)
      setTasks(message.tasks)
      
    }
    manager.onclose = function (event) {
      stopHearBeat()
      toast({
        variant: 'destructive',
        description: '服务器连接已关闭',
      })
    }
  }, [])

  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <div className="flex min-h-screen p-5">
      <Toaster />
      <div className="w-7/12 p-4 sm:w-ful">
        <TAccounts tasks={tasks}></TAccounts>
      </div>
      <div className="w-5/12 p-4 sm:w-ful">
        <TDevices devices={devices}></TDevices>
      </div>
    </div>
  )
}