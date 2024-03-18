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

export interface IAccount {
  password: string
  username: string
}
export interface ITicket{
  category: string
  card: string
  date: string
  count: number
}

export interface IDevice{
    device_id: string
    status: string
}


export const handleClipboardData = (event, col) => {
  const clipboardData = event.clipboardData || window.clipboardData
  const pastedText = clipboardData.getData('text')
  const rows = pastedText.split('\n');
  const result = [];
  for (let row of rows) {
    row = row.trim();
    if (row === '') {
      continue;
    }
    const rowData = row.split(',');
    if (rowData.length !== col) {
      console.log('格式不正确');
    }else{
      result.push(rowData);
    }
  }
  console.log(result);
  return result
}