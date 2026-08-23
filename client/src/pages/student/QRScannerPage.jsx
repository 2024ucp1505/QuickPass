import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api/axios';
import { getDeviceId } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SCANNER_ELEMENT_ID = 'qr-scanner-region';

const QRScannerPage = () => {
  const [phase, setPhase] = useState('idle'); // idle | requesting | scanning | success | error
  const [lastLog, setLastLog] = useState(null);
  const [undoSeconds, setUndoSeconds] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);
  const undoIntervalRef = useRef(null);
  const permissionGranted = useRef(false);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      doStopScanner();
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    };
  }, []);

  // ─── When phase changes to 'scanning', the DOM element is now visible.
  //     We can now safely initialise Html5Qrcode.
  useEffect(() => {
    if (phase !== 'scanning') return;
    let cancelled = false;

    const init = async () => {
      try {
        const html5Qr = new Html5Qrcode(SCANNER_ELEMENT_ID);
        if (cancelled) return;
        scannerRef.current = html5Qr;

        await html5Qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          handleQRDetected,
          () => {}  // Ignore per-frame decode failures
        );
      } catch (err) {
        if (cancelled) return;
        setCameraError(err.message || 'Failed to start scanner. Please try again.');
        setPhase('error');
        scannerRef.current = null;
      }
    };

    // Small delay so React has flushed the DOM and the scanner element has dimensions
    const timer = setTimeout(init, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase]);

  const doStopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
  };

  const startScanner = useCallback(async () => {
    setCameraError('');
    setPhase('requesting');

    // Step 1: Explicitly request camera permission — this fires the browser prompt.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(t => t.stop()); // Release immediately
      permissionGranted.current = true;
    } catch (err) {
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const isNotFound = err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError';

      if (isDenied) {
        setCameraError('Camera access was denied. Please enable camera permissions in your browser settings and refresh the page.');
      } else if (isNotFound) {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(err.message || 'Camera access failed. Please try again.');
      }
      setPhase('error');
      return;
    }

    // Step 2: Permission granted — transition to 'scanning' phase.
    // This causes the scanner DOM element to render, then the useEffect above initialises Html5Qrcode.
    setPhase('scanning');
  }, []);

  const stopScanner = useCallback(async () => {
    await doStopScanner();
    setPhase('idle');
  }, []);

  const handleQRDetected = useCallback(async (decodedText) => {
    if (submitting) return;
    setSubmitting(true);
    await doStopScanner();

    const deviceId = getDeviceId();
    try {
      const res = await api.post('/student/scan', { encryptedPayload: decodedText, deviceId });
      setLastLog(res.data.log);
      setPhase('success');

      let remaining = 300;
      setUndoSeconds(remaining);
      undoIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setUndoSeconds(remaining);
        if (remaining <= 0) {
          clearInterval(undoIntervalRef.current);
          setUndoSeconds(null);
        }
      }, 1000);

      toast.success('✅ Attendance marked successfully!', { duration: 4000 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Scan failed. Please try again.', { duration: 5000 });
      setPhase('idle');
    } finally {
      setSubmitting(false);
    }
  }, [submitting]);

  const handleUndo = async () => {
    if (!lastLog) return;
    try {
      await api.post(`/student/undo/${lastLog._id}`);
      setLastLog(null);
      setUndoSeconds(null);
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
      toast.success('Attendance cancelled successfully.', { duration: 3000 });
      setPhase('idle');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Undo failed.');
    }
  };

  const formatUndoTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in w-full max-w-lg mx-auto px-2">
      <div className="page-header text-center">
        <h1 className="page-title">Scan QR Code</h1>
        <p className="page-subtitle">Point your camera at the teacher's QR code to mark attendance.</p>
      </div>

      {/* ── Main scanner card ─────────────────────────────────────────── */}
      <div className="card mb-4">

        {/* Idle state */}
        {phase === 'idle' && (
          <div className="text-center py-10">
            <div className="text-7xl mb-4">📷</div>
            <p className="text-heading text-primary mb-2 font-semibold">Ready to scan</p>
            <p className="text-body text-text-muted mb-6">
              Make sure you have a live QR code from your teacher visible.
            </p>
            <button id="start-scan-btn" onClick={startScanner} className="btn-primary btn-lg w-full">
              📷 Start Camera
            </button>
          </div>
        )}

        {/* Requesting permission */}
        {phase === 'requesting' && (
          <div className="text-center py-10">
            <div className="text-5xl mb-4 animate-pulse">📷</div>
            <p className="text-heading text-primary mb-2">Requesting camera access...</p>
            <p className="text-body text-text-muted">Please allow camera access when prompted.</p>
          </div>
        )}

        {/* Scanning — this renders the DOM target for Html5Qrcode */}
        {phase === 'scanning' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <p className="text-body font-semibold text-primary">Scanning...</p>
              </div>
              <button id="stop-scan-btn" onClick={stopScanner} className="btn-secondary btn-sm">
                ✕ Cancel
              </button>
            </div>
            {/* This div MUST be present in the DOM when Html5Qrcode.start() is called */}
            <div
              id={SCANNER_ELEMENT_ID}
              className="w-full rounded-lg overflow-hidden border-2 border-accent"
              style={{ minHeight: '280px' }}
            />
            <p className="text-label text-text-muted text-center mt-3">
              Aim your camera at the QR code — it scans automatically.
            </p>
          </div>
        )}

        {/* Error state */}
        {phase === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-2xl mb-2">🚫</p>
            <p className="text-body text-danger font-semibold mb-2">Camera Unavailable</p>
            <p className="text-label text-danger mb-4">{cameraError}</p>
            {!cameraError.includes('browser settings') && (
              <button
                id="retry-camera-btn"
                onClick={() => { setCameraError(''); setPhase('idle'); setTimeout(startScanner, 100); }}
                className="btn-primary btn-sm"
              >
                🔄 Try Again
              </button>
            )}
          </div>
        )}

        {/* Success state */}
        {phase === 'success' && lastLog && (
          <div className="text-center py-8 animate-slide-up">
            <div className="text-7xl mb-3">✅</div>
            <h2 className="text-heading text-success mb-2 font-bold">Attendance Marked!</h2>
            <p className="text-body text-text-muted mb-6">
              Your attendance has been recorded for this session.
            </p>

            {undoSeconds !== null && undoSeconds > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-label text-amber-700 mb-2">
                  Undo available for: <strong>{formatUndoTime(undoSeconds)}</strong>
                </p>
                <button id="undo-attendance-btn" onClick={handleUndo} className="btn-danger btn-sm">
                  ↩ Undo Attendance
                </button>
              </div>
            )}

            <button
              id="scan-again-btn"
              onClick={() => { setLastLog(null); setUndoSeconds(null); setPhase('idle'); }}
              className="btn-secondary w-full"
            >
              Scan Another Code
            </button>
          </div>
        )}
      </div>

      {/* ── Tips ─────────────────────────────────────────────────────── */}
      <div className="card-flat">
        <p className="text-label font-semibold text-text-muted mb-2">💡 TIPS</p>
        <ul className="text-body text-text-secondary space-y-1">
          <li>• Hold your device steady 15–30 cm from the code</li>
          <li>• QR codes expire every 10 seconds — scan quickly</li>
          <li>• You have 5 minutes to undo a mistaken scan</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScannerPage;
