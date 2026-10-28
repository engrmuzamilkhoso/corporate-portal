'use client'

import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react-pro'
import {
  CChartBar,
  CChartDoughnut,
  CChartLine,
  CChartPie,
  CChartPolarArea,
  CChartRadar,
} from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'
import WidgetsDropdown from '@/app/(views)/dashboard/main/widgets/WidgetsDropdown'
import avatar1 from '@/public/images/avatars/1.jpg'
import avatar2 from '@/public/images/avatars/2.jpg'
import avatar3 from '@/public/images/avatars/3.jpg'
import avatar4 from '@/public/images/avatars/4.jpg'
import avatar5 from '@/public/images/avatars/5.jpg'
import avatar6 from '@/public/images/avatars/6.jpg'
import { DocsLink } from '@/components'

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
      <WidgetsDropdown className="mb-4" />
      <CRow>
        {loading ? (
          <>
            <CCol md={6}>
              <div className="skeleton skeleton-full"></div>
            </CCol>
            <CCol md={6}>
              <div className="skeleton skeleton-full"></div>
            </CCol>
            {/* Add more skeleton loaders as needed */}
          </>
        ) : (
          <>
            <CCol md={6}>
              <CCard className="mb-4 shadow-f">
                <CCardHeader>
                  Bar Chart
                  <DocsLink href="http://www.chartjs.org" />
                </CCardHeader>
                <CCardBody>
                  <CChartBar
                    data={{
                      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                      datasets: [
                        {
                          label: 'GitHub Commits',
                          backgroundColor: '#f87979',
                          data: [40, 20, 12, 39, 10, 40, 39, 80, 40],
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard className="mb-4 shadow-f">
                <CCardHeader>Line Chart</CCardHeader>
                <CCardBody>
                  <CChartLine
                    data={{
                      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                      datasets: [
                        {
                          label: 'My First dataset',
                          backgroundColor: 'rgba(220, 220, 220, 0.2)',
                          borderColor: 'rgba(220, 220, 220, 1)',
                          pointBackgroundColor: 'rgba(220, 220, 220, 1)',
                          pointBorderColor: '#fff',
                          data: [Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100)],
                        },
                        {
                          label: 'My Second dataset',
                          backgroundColor: 'rgba(151, 187, 205, 0.2)',
                          borderColor: 'rgba(151, 187, 205, 1)',
                          pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                          pointBorderColor: '#fff',
                          data: [Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100)],
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard className="mb-4 shadow-f">
                <CCardHeader>Doughnut Chart</CCardHeader>
                <CCardBody>
                  <CChartDoughnut
                    data={{
                      labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
                      datasets: [
                        {
                          backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
                          data: [40, 20, 80, 10],
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard className="mb-4 shadow-f">
                <CCardHeader>Pie Chart</CCardHeader>
                <CCardBody>
                  <CChartPie
                    data={{
                      labels: ['Red', 'Green', 'Yellow'],
                      datasets: [
                        {
                          data: [300, 50, 100],
                          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard className="mb-4 shadow-f">
                <CCardHeader>Polar Area Chart</CCardHeader>
                <CCardBody>
                  <CChartPolarArea
                    data={{
                      labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'],
                      datasets: [
                        {
                          data: [11, 16, 7, 3, 14],
                          backgroundColor: ['#FF6384', '#4BC0C0', '#FFCE56', '#E7E9ED', '#36A2EB'],
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard className="mb-4 shadow-f">
                <CCardHeader>Radar Chart</CCardHeader>
                <CCardBody>
                  <CChartRadar
                    data={{
                      labels: [
                        'Eating',
                        'Drinking',
                        'Sleeping',
                        'Designing',
                        'Coding',
                        'Cycling',
                        'Running',
                      ],
                      datasets: [
                        {
                          label: 'My First dataset',
                          backgroundColor: 'rgba(220, 220, 220, 0.2)',
                          borderColor: 'rgba(220, 220, 220, 1)',
                          pointBackgroundColor: 'rgba(220, 220, 220, 1)',
                          pointBorderColor: '#fff',
                          data: [65, 59, 90, 81, 56, 55, 40],
                        },
                        {
                          label: 'My Second dataset',
                          backgroundColor: 'rgba(151, 187, 205, 0.2)',
                          borderColor: 'rgba(151, 187, 205, 1)',
                          pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                          pointBorderColor: '#fff',
                          data: [28, 48, 40, 19, 96, 27, 100],
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          </>
        )}
      </CRow>
    </>
  )
}

export default Dashboard
