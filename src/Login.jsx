import { useState, useEffect } from 'react';
import { signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export default function Login({ onLogin }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bgImage, setBgImage] = useState('');

  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1652454159675-11ead6275680?q=80&w=1170&auto=format&fit=crop';

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      setBgImage((hour >= 18 || hour < 6) ? nightBg : dayBg);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
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
  const isButtonEnabled = isPhoneValid && termsAccepted;

  const handleGoogleLogin = async () => {
    if (!termsAccepted) {
      setError("Please accept Terms & Conditions first.");
      return;
    }
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
      className="fixed inset-0 w-full h-full bg-cover bg-center bg-black flex justify-center items-center z-0 transition-all duration-1000"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="w-full max-w-[340px] text-center bg-white/15 backdrop-blur-[15px] p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/20">
        
        <div className="mb-4">
          <div className="text-5xl mb-2 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">🧢</div>
          <h2 className="text-white m-0 font-extrabold text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">Login to Farm Cap</h2>
          <p className="text-white/90 mt-1 text-[13px]">Secure access for farmers</p>
        </div>

        {error && (
          <div className="text-[#ffcdd2] text-xs bg-red-500/20 p-2 rounded-md mb-3">
            ⚠️ {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          disabled={!termsAccepted}
          className="w-full p-3 bg-white text-[#333] border-none rounded-full cursor-pointer text-[15px] flex items-center justify-center font-semibold transition-transform hover:scale-[1.02] shadow-[0_2px_8px_rgba(0,0,0,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-[18px] mr-[10px]" />
          Sign in with Google
        </button>

        <div className="flex items-center my-5 text-white/70 text-[11px] font-bold">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="mx-2.5">OR USE MOBILE NUMBER</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        <form onSubmit={confirmationResult ? handleVerifyOtp : handleSendOtp} className="flex flex-col gap-[15px]">
          {!confirmationResult ? (
            <>
              <div className="relative">
                <span className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[#333] font-bold text-[16px] z-10">+91</span>
                <input 
                  type="tel" 
                  placeholder="Mobile Number" 
                  required 
                  maxLength="10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full py-3 px-[15px] pl-[50px] rounded-xl border border-white/30 text-[16px] outline-none bg-white/90 transition-all text-[#333] font-bold box-border placeholder:text-gray-500"
                />
              </div>
              
              <div id="recaptcha-container"></div>
              
              <button 
                type="submit" 
                disabled={!isButtonEnabled}
                className={`p-3.5 border-none rounded-xl text-[16px] font-bold transition-all duration-300 w-full text-white ${isButtonEnabled ? 'bg-[#4CAF50] cursor-pointer hover:scale-[1.02] shadow-[0_4px_15px_rgba(76,175,80,0.5)]' : 'bg-[#757575] opacity-60 cursor-not-allowed'}`}
              >
                Get OTP
              </button>
            </>
          ) : (
            <>
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                required 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 rounded-xl border border-white/30 text-[18px] outline-none bg-white/80 transition-all text-[#333] box-border text-center tracking-[4px]" 
              />
              <button 
                type="submit" 
                className="p-3.5 bg-[#4CAF50] border-none rounded-xl text-[16px] font-bold transition-all duration-300 w-full text-white hover:scale-[1.02] shadow-[0_4px_15px_rgba(76,175,80,0.5)] cursor-pointer"
              >
                Verify OTP
              </button>
              <p className="text-[12px] text-white mt-2 cursor-pointer" onClick={() => setConfirmationResult(null)}>
                Wrong number? Go back
              </p>
            </>
          )}
        </form>
        
        <div className="flex items-center justify-center mt-5 mb-1">
          <input 
            type="checkbox" 
            id="terms-check" 
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mr-2 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="terms-check" className="text-white/90 text-[13px] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] cursor-pointer">
            I agree to the <span className="text-[#FFD700] cursor-pointer underline font-bold">T&C & Privacy Policy</span>
          </label>
        </div>

      </div>
    </div>
  );
}
