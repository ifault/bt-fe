import axios from 'axios';

export default axios.create({
  baseURL: `http://192.168.3.194:8000/`
});