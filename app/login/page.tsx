"use client"
import react from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from 'axios'
export default function Login() {
  const [token, setToken] = react.useState('')
  const submitHandler = async () => {
    try {
      const res = await axios.post('http://192.168.3.194:8000/api/login', {token})
      const {access_token} = res.data
      localStorage.setItem('token', access_token)
    } catch (error) {
      console.log(error)
    }
  }

  const test = async () => {
    const token = localStorage.getItem('token')
    const res = await axios.post('http://192.168.3.194:8000/api/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    console.log(res)
    }
  return (
    <div className="flex justify-center pt-10">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="text" placeholder="密钥" value={token} onChange={(e)=> setToken(e.target.value)}/>
        <Button type="submit" onClick={submitHandler}>提交</Button>
      </div>
      <div>
      <Button type="submit" onClick={test}>测试</Button>
      </div>
    </div>
  )
}
