'use client'
import {useEffect, useRef, useState} from 'react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import Accounts from '@/components/tk/accounts'
import Tickets from '@/components/tk/tickets'
import Devices from '@/components/tk/devices'
import Tasks from "@/components/tk/tasks";
import createSocket from '@/lib/socket'
import {Badge} from "@/components/ui/badge"
import * as React from "react";
import {toast, ToastContainer, Slide} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSound from 'use-sound';
import sound from '/public/sound.mp3';
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import API from "@/lib/api";

export default function Home() {
    const [accountCount, setAccountCount] = useState(0)
    const [deviceCount, setDeviceCount] = useState(0)
    const [ticketCount, setTicketCount] = useState(0)
    const [taskCount, setTaskCount] = useState(0)
    const socket = useRef<WebSocket | null>(null);
    const [enabled, setEnabled] = useState(true)
    const [play] = useSound(sound, {volume: 2, soundEnabled: true});
    const handleWebSocket = () => {
        const manager = createSocket()
        manager.onmessage = function (event) {
            toast.success(event.data)
        };
        manager.onopen = function () {
            manager.send('ping');
            toast.success('连接成功')
        };
        socket.current = manager
    }
    const handleWebSocketOpen = () => {
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            toast.success('连接成功')
        } else {
            handleWebSocket()
        }
    }
    const handleWebSocketClose = () => {
        if (socket.current) {
            socket.current.close()
            socket.current = null
            toast.error('服务断开连接')
        }
    }
    const handleSocket = () => {
        API.put('/api/devices', {}).then((res) => {
            const enabled = res.data['enabled']
            setEnabled(enabled)
            enabled ? handleWebSocketOpen() : handleWebSocketClose()
        })
    }
    return (
        <div className="min-h-screen p-5 justify-center">
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme="light"
                transition={Slide}
            />
            <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" checked={enabled} className="ml-2"
                        onCheckedChange={handleSocket}/>
                <Label htmlFor="airplane-mode">{enabled ? '接收设备' : '停止接收'}</Label>
            </div>
            <br/>
            <Tabs defaultValue="accounts" className="w-full">
                <TabsList className="grid w-2/3 grid-cols-4">
                    <TabsTrigger value="accounts">账号<Badge className="ml-5"
                                                             variant="destructive">{accountCount}</Badge></TabsTrigger>
                    <TabsTrigger value="tickets">订票<Badge className="ml-5" variant="destructive">{ticketCount}</Badge></TabsTrigger>
                    <TabsTrigger value="devices">设备<Badge className="ml-5" variant="destructive">{deviceCount}</Badge></TabsTrigger>
                    <TabsTrigger value="tasks">任务<Badge className="ml-5"
                                                          variant="destructive">{taskCount}</Badge></TabsTrigger>
                </TabsList>
                <TabsContent value="accounts" className="justify-center">
                    <Accounts count={setAccountCount}></Accounts>
                </TabsContent>
                <TabsContent value="tickets" className="flex justify-center">
                    <Tickets count={setTicketCount}></Tickets>
                </TabsContent>
                <TabsContent value="devices">
                    <Devices count={setDeviceCount} open={handleWebSocketOpen} close={handleWebSocketClose}></Devices>
                </TabsContent>
                <TabsContent value="tasks">
                    <Tasks count={setTaskCount}></Tasks>
                </TabsContent>
            </Tabs>
        </div>
    )
}