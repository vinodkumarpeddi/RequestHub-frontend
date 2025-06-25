import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const AdminLogin = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ password: '' });
  const [loading, setLoading] = useState(false); // New loading state

  const validatePassword = (value) => {
    if (value.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const isPasswordValid = validatePassword(password);

    if (!isPasswordValid) return;

    try {
      setLoading(true); // Start spinner
      axios.defaults.withCredentials = true;
      console.log(import.meta.env.VITE_BACKEND_URL);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin-add/login2`, {
        email,
        password
      });

      if (response.data.success) {
        await getUserData();
        setIsLoggedin(true);
        addToast({ title: 'Success', body: 'Welcome Back Admin!' }, 'success');
        navigate('/admin-dashboard');
      } else {
        addToast({ title: 'Error', body: 'Login Failed!' }, 'error');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      addToast({ title: 'Error', body: errorMessage }, 'error');
    } finally {
      setLoading(false); // Stop spinner
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f8f8',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <header
        style={{
          padding: '20px',
          fontSize: '24px',
          fontWeight: '700',
          color: '#222',
          cursor: 'pointer',
          textAlign: 'center',
          borderBottom: '1px solid #eee',
          backgroundColor: 'white'
        }}
        onClick={() => navigate('/')}
      >
        RequestHub
      </header>

      <div style={{
        maxWidth: '420px',
        width: '90%',
        margin: '30px auto',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #eee'
        }}>
          <h2 style={{
            margin: '0',
            fontSize: '20px',
            color: '#222',
            fontWeight: '600'
          }}>
            Welcome Back
          </h2>
          <p style={{
            margin: '8px 0 0',
            fontSize: '14px',
            color: '#666'
          }}>
            Log in to continue
          </p>
        </div>

        <form onSubmit={onSubmitHandler} style={{ padding: '24px' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              color: '#666'
            }}>📧</span>
            <input
              onChange={e => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email"
              required
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#222',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ position: 'relative', marginBottom: '4px' }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              color: '#666'
            }}>🔒</span>
            <input
              onChange={handlePasswordChange}
              value={password}
              type="password"
              placeholder="Password"
              required
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: errors.password ? '1px solid #ff4444' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#222',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {errors.password && (
            <p style={{
              color: '#ff4444',
              fontSize: '12px',
              margin: '0 0 12px 0',
              textAlign: 'right'
            }}>
              {errors.password}
            </p>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '20px'
          }}>
            <span
              style={{
                fontSize: '13px',
                color: '#555',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={() => navigate('/reset-password-admin')}
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#888' : '#222',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {loading && (
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
            )}
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AdminLogin;
