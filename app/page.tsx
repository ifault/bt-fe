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

export default function Home() {
    const [accountCount, setAccountCount] = useState(0)
    const [deviceCount, setDeviceCount] = useState(0)
    const [ticketCount, setTicketCount] = useState(0)
    const [taskCount, setTaskCount] = useState(0)
    const buttonRef = useRef(null);
    const [play] = useSound(sound, {volume: 2, soundEnabled: true});

    useEffect(() => {
        const manager = createSocket()
        manager.onmessage = function (event) {
            toast.success(event.data)
        };
        manager.onopen = function () {
            manager.send('ping');
            toast.success('连接成功')

        };
        manager.onclose = function () {
            toast.error('断开连接')
        }

    }, [])


    return (
        <div className="flex min-h-screen p-5 justify-center">
            {/*<Button onClick={play} id="test">*/}
            {/*  <span role="img" aria-label="trumpet">*/}
            {/*    🎺*/}
            {/*  </span>*/}
            {/*</Button>*/}
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
            {/* Same as */}
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
                    <Devices count={setDeviceCount}></Devices>
                </TabsContent>
                <TabsContent value="tasks">
                    <Tasks count={setTaskCount}></Tasks>
                </TabsContent>
            </Tabs>
        </div>
    )
}