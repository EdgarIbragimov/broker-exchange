import React, { useMemo, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import { Stock } from "../types";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  TooltipItem,
  Chart,
} from "chart.js";
import { Line } from "react-chartjs-2";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import { ru } from "date-fns/locale";

// Register necessary components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface StockChartsProps {
  stock: Stock;
}

const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
`;

const TableHeader = styled.th`
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eaedf3;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
`;

const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #eaedf3;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eaedf3;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.$active ? "#4a90e2" : "transparent")};
  color: ${(props) => (props.$active ? "#4a90e2" : "#64748b")};
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #4a90e2;
  }
`;

const ResponsiveContainer = styled.div`
  width: 100%;
  position: relative;
  padding-bottom: 2rem;
  overflow-x: auto;
`;

const ChartWrapper = styled.div`
  position: relative;
  height: 400px;
`;

const ZoomControls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  gap: 0.5rem;
`;

const ZoomButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3a7bc8;
  }
`;

const parseDate = (dateStr: string): Date | null => {
  try {
    if (dateStr.includes("/")) {
      const [month, day, year] = dateStr.split("/");
      const parsedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    } else {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    }
    console.warn("Invalid date format, skipping:", dateStr);
    return null;
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return null;
  }
};

const StockCharts: React.FC<StockChartsProps> = ({ stock }) => {
  const [activeTab, setActiveTab] = useState<"chart" | "table">("chart");
  const chartRef = useRef<ChartJS<"line"> | null>(null);

  const sortedHistory = useMemo(() => {
    return [...stock.history]
      .map((item) => ({ ...item, parsedDate: parseDate(item.date) }))
      .filter(
        (item): item is Stock["history"][number] & { parsedDate: Date } =>
          item.parsedDate instanceof Date && !isNaN(item.parsedDate.getTime())
      )
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
  }, [stock.history]);

  const resetZoom = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  }, []);

  const chartData = useMemo(() => {
    const dataPoints = sortedHistory.map((item) => ({
      x: item.parsedDate.getTime(),
      y: item.price,
    }));

    return {
      datasets: [
        {
          label: "Цена акции",
          data: dataPoints,
          borderColor: "#4a90e2",
          backgroundColor: "rgba(74, 144, 226, 0.1)",
          fill: false,
          borderWidth: 1.5,
          tension: 0.1,
          pointRadius: 1,
          pointHoverRadius: 4,
          pointBackgroundColor: "#4a90e2",
          pointBorderColor: "#4a90e2",
        },
      ],
    };
  }, [sortedHistory]);

  const chartOptions = useMemo((): ChartOptions<"line"> => {
    const minZoomRange = 7 * 24 * 60 * 60 * 1000;

    return {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      scales: {
        x: {
          type: "time" as const,
          adapters: {
            date: { locale: ru },
          },
          time: {
            unit: "month",
            displayFormats: {
              millisecond: "HH:mm:ss.SSS",
              second: "HH:mm:ss",
              minute: "HH:mm",
              hour: "HH:mm",
              day: "dd MMM",
              week: "dd MMM",
              month: "MMM yyyy",
              quarter: "'Q'q yyyy",
              year: "yyyy",
            },
            tooltipFormat: "dd MMMM yyyy",
          },
          grid: {
            display: false,
          },
          ticks: {
            source: "auto",
            maxRotation: 45,
            minRotation: 0,
            autoSkip: true,
          },
          title: {
            display: true,
            text: "Дата",
            font: {
              size: 14,
              weight: "bold" as const,
            },
          },
        },
        y: {
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            callback: (value: string | number) =>
              `$${Number(value).toFixed(2)}`,
          },
          title: {
            display: true,
            text: "Цена ($)",
            font: {
              size: 14,
              weight: "bold" as const,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems: TooltipItem<"line">[]) => {
              const timestamp = tooltipItems[0]?.parsed?.x;
              if (timestamp === undefined || timestamp === null) return "";
              const date = new Date(timestamp);
              return new Intl.DateTimeFormat("ru-RU", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(date);
            },
            label: (tooltipItem: TooltipItem<"line">) => {
              const price = tooltipItem.parsed?.y;
              if (price === undefined || price === null) return "";
              return `Цена: $${price.toFixed(2)}`;
            },
          },
        },
        zoom: {
          pan: {
            enabled: true,
            mode: "x" as const,
            threshold: 5,
          },
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.1,
            },
            pinch: {
              enabled: true,
            },
            mode: "x" as const,
          },
          limits: {
            x: {
              min: "original" as const,
              max: "original" as const,
              minRange: minZoomRange,
            },
          },
        },
      },
    };
  }, []);

  return (
    <ChartContainer>
      <ChartTitle>
        История котировок {stock.symbol} ({stock.company})
      </ChartTitle>

      <Tabs>
        <Tab
          $active={activeTab === "chart"}
          onClick={() => setActiveTab("chart")}
        >
          График
        </Tab>
        <Tab
          $active={activeTab === "table"}
          onClick={() => setActiveTab("table")}
        >
          Таблица
        </Tab>
      </Tabs>

      {activeTab === "chart" && (
        <>
          <ResponsiveContainer>
            <ChartWrapper>
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            </ChartWrapper>
          </ResponsiveContainer>
          <ZoomControls>
            <ZoomButton onClick={resetZoom}>Сбросить масштаб</ZoomButton>
          </ZoomControls>
        </>
      )}

      {activeTab === "table" && (
        <ResponsiveContainer>
          <DataTable>
            <thead>
              <tr>
                <TableHeader>Дата</TableHeader>
                <TableHeader>Цена ($)</TableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((item, index) => (
                <tr key={index}>
                  <TableCell>
                    {item.parsedDate.toLocaleDateString("ru-RU")}
                  </TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default StockCharts;
