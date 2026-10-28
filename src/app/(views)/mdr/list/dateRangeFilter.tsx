const DateRangeFilter = () => {
  return (
    <div
      data-coreui-footer="true"
      data-coreui-locale="en-US"
      data-coreui-toggle="date-range-picker"
      className="date-picker show"
      aria-expanded="true"
    >
      <div className="date-picker-input-group">
        <input className="date-picker-input" placeholder="Start date" required type="text" />
        <div className="date-picker-separator"></div>
        <input className="date-picker-input" placeholder="End date" required type="text" />
        <div className="date-picker-indicator"></div>
        <div className="date-picker-cleaner"></div>
      </div>
      <div
        className="date-picker-dropdown"
        style={{
          position: 'absolute',
          inset: ' 0px auto auto 0px',
          margin: '0px',
          transform: 'translate3d(869.6px, 356px, 0px);',
        }}
        data-popper-placement="bottom-start"
      >
        <div className="date-picker-body">
          <div className="date-picker-calendars">
            <div className="date-picker-calendar select-day calendars">
              <div className="calendar" data-coreui-calendar-index="0">
                <div className="calendar-nav">
                  <div className="calendar-nav-prev">
                    <button
                      className="btn btn-transparent btn-sm btn-double-prev"
                      aria-label="Previous year"
                    >
                      <span className="calendar-nav-icon calendar-nav-icon-double-prev"></span>
                    </button>
                    <button
                      className="btn btn-transparent btn-sm btn-prev"
                      aria-label="Previous month"
                    >
                      <span className="calendar-nav-icon calendar-nav-icon-prev"></span>
                    </button>
                  </div>
                  <div className="calendar-nav-date" aria-live="polite">
                    <button className="btn btn-transparent btn-sm btn-month">November</button>
                    <button className="btn btn-transparent btn-sm btn-year">2024</button>
                  </div>
                  <div className="calendar-nav-next">
                    <button className="btn btn-transparent btn-sm btn-next" aria-label="Next month">
                      <span className="calendar-nav-icon calendar-nav-icon-next"></span>
                    </button>
                    <button
                      className="btn btn-transparent btn-sm btn-double-next"
                      aria-label="Next year"
                    >
                      <span className="calendar-nav-icon calendar-nav-icon-double-next"></span>
                    </button>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th className="calendar-cell" abbr="Monday">
                        <div className="calendar-header-cell-inner">Mo</div>
                      </th>
                      <th className="calendar-cell" abbr="Tuesday">
                        <div className="calendar-header-cell-inner">Tu</div>
                      </th>
                      <th className="calendar-cell" abbr="Wednesday">
                        <div className="calendar-header-cell-inner">We</div>
                      </th>
                      <th className="calendar-cell" abbr="Thursday">
                        <div className="calendar-header-cell-inner">Th</div>
                      </th>
                      <th className="calendar-cell" abbr="Friday">
                        <div className="calendar-header-cell-inner">Fr</div>
                      </th>
                      <th className="calendar-cell" abbr="Saturday">
                        <div className="calendar-header-cell-inner">Sa</div>
                      </th>
                      <th className="calendar-cell" abbr="Sunday">
                        <div className="calendar-header-cell-inner">Su</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell previous"
                        tabIndex={-1}
                        data-coreui-date="Mon Oct 28 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">28</div>
                      </td>
                      <td
                        className="calendar-cell previous"
                        tabIndex={-1}
                        data-coreui-date="Tue Oct 29 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">29</div>
                      </td>
                      <td
                        className="calendar-cell previous"
                        tabIndex={-1}
                        data-coreui-date="Wed Oct 30 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">30</div>
                      </td>
                      <td
                        className="calendar-cell previous"
                        tabIndex={-1}
                        data-coreui-date="Thu Oct 31 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">31</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Fri Nov 01 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">1</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sat Nov 02 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">2</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sun Nov 03 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">3</div>
                      </td>
                    </tr>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Mon Nov 04 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">4</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Tue Nov 05 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">5</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Wed Nov 06 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">6</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Thu Nov 07 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">7</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Fri Nov 08 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">8</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sat Nov 09 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">9</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sun Nov 10 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">10</div>
                      </td>
                    </tr>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell today current"
                        tabIndex={0}
                        data-coreui-date="Mon Nov 11 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">11</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Tue Nov 12 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">12</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Wed Nov 13 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">13</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Thu Nov 14 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">14</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Fri Nov 15 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">15</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sat Nov 16 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">16</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sun Nov 17 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">17</div>
                      </td>
                    </tr>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Mon Nov 18 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">18</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Tue Nov 19 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">19</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Wed Nov 20 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">20</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Thu Nov 21 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">21</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Fri Nov 22 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">22</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sat Nov 23 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">23</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sun Nov 24 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">24</div>
                      </td>
                    </tr>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Mon Nov 25 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">25</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Tue Nov 26 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">26</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Wed Nov 27 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">27</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Thu Nov 28 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">28</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Fri Nov 29 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">29</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sat Nov 30 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">30</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Sun Dec 01 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">1</div>
                      </td>
                    </tr>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Mon Dec 02 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">2</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Tue Dec 03 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">3</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Wed Dec 04 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">4</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Thu Dec 05 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">5</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Fri Dec 06 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">6</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Sat Dec 07 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">7</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Sun Dec 08 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">8</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="calendar" data-coreui-calendar-index="1">
                <div className="calendar-nav">
                  <div className="calendar-nav-prev">
                    <button
                      className="btn btn-transparent btn-sm btn-double-prev"
                      aria-label="Previous year"
                    >
                      <span className="calendar-nav-icon calendar-nav-icon-double-prev"></span>
                    </button>
                    <button
                      className="btn btn-transparent btn-sm btn-prev"
                      aria-label="Previous month"
                    >
                      <span className="calendar-nav-icon calendar-nav-icon-prev"></span>
                    </button>
                  </div>
                  <div className="calendar-nav-date" aria-live="polite">
                    <button className="btn btn-transparent btn-sm btn-month">December</button>
                    <button className="btn btn-transparent btn-sm btn-year">2024</button>
                  </div>
                  <div className="calendar-nav-next">
                    <button className="btn btn-transparent btn-sm btn-next" aria-label="Next month">
                      <span className="calendar-nav-icon calendar-nav-icon-next"></span>
                    </button>
                    <button
                      className="btn btn-transparent btn-sm btn-double-next"
                      aria-label="Next year"
                    >
                      <span className="calendar-nav-icon calendar-nav-icon-double-next"></span>
                    </button>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th className="calendar-cell" abbr="Monday">
                        <div className="calendar-header-cell-inner">Mo</div>
                      </th>
                      <th className="calendar-cell" abbr="Tuesday">
                        <div className="calendar-header-cell-inner">Tu</div>
                      </th>
                      <th className="calendar-cell" abbr="Wednesday">
                        <div className="calendar-header-cell-inner">We</div>
                      </th>
                      <th className="calendar-cell" abbr="Thursday">
                        <div className="calendar-header-cell-inner">Th</div>
                      </th>
                      <th className="calendar-cell" abbr="Friday">
                        <div className="calendar-header-cell-inner">Fr</div>
                      </th>
                      <th className="calendar-cell" abbr="Saturday">
                        <div className="calendar-header-cell-inner">Sa</div>
                      </th>
                      <th className="calendar-cell" abbr="Sunday">
                        <div className="calendar-header-cell-inner">Su</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell previous"
                        tabIndex={-1}
                        data-coreui-date="Mon Nov 25 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">25</div>
                      </td>
                      <td
                        className="calendar-cell previous"
                        tabIndex={-1}
                        data-coreui-date="Tue Nov 26 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">26</div>
                      </td>
                      <td
                        className="calendar-cell previous"
                        tabIndex={-1}
                        data-coreui-date="Wed Nov 27 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">27</div>
                      </td>
                      <td
                        className="calendar-cell previous"
                        tabIndex={-1}
                        data-coreui-date="Thu Nov 28 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">28</div>
                      </td>
                      <td
                        className="calendar-cell previous"
                        tabIndex={-1}
                        data-coreui-date="Fri Nov 29 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">29</div>
                      </td>
                      <td
                        className="calendar-cell previous"
                        tabIndex={-1}
                        data-coreui-date="Sat Nov 30 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">30</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sun Dec 01 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">1</div>
                      </td>
                    </tr>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Mon Dec 02 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">2</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Tue Dec 03 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">3</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Wed Dec 04 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">4</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Thu Dec 05 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">5</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Fri Dec 06 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">6</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sat Dec 07 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">7</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sun Dec 08 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">8</div>
                      </td>
                    </tr>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Mon Dec 09 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">9</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Tue Dec 10 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">10</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Wed Dec 11 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">11</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Thu Dec 12 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">12</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Fri Dec 13 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">13</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sat Dec 14 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">14</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sun Dec 15 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">15</div>
                      </td>
                    </tr>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Mon Dec 16 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">16</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Tue Dec 17 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">17</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Wed Dec 18 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">18</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Thu Dec 19 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">19</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Fri Dec 20 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">20</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sat Dec 21 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">21</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sun Dec 22 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">22</div>
                      </td>
                    </tr>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Mon Dec 23 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">23</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Tue Dec 24 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">24</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Wed Dec 25 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">25</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Thu Dec 26 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">26</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Fri Dec 27 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">27</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sat Dec 28 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">28</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Sun Dec 29 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">29</div>
                      </td>
                    </tr>
                    <tr className="calendar-row false" tabIndex={-1}>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Mon Dec 30 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">30</div>
                      </td>
                      <td
                        className="calendar-cell current"
                        tabIndex={0}
                        data-coreui-date="Tue Dec 31 2024 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">31</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Wed Jan 01 2025 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">1</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Thu Jan 02 2025 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">2</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Fri Jan 03 2025 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">3</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Sat Jan 04 2025 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">4</div>
                      </td>
                      <td
                        className="calendar-cell next"
                        tabIndex={-1}
                        data-coreui-date="Sun Jan 05 2025 00:00:00 GMT+0500 (Pakistan Standard Time)"
                      >
                        <div className="calendar-cell-inner day">5</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="date-picker-footer">
          <button className="btn btn-sm btn-primary me-auto" type="button">
            Today
          </button>
          <button className="btn btn-sm btn-ghost-primary" type="button">
            Cancel
          </button>
          <button className="btn btn-sm btn-primary" type="button">
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
export default DateRangeFilter
