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
      className="fixed inset-0 w-full h-full bg-cover bg-center bg-black flex justify-center items-center z-0 transition-all duration-1000 font-sans"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="w-full max-w-[360px] text-center bg-transparent backdrop-blur-[12px] backdrop-saturate-[120%] backdrop-brightness-[110%] p-10 rounded-[36px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.15)] border border-white/10 border-t-white/30 border-l-white/20 relative overflow-hidden">
        
        <div className="mb-6">
          <h2 className="text-white m-0 font-semibold text-[26px] drop-shadow-md tracking-wide">Sign In</h2>
          <p className="text-white/80 mt-2 text-[14px] font-normal">Access your Farm Cap dashboard</p>
        </div>

        {error && (
          <div className="text-white text-[13px] bg-red-500/60 backdrop-blur-md p-3 rounded-[14px] mb-4 font-normal shadow-md">
            {error}
          </div>
        )}

        <div id="recaptcha-container"></div>
        <form onSubmit={confirmationResult ? handleVerifyOtp : handleSendOtp} className="flex flex-col gap-4">
          {!confirmationResult ? (
            <>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/90 font-medium text-[16px] z-10">+91</span>
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  required 
                  maxLength="10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-3.5 pl-[56px] rounded-[20px] border border-white/20 border-t-white/40 border-l-white/30 text-[16px] outline-none bg-white/10 backdrop-blur-[12px] backdrop-saturate-[120%] transition-all text-white font-normal box-border placeholder:text-white/60 focus:bg-white/20 focus:border-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_15px_rgba(0,0,0,0.1)]"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!isButtonEnabled}
                className={`p-3.5 border border-white/20 border-t-white/40 border-l-white/30 rounded-[20px] text-[16px] font-medium transition-all duration-300 w-full text-white backdrop-blur-[12px] backdrop-saturate-[120%] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_15px_rgba(0,0,0,0.1)] ${isButtonEnabled ? 'bg-white/20 cursor-pointer hover:bg-white/30 hover:scale-[1.02]' : 'bg-white/5 opacity-60 cursor-not-allowed'}`}
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
                className="w-full p-3.5 rounded-[20px] border border-white/20 border-t-white/40 border-l-white/30 text-[20px] outline-none bg-white/10 backdrop-blur-[12px] backdrop-saturate-[120%] transition-all text-white box-border text-center tracking-[6px] font-normal focus:bg-white/20 focus:border-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_15px_rgba(0,0,0,0.1)]" 
              />
              <button 
                type="submit" 
                className="p-3.5 bg-white/20 backdrop-blur-[12px] backdrop-saturate-[120%] border border-white/20 border-t-white/40 border-l-white/30 rounded-[20px] text-[16px] font-medium transition-all duration-300 w-full text-white hover:bg-white/30 hover:scale-[1.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_15px_rgba(0,0,0,0.1)] cursor-pointer"
              >
                Verify Code
              </button>
              <p className="text-[13px] text-white/80 font-normal mt-2 cursor-pointer hover:text-white transition-all" onClick={() => setConfirmationResult(null)}>
                Use a different number
              </p>
            </>
          )}
        </form>

        <div className="flex items-center my-6 text-white/60 text-[12px] font-normal">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="mx-4">or</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className="w-full p-3.5 bg-white/10 backdrop-blur-[12px] backdrop-saturate-[120%] text-white border border-white/20 border-t-white/40 border-l-white/30 rounded-[20px] cursor-pointer text-[15px] flex items-center justify-center font-medium transition-all hover:bg-white/20 hover:scale-[1.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_15px_rgba(0,0,0,0.1)]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-[18px] mr-[12px]" />
          Continue with Google
        </button>

      </div>
    </div>
  );
}
