import React, { useState } from 'react';
import { enrollPatient } from '../api/facialAPI';

export default function RegisterModal({ frameBlob, onClose, onEnrolled }) {
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const previewUrl = frameBlob ? URL.createObjectURL(frameBlob) : null;

  async function submitEnroll(e) {
    e.preventDefault();
    if (!patientId) return alert('Please enter Patient ID');
    setLoading(true);

    try {
      const body = await enrollPatient(patientId, frameBlob);
      console.log("Enroll body:", body);

      if (body.status === 'duplicate') {
        onEnrolled?.({
          duplicate: true,
          patient_id: body.patient_id,
          confidence: body.confidence,
          message: body.message,
        });
        onClose(true); // ✅ signal to reset capture
        return;
      }

      if (body.status === 'enrolled' || body.status === 'success') {
        onEnrolled?.({
          status: 'enrolled',
          patient_id: body.patient_id,
          message: body.message,
        });
        onClose(true); // ✅ reset capture
        return;
      }

      throw new Error('Unexpected response: ' + JSON.stringify(body));
    } catch (err) {
      console.error('enroll error', err);
      alert('Enroll failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Register New Patient</h2>

        {previewUrl && <img src={previewUrl} alt="preview" className="enroll-preview" />}

        <form onSubmit={submitEnroll}>
          <label>Patient ID</label>
          <input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="e.g. 12345"
            required
          />

          <div className="modal-actions">
            <button
              type="button"
              className="btn outline"
              onClick={() => onClose(true)} // ✅ reset capture on cancel
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
