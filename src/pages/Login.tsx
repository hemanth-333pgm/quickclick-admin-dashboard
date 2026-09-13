import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axiosClient';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('+919888888888');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await sendOtp(mobile);
      setDevOtp(data.devOtp);
      setStep('otp');
      toast.success('OTP sent' + (data.devOtp ? ` — dev: ${data.devOtp}` : ''));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(mobile, otp);
      toast.success('Welcome, Admin');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 32,
          borderRadius: 12,
          width: 380,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        }}
      >
        <h1 style={{ margin: 0, color: '#1e3a8a', textAlign: 'center' }}>QuickClick Admin</h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginTop: 6, fontSize: 13 }}>
          {step === 'mobile' ? 'Sign in with your mobile number' : 'Enter the OTP sent to your mobile'}
        </p>

        {step === 'mobile' ? (
          <form onSubmit={handleSend} style={{ marginTop: 20 }}>
            <input
              type="tel"
              placeholder="Mobile (+91...)"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              style={{ width: '100%', padding: 12, fontSize: 14 }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 12,
                marginTop: 12,
                background: '#2563eb',
                color: '#fff',
                border: 0,
                fontWeight: 600,
              }}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{ marginTop: 20 }}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              style={{ width: '100%', padding: 12, fontSize: 18, textAlign: 'center', letterSpacing: 4 }}
            />
            {devOtp && (
              <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 6 }}>
                Dev OTP: <strong>{devOtp}</strong>
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 12,
                marginTop: 12,
                background: '#16a34a',
                color: '#fff',
                border: 0,
                fontWeight: 600,
              }}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => setStep('mobile')}
              style={{ width: '100%', padding: 10, marginTop: 8, background: '#f3f4f6' }}
            >
              Change number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
