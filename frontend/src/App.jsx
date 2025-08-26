import React, { useState } from 'react';
import CaptureCamera from './components/CaptureCamera';
import MatchModal from './components/MatchModal';
import RegisterModal from './components/RegisterModal';

export default function App() {
  const [matchResult, setMatchResult] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [enrollFrame, setEnrollFrame] = useState(null);
  const [resetKey, setResetKey] = useState(0); // 🔑 Force reset for CaptureCamera

  const handleEnrollComplete = (resp) => {
    setShowRegister(false);

    if (resp.duplicate) {
      // ✅ Show MatchModal for duplicate
      setMatchResult({
        matched_patient_id: resp.patient_id,
        confidence: resp.confidence,
        message: resp.message || 'Duplicate found',
      });
    } else if (resp.status === 'enrolled') {
      // ✅ Successfully enrolled → show success then reset
      setMatchResult({
        enrolled: true,
        response: resp,
      });
    }

    // ✅ Always reset camera after short delay
    setTimeout(() => {
      resetCamera();
    }, 1500);
  };

  const resetCamera = () => {
    setMatchResult(null);
    setEnrollFrame(null);
    setShowRegister(false);
    setResetKey((k) => k + 1); // 🔑 re-mount CaptureCamera
  };

  return (
    <div className="kiosk-root">
      <CaptureCamera
        key={resetKey} // 🔑 para ma-reset after enroll/match/duplicate
        onMatch={(data) => {
          setMatchResult(data);
          if (!data || !data.matched_patient_id) {
            setEnrollFrame(data?.frameBlob || null);
            setShowRegister(true);
          }
        }}
        onStatus={(s) => console.log('[KIOSK STATUS]', s)}
      />

      {matchResult && matchResult.matched_patient_id && (
        <MatchModal
          data={matchResult}
          onClose={resetCamera} // ✅ kapag sinara → balik sa camera
        />
      )}

      {showRegister && (
        <RegisterModal
          frameBlob={enrollFrame}
          onClose={resetCamera} // ✅ FIXED: cancel OR success → balik sa camera
          onEnrolled={handleEnrollComplete}
        />
      )}
    </div>
  );
}
