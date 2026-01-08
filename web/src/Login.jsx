import { useState } from 'react';
import api from './api';
import Cookies from 'js-cookie';

export default function Login({ onLogin }) {
  const [isReg, setIsReg] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isReg ? '/register' : '/login';
      const { data } = await api.post(endpoint, { username, password });
      if (isReg) { alert('注册成功，请登录'); setIsReg(false); }
      else {
        Cookies.set('token', data.token, { expires: 7 });
        onLogin();
      }
    } catch (e) {
      alert(e.response?.data?.error || 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 320, margin: '60px auto' }}>
      <h2>{isReg ? '注册' : '登录'}</h2>
      <form onSubmit={submit}>
        <input placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} required /><br />
        <input placeholder="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /><br />
        <button disabled={loading} type="submit">{isReg ? '注册' : '登录'}</button>
      </form>
      <p style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => setIsReg((v) => !v)}>
        {isReg ? '已有账号？去登录' : '没有账号？去注册'}
      </p>
    </div>
  );
}