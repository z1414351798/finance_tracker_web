import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const data = await response.json(); // Backend now sends JSON

if (response.ok) {
    if (isLogin) {
      localStorage.setItem('token', data.token);
      navigate('/dashboard'); // Direct navigation
    } else {
      setIsLogin(true);
    }
  }
};

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <input 
          className="w-full mb-4 p-2 border rounded" 
          placeholder="Username" 
          onChange={(e) => setFormData({...formData, username: e.target.value})}
        />
        <input 
          type="password" 
          className="w-full mb-6 p-2 border rounded" 
          placeholder="Password" 
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-300 ">
          {isLogin ? 'Enter FinancePro' : 'Create Account'}
        </button>
        <p className="mt-4 text-sm text-center cursor-pointer text-blue-500 hover:text-cyan-400" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
}