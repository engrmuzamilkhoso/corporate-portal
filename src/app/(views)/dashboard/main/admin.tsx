'use client'

import { useEffect, useState } from 'react'
import {
  CCardBody,
  CCol,
  CContainer,
  CRow,
} from '@coreui/react-pro'
import {CChartLine} from '@coreui/react-chartjs'

import WidgetsDropdown from '@/app/(views)/dashboard/main/widgets/WidgetsDropdown'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000) // 5 seconds delay

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
     <CContainer fluid className="px-4">
      <h2>Dashboard overview</h2>
      <WidgetsDropdown className="mb-4"/>
      <CRow>
        {loading ? (
          <>
            <CCol md={12}>
              <div className="skeleton skeleton-full"></div>
            </CCol>
            {/* Add more skeleton loaders as needed */}
          </>
        ) : (
          <>

            <CCol md={12}>
              <CCardBody>
                <CChartLine
                  data={{
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                    datasets: [
                      {
                        label: 'Revenue',
                        backgroundColor: 'rgba(220, 220, 220, 0.2)',
                        borderColor: '#3d5c9b', // Set chart line color to blue
                        pointBackgroundColor: 'rgba(0, 123, 255, 1)', // Set point color to blue
                        pointBorderColor: '#fff',
                        data: [
                          Math.round(Math.random() * 100),
                          Math.round(Math.random() * 100),
                          Math.round(Math.random() * 100),
                          Math.round(Math.random() * 100),
                          Math.round(Math.random() * 100),
                          Math.round(Math.random() * 100),
                          Math.round(Math.random() * 100),
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        grid: {
                          display: false, // Hide vertical grid lines
                        },
                      },
                      y: {
                        grid: {
                          display: true,  // Show horizontal grid lines
                        },
                      },
                    },
                  }}
                  style={{ height: '300px' }} // Control chart height
                />
              </CCardBody>
            </CCol>


          </>
        )}
      </CRow>
     </CContainer>
    </>
  )
}

export default Dashboard
