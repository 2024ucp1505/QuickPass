import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api/axios';
import { getDeviceId } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SCANNER_ELEMENT_ID = 'qr-scanner-region';

const QRScannerPage = () => {
  const [scanning, setScanning] = useState(false);
  const [lastLog, setLastLog] = useState(null);
  const [undoSeconds, setUndoSeconds] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);
  const undoIntervalRef = useRef(null);

  // ─── Cleanup: stop camera stream on unmount ───────────────────────────────
  useEffect(() => {
    return () => {
      stopScanner();
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    };
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const isRunning = scannerRef.current.isScanning;
        if (isRunning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        // Ignore errors on cleanup
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    setCameraError('');
    setScanning(true);

    try {
      const html5Qr = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = html5Qr;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error('No cameras found on this device.');
      }

      // Prefer rear camera
      const cameraId = cameras.find(c => c.label?.toLowerCase().includes('back'))?.id
        || cameras[cameras.length - 1]?.id;

      await html5Qr.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onQRDetected,
        () => {} // Ignore scan failures (user still moving camera)
      );
    } catch (err) {
      setCameraError(err.message || 'Camera access denied. Please allow camera permissions.');
      setScanning(false);
      if (scannerRef.current) {
        scannerRef.current = null;
      }
    }
  }, []);

  const onQRDetected = useCallback(async (decodedText) => {
    // Prevent multiple simultaneous scans
    if (submitting) return;
    setSubmitting(true);

    // Stop scanner immediately after successful scan
    await stopScanner();

    const deviceId = getDeviceId();

    try {
      const res = await api.post('/student/scan', {
        encryptedPayload: decodedText,
        deviceId,
      });

      setLastLog(res.data.log);

      // Start undo countdown (5 min = 300 seconds)
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
      const message = err.response?.data?.message || 'Scan failed. Please try again.';
      toast.error(message, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  }, [submitting, stopScanner]);

  const handleUndo = async () => {
    if (!lastLog) return;
    try {
      await api.post(`/student/undo/${lastLog._id}`);
      setLastLog(null);
      setUndoSeconds(null);
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
      toast.success('Attendance cancelled successfully.', { duration: 3000 });
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
    <div className="animate-fade-in max-w-lg mx-auto">
      <div className="page-header text-center">
        <h1 className="page-title">Scan QR Code</h1>
        <p className="page-subtitle">Point your camera at the teacher's QR code to mark attendance.</p>
      </div>

      {/* Scanner area */}
      <div className="card mb-20">
        {!scanning && !lastLog && (
          <div className="text-center py-32">
            <div className="text-[64px] mb-16">📷</div>
            <p className="text-heading text-primary mb-8">Ready to scan</p>
            <p className="text-body text-text-muted mb-24">
              Make sure you have a live QR code from your teacher visible.
            </p>
            <button
              id="start-scan-btn"
              onClick={startScanner}
              className="btn-primary btn-lg"
            >
              📷 Start Camera
            </button>
          </div>
        )}

        {scanning && (
          <div>
            <div className="flex items-center justify-between mb-16">
              <p className="text-body font-semibold text-primary">Scanning...</p>
              <button
                id="stop-scan-btn"
                onClick={stopScanner}
                className="btn-secondary btn-sm"
              >
                ✕ Cancel
              </button>
            </div>

            {/* QR scanner container */}
            <div
              id={SCANNER_ELEMENT_ID}
              className="w-full rounded-lg overflow-hidden border-2 border-accent"
              style={{ minHeight: '300px' }}
            />

            <div className="flex items-center justify-center gap-8 mt-12">
              <div className="w-8 h-8 rounded-full bg-accent animate-pulse" />
              <p className="text-label text-text-muted">Camera active — looking for QR code...</p>
            </div>
          </div>
        )}

        {cameraError && (
          <div className="p-16 bg-red-50 border border-danger border-opacity-30 rounded-md">
            <p className="text-body text-danger font-semibold mb-4">Camera Error</p>
            <p className="text-label text-danger">{cameraError}</p>
            <button
              id="retry-camera-btn"
              onClick={() => { setCameraError(''); startScanner(); }}
              className="btn-primary btn-sm mt-12"
            >
              Retry
            </button>
          </div>
        )}

        {lastLog && (
          <div className="text-center py-24 animate-slide-up">
            <div className="text-[64px] mb-12">✅</div>
            <h2 className="text-heading text-success mb-4">Attendance Marked!</h2>
            <p className="text-body text-text-muted mb-20">
              Your attendance has been recorded for this session.
            </p>

            {undoSeconds !== null && undoSeconds > 0 && (
              <div className="mb-16">
                <p className="text-label text-text-muted mb-8">
                  Undo available for: <strong className="text-primary">{formatUndoTime(undoSeconds)}</strong>
                </p>
                <button
                  id="undo-attendance-btn"
                  onClick={handleUndo}
                  className="btn-danger btn-sm"
                >
                  ↩ Undo Attendance
                </button>
              </div>
            )}

            <button
              id="scan-again-btn"
              onClick={() => { setLastLog(null); setUndoSeconds(null); }}
              className="btn-secondary mt-8"
            >
              Scan Another Code
            </button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card-flat">
        <p className="text-label font-semibold text-text-muted mb-8">💡 SCANNING TIPS</p>
        <ul className="text-body text-text-secondary space-y-4">
          <li>• Ensure your screen brightness is high</li>
          <li>• Hold the device steady 15–30 cm from the QR code</li>
          <li>• QR codes expire after 10 seconds — scan the latest one</li>
          <li>• You have 5 minutes to undo a mistaken scan</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScannerPage;
