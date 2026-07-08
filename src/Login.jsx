import { useState, useEffect } from 'react';
import { signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export default function Login({ onLogin }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const bgImage = '/bg-lush.png';

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
    <div 
      className="fixed inset-0 w-full h-full bg-cover bg-center bg-black flex justify-center items-center z-0 transition-all duration-1000 font-sans tracking-tight"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="w-full max-w-[360px] text-center bg-[#f5f5f7]/30 backdrop-blur-3xl p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 relative overflow-hidden">
        
        <div className="mb-8">
          <h2 className="text-white m-0 font-bold text-[28px] tracking-tight drop-shadow-md">Sign In</h2>
          <p className="text-white/80 mt-2 text-[15px] font-medium tracking-normal">Access your Farm Cap dashboard.</p>
        </div>

        {error && (
          <div className="text-white text-[13px] bg-red-500/80 backdrop-blur-md p-3 rounded-[14px] mb-5 font-medium shadow-md">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          className="w-full p-4 bg-white/90 backdrop-blur-md text-black border-none rounded-[16px] cursor-pointer text-[17px] flex items-center justify-center font-semibold transition-all hover:bg-white hover:scale-[1.02] shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-[20px] mr-[12px]" />
          Continue with Google
        </button>

        <div className="flex items-center my-6 text-white/80 text-[13px] font-medium">
          <div className="flex-1 h-px bg-white/40"></div>
          <span className="mx-4">or</span>
          <div className="flex-1 h-px bg-white/40"></div>
        </div>

        <div id="recaptcha-container"></div>
        <form onSubmit={confirmationResult ? handleVerifyOtp : handleSendOtp} className="flex flex-col gap-4">
          {!confirmationResult ? (
            <>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-[17px] z-10">+91</span>
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  required 
                  maxLength="10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-4 pl-[56px] rounded-[16px] border border-white/40 text-[17px] outline-none bg-white/80 backdrop-blur-md transition-all text-black font-medium box-border placeholder:text-gray-500 focus:bg-white focus:border-white focus:ring-4 focus:ring-white/30 shadow-inner"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!isButtonEnabled}
                className={`p-4 border-none rounded-[16px] text-[17px] font-semibold transition-all duration-300 w-full text-white backdrop-blur-md ${isButtonEnabled ? 'bg-black/90 cursor-pointer hover:bg-black hover:scale-[1.02] shadow-[0_4px_14px_rgba(0,0,0,0.3)]' : 'bg-black/30 opacity-60 cursor-not-allowed'}`}
              >
                Continue
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
                className="w-full p-4 rounded-[16px] border border-white/40 text-[22px] outline-none bg-white/90 backdrop-blur-md transition-all text-black box-border text-center tracking-[8px] font-medium focus:bg-white focus:border-white focus:ring-4 focus:ring-white/30 shadow-inner" 
              />
              <button 
                type="submit" 
                className="p-4 bg-black/90 backdrop-blur-md border-none rounded-[16px] text-[17px] font-semibold transition-all duration-300 w-full text-white hover:bg-black hover:scale-[1.02] shadow-[0_4px_14px_rgba(0,0,0,0.3)] cursor-pointer"
              >
                Verify Code
              </button>
              <p className="text-[14px] text-white/90 font-medium mt-3 cursor-pointer hover:text-white hover:underline transition-all" onClick={() => setConfirmationResult(null)}>
                Use a different number
              </p>
            </>
          )}
        </form>

      </div>
    </div>
  );
}
