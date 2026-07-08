import { useState, useEffect } from 'react';
import { signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export default function Login({ onLogin }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const bgImage = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';

  useEffect(() => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    } catch (e) {
      console.error("Recaptcha Init Error", e);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onLogin(user);
      }
    });

    return () => unsubscribe();
  }, [onLogin]);

  const cleanPhone = phoneNumber.replace(/\D/g, ''); 
  const isPhoneValid = cleanPhone.length === 10;
  const isButtonEnabled = isPhoneValid;

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isButtonEnabled) return;

    const formattedPhone = `+91${cleanPhone}`;

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err) {
      setError('Failed to send OTP. ' + err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await confirmationResult.confirm(otp);
      onLogin(result.user);
    } catch (err) {
      setError('Invalid OTP code. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex justify-center items-center z-0 font-sans">
      {/* Blurred Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-black blur-[4px] scale-110 z-[-2]"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      {/* Darkening Overlay for better contrast */}
      <div className="absolute inset-0 w-full h-full bg-black/30 z-[-1]" />

      {/* Glass Card */}
      <div className="w-full max-w-[360px] text-center bg-white/10 backdrop-blur-md p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden z-10">
        
        <div className="mb-6 flex flex-col items-center">
          <div className="text-5xl mb-3 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">🧢</div>
          <h2 className="text-white m-0 font-bold text-[32px] drop-shadow-lg tracking-wide">FARM CAP 2</h2>
          <p className="text-white/90 mt-2 text-[15px] font-semibold drop-shadow-md">Access your dashboard</p>
        </div>

        {error && (
          <div className="text-white text-[14px] bg-red-600/90 backdrop-blur-md p-3 rounded-[12px] mb-6 font-semibold shadow-lg border border-red-400">
            {error}
          </div>
        )}

        <div id="recaptcha-container"></div>
        <form onSubmit={confirmationResult ? handleVerifyOtp : handleSendOtp} className="flex flex-col gap-5">
          {!confirmationResult ? (
            <>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-800 font-bold text-[17px] z-10">+91</span>
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  required 
                  maxLength="10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-4 pl-[64px] rounded-[16px] border-none text-[17px] outline-none bg-white/95 transition-all text-gray-900 font-bold box-border placeholder:text-gray-500 focus:bg-white focus:ring-4 focus:ring-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!isButtonEnabled}
                className={`p-4 rounded-[16px] text-[17px] font-bold transition-all duration-300 w-full text-white shadow-[0_4px_15px_rgba(0,0,0,0.2)] ${isButtonEnabled ? 'bg-[#4CAF50] cursor-pointer hover:bg-[#43a047] hover:scale-[1.02]' : 'bg-gray-500 opacity-60 cursor-not-allowed'}`}
              >
                Send OTP
              </button>
            </>
          ) : (
            <>
              <input 
                type="text" 
                placeholder="000000" 
                required 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-4 rounded-[16px] border-none text-[24px] outline-none bg-white/95 transition-all text-gray-900 box-border text-center tracking-[8px] font-bold focus:bg-white focus:ring-4 focus:ring-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.2)]" 
              />
              <button 
                type="submit" 
                className="p-4 bg-[#4CAF50] rounded-[16px] text-[17px] font-bold transition-all duration-300 w-full text-white hover:bg-[#43a047] hover:scale-[1.02] shadow-[0_4px_15px_rgba(0,0,0,0.2)] cursor-pointer"
              >
                Verify Code
              </button>
              <p className="text-[14px] text-white font-semibold mt-2 cursor-pointer hover:underline transition-all drop-shadow-md" onClick={() => setConfirmationResult(null)}>
                Use a different number
              </p>
            </>
          )}
        </form>

        <div className="flex items-center my-7 text-white/90 text-[14px] font-bold drop-shadow-md">
          <div className="flex-1 h-px bg-white/40"></div>
          <span className="mx-4">OR</span>
          <div className="flex-1 h-px bg-white/40"></div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className="w-full p-4 bg-white/95 text-gray-900 rounded-[16px] cursor-pointer text-[16px] flex items-center justify-center font-bold transition-all hover:bg-white hover:scale-[1.02] shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-[20px] mr-[12px]" />
          Continue with Google
        </button>

      </div>
    </div>
  );
}
