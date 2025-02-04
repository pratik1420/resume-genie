import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

import Button from '../component/UI/Button';
import { verifyOTP, generateOTP } from './../helper/helper';
import { useAuthStore } from './../store/Store';

import { ReactComponent as Logo } from './../assests/svg/logo.svg';
import recoverySVG from './../assests/svg/auth/recovery-svg.svg';

import './bg.css';

const Recovery = () => {
  const [timer, setTimer] = useState(59);
  const email = useAuthStore((state) => state.auth.email);
  const [isResend, setIsResend] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const navigate = useNavigate();
  let interval;

  useEffect(() => {
    document.title = 'Resume Genie | Recovery';

    interval = setInterval(() => {
      setTimer((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleKeyUp = (e) => {
    const key = e.keyCode || e.charCode;

    if ((key === 8 || key === 46) && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleChange = (element, i) => {
    if (isNaN(element.value) || element.value === ' ') return false;

    setOtp([...otp.map((d, index) => (index === i ? element.value : d))]);

    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  async function onSubmit(e) {
    e.preventDefault();
    try {
      let { status } = await verifyOTP({ email, code: otp.join('') });
      if (status === 201) {
        toast.success('Verify Successfully!');
        return navigate('/resetPassword');
      }
    } catch (error) {
      return toast.error('Wront OTP! Check email again!');
    }
  }

  function resendOTP() {
    let sentPromise = generateOTP(email);

    toast.promise(sentPromise, {
      loading: 'Sending...',
      success: <b>OTP has been send to your registered email!</b>,
      error: <b>Could not Send it!</b>,
    });

    sentPromise.then((OTP) => {
      console.log(OTP);
      setTimer(59);
      setTimeout(false);
    });
  }

  setTimeout(() => {
    clearInterval(interval);
    setIsResend(true);
  }, 59100);

  return (
    <motion.section
      initial={{ opacity: 0, x: '-100%' }}
      animate={{ opacity: 1, x: '0' }}
      transition={{ duration: 0.75, ease: [0, 0.99, 1, 0.94] }}
      exit={{ opacity: 0, x: '100%' }}
      className="w-full min-h-[100vh] flex bg-cover bg-no-repeat bg"
    >
      <Toaster position="top-center" reverseOrder={false}></Toaster>

      <div className="w-2/5 p-10">
        <div className="mb-5">
          <Logo fill="var(--dark)" title="Resume Genie Logo" />
        </div>

        <section className="p-10 text-center">
          <div className="mb-9">
            <h2 className="text-[28px] font-bold text-[var(--text)] tracking-wider">
              Confirm OTP
            </h2>
            <p className="text-[16px] text-[var(--text-light)] max-w-[320px] mx-auto">
              Enter 6-digit OTP sent to your registered Email address.
            </p>
          </div>

          <form onSubmit={onSubmit}>
            <div className="mb-[9px]">
              {otp.map((element, i) => (
                <input
                  type="text"
                  maxLength="1"
                  min="0"
                  max="9"
                  className="border-solid border-[#F0F0F0] rounded-[5px] border py-[9px] w-[42.5px] text-[24px] text-center [&:not(:first-child)]:ml-[9px]"
                  value={element}
                  key={i}
                  onChange={(e) => handleChange(e.target, i)}
                  onKeyUp={(e) => handleKeyUp(e)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <button
              onClick={resendOTP}
              type="button"
              className={
                'block max-w-[300px] mx-auto text-[14px] text-[var(--primary)] mb-[18px]' +
                (isResend ? '' : ' opacity-50 cursor-not-allowed')
              }
            >
              Resned OTP
            </button>

            <p className="text-center max-w-[300px] mx-auto text-[14px] text-[var(--text)] mb-[18px]">
              OTP can be sent again in
              <span className="ml-1 text-[#f23333]">
                {'0:' + (timer > 10 ? timer : timer > 0 ? '0' + timer : '00')}
              </span>
            </p>

            <Button
              type="submit"
              text="CONFIRM OTP"
              className="text-[12px] bg-[var(--primary)] p-[18px] w-full max-w-[300px] my-[18px] font-bold"
            />
          </form>

          <div className="text-[18px] flex justify-center mt-9">
            <p className="text-[var(--text) mr-2">Remember Password?</p>
            <a href="/login" className="text-[var(--primary)]">
              Login Page
            </a>
          </div>
        </section>
      </div>

      <div className="w-3/5 flex justify-center items-center">
        <img
          src={recoverySVG}
          alt="Forgot Password SVG"
          className="max-w-[calc(14vw+500px)]"
        />
      </div>
    </motion.section>
  );
};

export default Recovery;
