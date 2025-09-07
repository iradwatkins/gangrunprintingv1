'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export function OrdersOverviewChart() {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Completed',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Pending',
        data: [28, 48, 40, 19, 86, 27, 90],
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderColor: 'rgb(251, 146, 60)',
        borderWidth: 1,
      },
      {
        label: 'Cancelled',
        data: [12, 15, 8, 10, 5, 7, 4],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 10,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
        },
      },
    },
  }

  return (
    <div className="h-[300px]">
      <Bar data={data} options={options} />
    </div>
  )
}