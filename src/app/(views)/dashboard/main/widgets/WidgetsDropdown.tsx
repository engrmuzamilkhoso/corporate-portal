'use client'

import React, {useEffect, useRef, useState} from 'react'

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
} from '@coreui/react-pro'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'

const WidgetsDropdown = (props: { className?: string }) => {
  const widgetChartRef1 = useRef<any>(null)
  const widgetChartRef2 = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
        widgetChartRef1.current.update()
      }

      if (widgetChartRef2.current) {
        widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
        widgetChartRef2.current.update()
      }
    })
  }, [widgetChartRef1, widgetChartRef2])

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000) // 5 seconds delay

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {loading ? (
        <CRow className={props.className} xs={{ gutter: 4 }}>
          <>
            <CCol xs={3}>
              <div className="skeleton skeleton-half"></div>
            </CCol>
            <CCol xs={3}>
              <div className="skeleton skeleton-half"></div>
            </CCol>
            <CCol xs={3}>
              <div className="skeleton skeleton-half"></div>
            </CCol>
            <CCol xs={3}>
              <div className="skeleton skeleton-half"></div>
            </CCol>
          </>
        </CRow>
      ) : (
        <CRow className={props.className} xs={{ gutter: 4 }}>
          <CCol sm={6} xl={4} xxl={3}>
            <CWidgetStatsA
              className="widget-dashboard"
              value={
                <>
                  26K{' '}
                  <span className="fs-6 fw-normal text-dark">
                  (-12.4% <CIcon icon={cilArrowBottom} />)
                </span>
                </>
              }
              title="Users"
            />
          </CCol>
          <CCol sm={6} xl={4} xxl={3}>
            <CWidgetStatsA
              className="widget-dashboard"
              value={
                <>
                  $6.200{' '}
                  <span className="fs-6 fw-normal">
                  (40.9% <CIcon icon={cilArrowTop} />)
                </span>
                </>
              }
              title="Income"
            />
          </CCol>
          <CCol sm={6} xl={4} xxl={3}>
            <CWidgetStatsA
              className="widget-dashboard"
              value={
                <>
                  2.49%{' '}
                  <span className="fs-6 fw-normal">
                  (84.7% <CIcon icon={cilArrowTop} />)
                </span>
                </>
              }
              title="Conversion Rate"
            />
          </CCol>
          <CCol sm={6} xl={4} xxl={3}>
            <CWidgetStatsA
              className="widget-dashboard"
              value={
                <>
                  44K{' '}
                  <span className="fs-6 fw-normal">
                  (-23.6% <CIcon icon={cilArrowBottom} />)
                </span>
                </>
              }
              title="Sessions"
            />
          </CCol>
        </CRow>
      )}
    </>
  );

}

export default WidgetsDropdown
