import React, { useEffect, useRef, useState } from 'react';
import { matchPatient } from '../api/facialAPI';

const SCAN_SECONDS = Number(import.meta.env.VITE_SCAN_SECONDS || 3);

export default function CaptureCamera({ onMatch, onStatus }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [countdown, setCountdown] = useState(SCAN_SECONDS);
  const [statusText, setStatusText] = useState('Initializing camera...');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    onStatus && onStatus(statusText);
  }, [statusText, onStatus]);

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play().catch(() => {});
      }
      setStream(s);
      setCameraReady(true);
      setStatusText('Camera ready — scanning will start automatically');

      scheduleRetry(0); // start first scan immediately
    } catch (err) {
      console.error('camera error', err);
      setStatusText('Cannot access camera: ' + (err.message || err));
    }
  }

  function stopCamera() {
    if (stream && stream.getTracks) stream.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStream(null);
    setCameraReady(false);
    setStatusText('Camera stopped');
  }

  function scheduleRetry(delay = 2000) {
    let sec = SCAN_SECONDS;
    setCountdown(sec);

    setTimeout(() => {
      const timer = setInterval(() => {
        sec -= 1;
        setCountdown(sec);
        if (sec <= 0) {
          clearInterval(timer);
          captureAndSend();
        }
      }, 1000);
    }, delay);
  }

  function captureAndSend() {
    setStatusText('Capturing image...');
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) {
      setStatusText('Capture failed');
      scheduleRetry();
      return;
    }

    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext('2d');
    ctx.drawImage(v, 0, 0, c.width, c.height);

    c.toBlob(async (blob) => {
      if (!blob) {
        setStatusText('Capture failed');
        scheduleRetry();
        return;
      }

      setStatusText('Sending to server...');
      try {
        const { ok, body } = await matchPatient(blob);
        const result = body || { error: 'No JSON' };
        result.frameBlob = blob;
        onMatch && onMatch(result);

        if (ok) {
          setStatusText('✅ Match received');
          // stop retrying — success case
        } else if (body?.error === 'no_match') {
          setStatusText('⚠️ No match found — retrying...');
          scheduleRetry();
        } else {
          setStatusText(`❌ Server error (${body?.message || body?.error || 'unknown'}) — retrying...`);
          scheduleRetry();
        }
      } catch (err) {
        console.error('match error', err);
        setStatusText('🌐 Network error — retrying...');
        onMatch && onMatch(null);
        scheduleRetry();
      }
    }, 'image/jpeg', 0.92);
  }

  return (
    <div className="kiosk-camera">
      <video ref={videoRef} className="kiosk-video" playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="kiosk-overlay">
        <div className="status">
          {statusText} {cameraReady && countdown > 0 && <span>({countdown})</span>}
        </div>
      </div>
    </div>
  );
}
