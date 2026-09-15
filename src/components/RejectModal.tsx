import React, { useState } from "react";

interface Props {
  title: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const QUICK_REASONS = [
  "Document is blurry / unreadable",
  "Document has expired",
  "Information does not match",
  "Wrong document type uploaded",
  "Missing required information",
  "GST / License not valid",
];

export const RejectModal: React.FC<Props> = ({ title, open, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert("Please enter a reason");
      return;
    }
    onConfirm(reason.trim());
    setReason("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          width: 480,
          maxWidth: "90vw",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>{title}</h3>

        <label style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
          Reason for rejection *
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this is rejected..."
          style={{
            width: "100%",
            minHeight: 100,
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            fontSize: 14,
            marginTop: 6,
            fontFamily: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {QUICK_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              type="button"
              style={{
                padding: "4px 10px",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                fontSize: 12,
                cursor: "pointer",
                color: "#374151",
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "#f3f4f6",
              border: 0,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "8px 16px",
              background: "#dc2626",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};