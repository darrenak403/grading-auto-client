import * as React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  style?: React.CSSProperties;
}

export function Skeleton({
  className = "",
  width,
  height,
  circle = false,
  style,
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#eceae3] ${
        circle ? "rounded-full" : "rounded-lg"
      } ${className}`}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
        ...style,
      }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Header Skeleton */}
      <div style={{ marginBottom: "48px" }}>
        <Skeleton width={120} height={16} className="mb-2" />
        <Skeleton width={240} height={40} />
      </div>

      {/* Stats Cards Skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
          marginBottom: "48px",
        }}
        className="stats-grid"
      >
        <div
          style={{
            backgroundColor: "#fffefb",
            border: "1px solid #c5c0b1",
            borderRadius: "5px",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <Skeleton width={100} height={14} />
          <Skeleton width={60} height={48} />
          <Skeleton width={80} height={16} className="mt-2" />
        </div>

        <div
          style={{
            backgroundColor: "#fffefb",
            border: "1px solid #c5c0b1",
            borderRadius: "5px",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <Skeleton width={100} height={14} />
          <Skeleton width={60} height={48} />
          <Skeleton width={80} height={16} className="mt-2" />
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "48px",
          flexWrap: "wrap",
        }}
      >
        <Skeleton width={180} height={48} />
        <Skeleton width={160} height={48} />
        <Skeleton width={140} height={48} />
      </div>

      {/* Recent Exam Sessions Skeleton */}
      <div style={{ marginBottom: "48px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <Skeleton width={200} height={28} />
          <Skeleton width={60} height={16} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#fffefb",
                border: "1px solid #c5c0b1",
                borderRadius: "5px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Skeleton width="80%" height={20} />
              <Skeleton width="100%" height={16} />
              <Skeleton width="60%" height={16} />
              <Skeleton width={90} height={14} className="mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {/* Table Header Skeleton */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          padding: "12px 16px",
          borderBottom: "1px solid #c5c0b1",
          backgroundColor: "#eceae3",
          borderRadius: "4px",
        }}
      >
        {Array.from({ length: columns }).map((_, i) => {
          // Chiều rộng ngẫu nhiên cho các tiêu đề để tự nhiên hơn
          const widths = ["15%", "25%", "15%", "20%", "15%", "10%"];
          const w = widths[i % widths.length];
          return (
            <div key={i} style={{ width: w }}>
              <Skeleton height={14} />
            </div>
          );
        })}
      </div>

      {/* Table Body Rows Skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            style={{
              display: "flex",
              gap: "16px",
              padding: "16px",
              borderBottom: "1px solid #eceae3",
              alignItems: "center",
            }}
          >
            {Array.from({ length: columns }).map((_, c) => {
              const widths = ["20%", "22%", "12%", "18%", "13%", "15%"];
              const w = widths[c % widths.length];
              return (
                <div key={c} style={{ width: w }}>
                  {c === 0 ? (
                    // Cột đầu tiên (ví dụ Student Code hoặc Title) giả lập dạng 2 dòng chữ
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <Skeleton width="85%" height={16} />
                      <Skeleton width="60%" height={12} />
                    </div>
                  ) : (
                    <Skeleton width="75%" height={16} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
