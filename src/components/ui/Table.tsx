"use client";

import * as React from "react";

interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  borderless?: boolean;
  maxHeight?: string | number;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No data available",
  borderless = false,
  maxHeight,
}: TableProps<T>) {
  return (
    <div
      style={{
        width: "100%",
        overflow: "auto",
        maxHeight,
        border: borderless ? "none" : "1px solid #c5c0b1",
        borderRadius: borderless ? "0" : "12px",

      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "0.9375rem",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: borderless ? "#fcfcfc" : "#fffdf9",
              borderBottom: borderless ? "1px solid #ebebeb" : "1px solid #c5c0b1",
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: borderless ? "#fcfcfc" : "#fffdf9",
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  color: borderless ? "#222222" : "#36342e",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap",
                  width: col.width,
                  boxShadow: borderless ? "0 1px 0 #ebebeb" : "0 1px 0 #c5c0b1",
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "48px 16px",
                  textAlign: "center",
                  color: "#939084",
                  fontFamily: "Inter, Arial, sans-serif",
                  fontSize: "0.9375rem",
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                style={{
                  borderBottom: borderless ? "1px solid #ebebeb" : "1px solid #eceae3",
                  backgroundColor: borderless
                    ? index % 2 === 0 ? "#ffffff" : "#fcfcfc"
                    : index % 2 === 0 ? "#fffefb" : "#fffdf9",
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background-color 0.1s ease",
                  ...(onRowClick
                    ? {
                        onMouseEnter: (e: React.MouseEvent) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            borderless ? "#f7f7f7" : "#eceae3";
                        },
                        onMouseLeave: (e: React.MouseEvent) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            borderless
                              ? index % 2 === 0 ? "#ffffff" : "#fcfcfc"
                              : index % 2 === 0 ? "#fffefb" : "#fffdf9";
                        },
                      }
                    : {}),
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "12px 16px",
                      color: borderless ? "#484848" : "#36342e",
                      verticalAlign: "middle",
                    }}
                  >
                    {col.render
                      ? col.render(item, index)
                      : String(
                          (item as Record<string, unknown>)[col.key] ?? ""
                        )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
