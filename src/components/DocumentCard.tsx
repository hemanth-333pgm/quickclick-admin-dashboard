import React from "react";

export interface Doc {
  type: string;
  url: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  remarks?: string | null;
  uploadedAt?: string;
  verified?: boolean;
}

interface Props {
  doc: Doc;
  onApprove: (type: string) => void;
  onReject: (type: string) => void;
}

export const DocumentCard: React.FC<Props> = ({ doc, onApprove, onReject }) => {
  const isPdf = doc.url.toLowerCase().split("?")[0].endsWith(".pdf");

  const statusColor =
    doc.status === "APPROVED"
      ? "#16a34a"
      : doc.status === "REJECTED"
      ? "#dc2626"
      : "#f59e0b";

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 14,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{doc.type}</span>
        <span
          style={{
            background: statusColor + "20",
            color: statusColor,
            padding: "2px 8px",
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {doc.status}
        </span>
      </div>

      <div
        style={{
          height: 220,
          background: "#f9fafb",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {isPdf ? (
          <iframe
            src={doc.url}
            title={doc.type}
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        ) : (
          <img
            src={doc.url}
            alt={doc.type}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "6px 12px",
            background: "#e5e7eb",
            color: "#374151",
            borderRadius: 4,
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Open in new tab
        </a>
        {doc.status !== "APPROVED" && (
          <button
            onClick={() => onApprove(doc.type)}
            style={{
              padding: "6px 12px",
              background: "#16a34a",
              color: "#fff",
              border: 0,
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Approve
          </button>
        )}
        {doc.status !== "REJECTED" && (
          <button
            onClick={() => onReject(doc.type)}
            style={{
              padding: "6px 12px",
              background: "#dc2626",
              color: "#fff",
              border: 0,
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reject
          </button>
        )}
      </div>

      {doc.remarks && (
        <div
          style={{
            fontSize: 12,
            color: "#991b1b",
            background: "#fef2f2",
            padding: 8,
            borderRadius: 4,
          }}
        >
          <strong>Remark:</strong> {doc.remarks}
        </div>
      )}
    </div>
  );
};