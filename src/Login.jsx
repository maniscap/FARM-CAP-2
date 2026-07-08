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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onLogin(user);
      }
    });

    return () => {
      unsubscribe();
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
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
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }
      
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err) {
      setError('Failed to send OTP. ' + err.message);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
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
      {/* Crisp Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-black z-[-2]"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      {/* Very light darkening Overlay for text contrast */}
      <div className="absolute inset-0 w-full h-full bg-black/10 z-[-1]" />

      {/* Glass Card - Weather.jsx Style */}
      <div className="w-full max-w-[360px] text-center bg-transparent backdrop-blur-[12px] backdrop-saturate-[120%] backdrop-brightness-[110%] p-8 rounded-[36px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.15)] border border-white/10 border-t-white/30 border-l-white/20 relative overflow-hidden z-10">
        
        <div className="mb-6 flex flex-col items-center">
          <div className="text-5xl mb-3 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">🧢</div>
          <h2 className="text-white m-0 font-bold text-[32px] drop-shadow-lg tracking-wide">FARM CAP</h2>
          <p className="text-white/90 mt-2 text-[15px] font-semibold drop-shadow-md">Access your dashboard</p>
        </div>

        {error && (
          <div className="text-white text-[14px] bg-red-600/90 backdrop-blur-md p-3 rounded-[12px] mb-6 font-semibold shadow-lg border border-red-400">
            {error}
          </div>
        )}

        <div id="recaptcha-container"></div>
        <form onSubmit={confirmationResult ? handleVerifyOtp : handleSendOtp} className="flex flex-col gap-4">
          {!confirmationResult ? (
            <>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 font-semibold text-[17px] z-10">+91</span>
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  required 
                  maxLength="10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-4 pl-[58px] rounded-[14px] border border-transparent text-[18px] outline-none bg-black/20 transition-all text-white font-bold box-border placeholder:text-white/50 focus:border-white/50 focus:bg-black/30 tracking-wide"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!isButtonEnabled}
                className={`py-2 px-8 mt-2 rounded-[20px] border border-white/30 text-[14px] font-semibold transition-all duration-300 w-auto mx-auto text-white ${isButtonEnabled ? 'bg-[#4CAF50]/80 backdrop-blur-md cursor-pointer hover:bg-[#4CAF50] hover:scale-[1.05] shadow-[0_4px_15px_rgba(76,175,80,0.4)]' : 'bg-white/10 opacity-50 cursor-not-allowed'}`}
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
                className="w-full p-3 rounded-[12px] border border-transparent text-[20px] outline-none bg-black/20 transition-all text-white box-border text-center tracking-[8px] font-bold focus:border-white/50 focus:bg-black/30" 
              />
              <button 
                type="submit" 
                className="p-3 bg-[#4CAF50]/80 backdrop-blur-md border border-white/30 rounded-[12px] text-[15px] font-semibold transition-all duration-300 w-full text-white hover:bg-[#4CAF50] hover:scale-[1.02] shadow-[0_4px_15px_rgba(76,175,80,0.4)] cursor-pointer"
              >
                Verify Code
              </button>
              <p className="text-[13px] text-white font-semibold mt-1 cursor-pointer hover:underline transition-all drop-shadow-md" onClick={() => setConfirmationResult(null)}>
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
          className="w-full p-3 bg-white/10 backdrop-blur-[12px] backdrop-saturate-[120%] text-white border border-white/20 border-t-white/40 border-l-white/30 rounded-[12px] cursor-pointer text-[15px] flex items-center justify-center font-semibold transition-all hover:bg-white/20 hover:scale-[1.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_15px_rgba(0,0,0,0.1)]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-[18px] mr-[10px]" />
          Continue with Google
        </button>

      </div>
    </div>
  );
}
