import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Device {
  device_id: string
  status: string
}

export interface Task {
  task_id: string
  taks_name: string
  task_username: string
  task_status: string
}

export interface Account {
  account_id: string
  account_name: string
  account_idcard: string
  account_date: string
}

export interface IDAccount {
  date: string
  id: string
  idcard: string
  password: string
  status: string
  username: string
  category: string
}
