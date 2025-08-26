import React from "react";

export default function MatchModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Match Result</h2>

        {data.matched_patient_id ? (
          <p>
            ✅ Match found: <strong>{data.matched_patient_id}</strong>
          </p>
        ) : (
          <p>⚠️ No match found</p>
        )}

        {data.confidence && (
          <p>Confidence: {(data.confidence * 100).toFixed(2)}%</p>
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
