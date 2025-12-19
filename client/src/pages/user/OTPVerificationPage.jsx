import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "../../config/firebase"; // Adjust path
import React, { useState, useEffect, useRef } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const OTPVerificationPage = ({ onVerificationSuccess }) => {
  const [step, setStep] = useState("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaContainerRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    // Cleanup recaptcha on unmount
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  /*const setupRecaptcha = async () => {
    if (!window.firebase) {
      setError("Firebase not loaded. Please refresh the page.");
      return null;
    }

    const auth = window.firebase.auth();

    // ✅ Clear any existing recaptcha widget first
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (e) {
        console.log("Error clearing recaptcha:", e);
      }
      recaptchaVerifierRef.current = null;
    }

    // ✅ Make sure the container exists
    if (!recaptchaContainerRef.current) {
      setError("reCAPTCHA container not found");
      return null;
    }

    try {
      recaptchaVerifierRef.current = new window.firebase.auth.RecaptchaVerifier(
        recaptchaContainerRef.current,
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA verified");
          },
          "expired-callback": () => {
            setError("reCAPTCHA expired. Please try again.");
            recaptchaVerifierRef.current = null;
          },
        }
      );

      // ✅ Render the recaptcha before returning
      await recaptchaVerifierRef.current.render();

      return recaptchaVerifierRef.current;
    } catch (error) {
      console.error("reCAPTCHA setup error:", error);
      setError("Failed to initialize reCAPTCHA");
      return null;
    }
  };
  */

  const setupRecaptcha = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (e) {}
      recaptchaVerifierRef.current = null;
    }

    const container = document.getElementById("recaptcha-container");
    if (!container) {
      setError("reCAPTCHA container not found");
      return null;
    }

    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible", // Change from 'invisible' to 'normal'
          callback: (response) => {
            console.log("reCAPTCHA verified successfully");
          },
          "expired-callback": () => {
            setError("reCAPTCHA expired. Please try again.");
          },
        }
      );

      console.log("reCAPTCHA verifier created");
      return recaptchaVerifierRef.current;
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      setError("Failed to initialize reCAPTCHA");
      return null;
    }
  };

  const handleRequestOTP = async () => {
    setError("");
    setSuccess("");

    if (!mobileNumber || mobileNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const fullPhoneNumber = `${countryCode}${mobileNumber}`;

      // Setup reCAPTCHA
      const recaptchaVerifier = setupRecaptcha();
      if (!recaptchaVerifier) {
        throw new Error("reCAPTCHA setup failed");
      }

      console.log("6. Calling signInWithPhoneNumber...");

      // Use modular SDK signInWithPhoneNumber
      const confirmResult = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        recaptchaVerifier
      );

      console.log("7. OTP sent successfully");
      setConfirmationResult(confirmResult);
      setSuccess(`OTP sent to ${fullPhoneNumber}`);
      setStep("otp");
      setTimer(120);
      setCanResend(false);
    } catch (err) {
      console.error("OTP Request Error:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
      recaptchaVerifierRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      // Verify OTP with Firebase - this will fail if OTP is wrong!
      const credential = await confirmationResult.confirm(otp);

      // Get REAL Firebase ID token
      const idToken = await credential.user.getIdToken();
      const fullPhoneNumber = credential.user.phoneNumber;

      // Send real token to backend
      const response = await fetch(
        `${API_BASE_URL}/users/verify-firebase-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken: idToken,
            phoneNumber: fullPhoneNumber,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("Mobile number verified successfully!");
        localStorage.setItem("verifiedMobile", mobileNumber);

        setTimeout(() => {
          if (onVerificationSuccess) {
            onVerificationSuccess(mobileNumber);
          } else {
            window.location.href = "/report-crime";
          }
        }, 1500);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);

      // Handle wrong OTP
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP. Please check and try again.");
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* const handleRequestOTP = async () => {
    setError("");
    setSuccess("");

    if (!mobileNumber || mobileNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const fullPhoneNumber = `${countryCode}${mobileNumber}`;

      // For demo/preview, simulate OTP flow
      // In production, use actual Firebase
      setSuccess(`OTP sent to ${fullPhoneNumber}`);
      setStep("otp");
      setTimer(120);
      setCanResend(false);

      // Store for verification
      setConfirmationResult({ phoneNumber: fullPhoneNumber });
    } catch (err) {
      console.error("OTP Request Error:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      // For demo: accept any 6-digit OTP
      // In production, verify with Firebase confirmationResult.confirm(otp)

      const fullPhoneNumber =
        confirmationResult?.phoneNumber || `${countryCode}${mobileNumber}`;

      // Call backend to verify and create/update user
      const response = await fetch(
        "http://localhost:5001/api/users/verify-firebase-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken: "demo-token", // In production: user.getIdToken()
            phoneNumber: fullPhoneNumber,
          }),
        }
      );

      const data = await response.json();

      if (response.ok || true) {
        // For demo, always succeed
        setSuccess("Mobile number verified successfully!");
        localStorage.setItem("verifiedMobile", mobileNumber);

        setTimeout(() => {
          if (onVerificationSuccess) {
            onVerificationSuccess(mobileNumber);
          } else {
            window.location.href = "/report-crime";
          }
        }, 1500);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }; */

  const handleResendOTP = () => {
    setOtp("");
    setError("");
    setSuccess("");
    recaptchaVerifierRef.current = null;
    handleRequestOTP();
  };

  const handleBack = () => {
    setStep("mobile");
    setOtp("");
    setError("");
    setSuccess("");
    setConfirmationResult(null);
    recaptchaVerifierRef.current = null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1
                className="text-2xl font-bold text-cyan-400 cursor-pointer"
                onClick={() => (window.location.href = "/")}
              >
                CrimeTrack
              </h1>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="hover:text-cyan-400 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-2">
              {step === "mobile" ? "Verify Your Number" : "Enter OTP"}
            </h2>
            <p className="text-gray-400">
              {step === "mobile"
                ? "Enter your mobile number to receive an OTP"
                : `We sent a 6-digit OTP to ${countryCode}${mobileNumber}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-600 text-white p-4 rounded-lg mb-6 text-center">
              {success}
            </div>
          )}

          {step === "mobile" ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    placeholder="Enter mobile number"
                    maxLength={10}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white text-lg tracking-widest"
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2 text-center">
                  {mobileNumber.length}/10 digits
                </p>
              </div>

              <div ref={recaptchaContainerRef} id="recaptcha-container"></div>

              <button
                onClick={handleRequestOTP}
                disabled={loading || mobileNumber.length !== 10}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg text-lg transition transform hover:scale-105"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <div className="bg-gray-700 p-4 rounded-lg border border-cyan-500">
                <p className="text-sm text-gray-300">
                  You will receive a 6-digit OTP. Standard SMS charges may
                  apply.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-center">
                  Enter 6-Digit OTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white text-2xl text-center tracking-widest font-bold"
                />
                <p className="text-sm text-gray-400 mt-2 text-center">
                  {otp.length}/6 digits
                </p>
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg text-lg transition transform hover:scale-105"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="text-center space-y-2">
                {!canResend && timer > 0 ? (
                  <p className="text-gray-400 text-sm">
                    Resend OTP in {Math.floor(timer / 60)}:
                    {(timer % 60).toString().padStart(2, "0")}
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={loading || !canResend}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium disabled:text-gray-500"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={handleBack}
                disabled={loading}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
              >
                ← Change Number
              </button>

              <div className="bg-gray-700 p-4 rounded-lg border border-cyan-500">
                <p className="text-sm text-gray-300 text-center">
                  <span className="text-cyan-400 font-bold">
                    Didn't receive OTP?
                  </span>
                  <br />
                  Check your messages or wait for the timer to resend.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={recaptchaContainerRef} id="recaptcha-container"></div>
    </div>
  );
};

export default OTPVerificationPage;
