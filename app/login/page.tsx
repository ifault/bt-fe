'use client'
import react from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import API from '@/lib/api'
export default function Login() {
  const { toast } = useToast()
  const [token, setToken] = react.useState('')
  const submitHandler = async () => {
    try {
      const res = await API.post('/api/login', { token })
      const { access_token } = res.data
      localStorage.setItem('token', access_token)
      window.location.href = '/'
    } catch (error) {
      localStorage.removeItem('token')
      toast({
        variant: 'destructive',
        description: '密钥错误',
      })
    }
  }

  const verify = async () => {
    try {
      const res = await API.post('/api/verify', null)
      if (res.status !== 200) {
        toast({
          variant: 'destructive',
          description: '验证错误请重新输入密钥',
        })
        window.location.href = '/login'
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: '验证错误请重新输入密钥',
      })
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000);
      
    }
  }

  return (
    <div className="flex justify-center pt-10">
      <Toaster></Toaster>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="密钥"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <Button type="submit" onClick={submitHandler}>
          提交
        </Button>
      </div>
      <div>
        <Button type="submit" onClick={verify}>
          验证
        </Button>
      </div>
    </div>
  )
}
