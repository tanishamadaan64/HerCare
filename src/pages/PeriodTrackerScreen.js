import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';

export default function PeriodTrackerScreen() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const navigate = useNavigate();
  const userId = 'mock-user-id'; // Replace with actual auth user ID

  useEffect(() => {
    // Using state instead of localStorage for artifact compatibility
    // In your actual app, you would use localStorage here
    const savedPeriods = localStorage.getItem(`periods_${userId}`);
    const savedDates = localStorage.getItem(`selectedDates_${userId}`);

    if (savedPeriods) setPeriods(JSON.parse(savedPeriods));
    if (savedDates) setSelectedDates(JSON.parse(savedDates));
  }, []);

  // Fix: Helper function to format date consistently
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDayClick = (value) => {
    // Fix: Use consistent date formatting to avoid timezone issues
    const clickedDate = formatDateString(value);

    if (!startDate) {
      setStartDate(clickedDate);
      setEndDate(null);
      setSelectedDates([clickedDate]);
    } else if (!endDate) {
      const start = new Date(startDate);
      const end = new Date(clickedDate);
      if (end < start) {
        alert('End date should be after start date');
        return;
      }

      const dates = [];
      let curr = new Date(start);
      while (curr <= end) {
        dates.push(formatDateString(curr));
        curr.setDate(curr.getDate() + 1);
      }

      setEndDate(clickedDate);
      setSelectedDates(dates);
    } else {
      setStartDate(clickedDate);
      setEndDate(null);
      setSelectedDates([clickedDate]);
    }
  };

  const logPeriod = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const numberOfDays = selectedDates.length;
    const month = new Date(startDate).toLocaleString('default', { month: 'long' });

    const newPeriod = { startDate, endDate, month, numberOfDays };
    const updatedPeriods = [...periods, newPeriod];
    setPeriods(updatedPeriods);

    // In your actual app, you would save to localStorage here
    localStorage.setItem(`periods_${userId}`, JSON.stringify(updatedPeriods));
    localStorage.setItem(`selectedDates_${userId}`, JSON.stringify([])); // Clear selected dates

    alert(`Period logged from ${startDate} to ${endDate}`);

    setStartDate(null);
    setEndDate(null);
    setSelectedDates([]);
  };

  const deletePeriod = (index) => {
    const updated = periods.filter((_, i) => i !== index);
    setPeriods(updated);
    
    // Fix: Clear selected dates and reset state when deleting
    setSelectedDates([]);
    setStartDate(null);
    setEndDate(null);
    
    // In your actual app, you would save to localStorage here
    localStorage.setItem(`periods_${userId}`, JSON.stringify(updated));
    localStorage.setItem(`selectedDates_${userId}`, JSON.stringify([]));
  };

  const styles = {
    page: {
      width: '100%',
      padding: 'clamp(8px, 2vw, 20px)',
      backgroundColor: '#fff0f5',
      minHeight: '100vh',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: 'clamp(12px, 3vw, 20px)',
      padding: 'clamp(12px, 3vw, 25px)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    },
    title: {
      textAlign: 'center',
      color: '#ff5f7c',
      marginBottom: 'clamp(16px, 4vw, 30px)',
      fontSize: 'clamp(20px, 5vw, 32px)',
      fontWeight: '700',
      letterSpacing: '-0.5px',
    },
    calendarContainer: {
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto clamp(16px, 4vw, 30px) auto',
      backgroundColor: 'white',
      borderRadius: 'clamp(8px, 2vw, 16px)',
      padding: 'clamp(8px, 2vw, 15px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
    },
    buttonGroup: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 'clamp(16px, 4vw, 30px)',
      gap: 'clamp(8px, 2vw, 12px)',
    },
    button: {
      backgroundColor: '#ff5f7c',
      color: 'white',
      border: 'none',
      padding: 'clamp(10px, 2.5vw, 16px) clamp(16px, 4vw, 32px)',
      margin: '0',
      borderRadius: 'clamp(8px, 2vw, 12px)',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: 'clamp(13px, 3vw, 16px)',
      transition: 'all 0.2s ease',
      width: '100%',
      maxWidth: '280px',
      textAlign: 'center',
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(255, 95, 124, 0.3)',
    },
    periodList: {
      marginTop: 'clamp(24px, 5vw, 40px)',
      width: '100%',
    },
    periodItem: {
      backgroundColor: 'white',
      border: '1px solid #ffd1dc',
      borderLeft: '4px solid #ff5f7c',
      padding: 'clamp(12px, 3vw, 20px)',
      borderRadius: 'clamp(8px, 2vw, 16px)',
      margin: 'clamp(8px, 2vw, 16px) 0',
      width: '100%',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
    },
    periodHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 'clamp(8px, 2vw, 16px)',
      flexWrap: 'wrap',
      gap: 'clamp(6px, 1.5vw, 12px)',
    },
    periodMonth: {
      fontSize: 'clamp(14px, 3.5vw, 20px)',
      fontWeight: '600',
      color: '#333',
    },
    deleteButton: {
      backgroundColor: '#ffd1dc',
      color: '#ff5f7c',
      border: 'none',
      padding: 'clamp(6px, 1.5vw, 10px) clamp(10px, 2.5vw, 16px)',
      borderRadius: 'clamp(4px, 1vw, 8px)',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      fontSize: 'clamp(11px, 2.5vw, 14px)',
      flexShrink: 0,
    },
    periodDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(100px, 25vw, 150px), 1fr))',
      gap: 'clamp(6px, 1.5vw, 12px)',
    },
    detailItem: {
      backgroundColor: '#f8f9fa',
      padding: 'clamp(8px, 2vw, 14px)',
      borderRadius: 'clamp(4px, 1vw, 8px)',
    },
    detailLabel: {
      fontSize: 'clamp(10px, 2.5vw, 14px)',
      color: '#666',
      fontWeight: '500',
      marginBottom: '4px',
    },
    detailValue: {
      fontSize: 'clamp(12px, 3vw, 16px)',
      fontWeight: '600',
      color: '#333',
    },
    emptyState: {
      textAlign: 'center',
      padding: 'clamp(24px, 6vw, 40px) clamp(12px, 3vw, 20px)',
      color: '#666',
      fontSize: 'clamp(13px, 3vw, 18px)',
    },
    sectionTitle: {
      fontSize: 'clamp(16px, 4vw, 24px)',
      fontWeight: '700',
      color: '#333',
      marginBottom: 'clamp(14px, 3vw, 24px)',
      textAlign: 'center',
    },
  };

  const highlightDates = ({ date }) => {
    // Fix: Use consistent date formatting for comparison
    const dateString = formatDateString(date);
    
    // Check if this date is in the selected range
    if (selectedDates.includes(dateString)) {
      return 'highlight';
    }
    
    // Check if this date is part of any logged period
    const isInLoggedPeriod = periods.some(period => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      const currentDate = new Date(dateString);
      return currentDate >= start && currentDate <= end;
    });
    
    if (isInLoggedPeriod) {
      return 'logged-period';
    }
    
    return null;
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Period Tracker</h2>

        <div style={styles.calendarContainer}>
          <Calendar
            onClickDay={handleDayClick}
            tileClassName={highlightDates}
          />
        </div>

        <style>
          {`
            .highlight {
              background: #ffccde !important;
              border-radius: 8px !important;
              color: #000 !important;
              font-weight: 600 !important;
            }
            
            .logged-period {
              background: #ffe6f0 !important;
              border-radius: 8px !important;
              color: #ff5f7c !important;
              font-weight: 500 !important;
            }
            
            .react-calendar {
              width: 100% !important;
              border: none !important;
              font-family: inherit !important;
              font-size: clamp(11px, 2.8vw, 14px) !important;
            }
            
            .react-calendar__navigation {
              margin-bottom: 1em !important;
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
            }
            
            .react-calendar__navigation button {
              background: #f8f9fa !important;
              border: none !important;
              color: #666 !important;
              font-weight: 600 !important;
              padding: clamp(6px, 1.5vw, 12px) clamp(8px, 2vw, 16px) !important;
              border-radius: clamp(4px, 1vw, 8px) !important;
              transition: all 0.2s ease !important;
              min-height: clamp(28px, 7vw, 44px) !important;
              font-size: clamp(11px, 2.8vw, 14px) !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            
            .react-calendar__navigation button:hover {
              background: #e9ecef !important;
              transform: scale(1.05) !important;
            }
            
            .react-calendar__navigation__label {
              font-size: clamp(12px, 3vw, 18px) !important;
              font-weight: 600 !important;
              flex: 1 !important;
              text-align: center !important;
            }
            
            .react-calendar__month-view__weekdays {
              font-weight: 600 !important;
              color: #666 !important;
              font-size: clamp(9px, 2.2vw, 12px) !important;
              padding: clamp(4px, 1vw, 12px) 0 !important;
              text-align: center !important;
            }
            
            .react-calendar__month-view__weekdays__weekday {
              padding: clamp(2px, 0.5vw, 8px) !important;
              text-align: center !important;
            }
            
            .react-calendar__tile {
              background: transparent !important;
              border: none !important;
              padding: clamp(4px, 1vw, 10px) !important;
              border-radius: clamp(4px, 1vw, 8px) !important;
              transition: all 0.2s ease !important;
              font-weight: 500 !important;
              font-size: clamp(10px, 2.5vw, 14px) !important;
              min-height: clamp(28px, 7vw, 44px) !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              margin: 1px !important;
            }
            
            .react-calendar__tile:hover {
              background: #f8f9fa !important;
              transform: scale(1.05) !important;
            }
            
            .react-calendar__tile--now {
              background: #e3f2fd !important;
              color: #1976d2 !important;
              font-weight: 600 !important;
            }
            
            .react-calendar__tile--active {
              background: #ff5f7c !important;
              color: white !important;
            }
            
            .react-calendar__month-view__days {
              margin-top: clamp(6px, 1.5vw, 12px) !important;
              display: grid !important;
              grid-template-columns: repeat(7, 1fr) !important;
              gap: 1px !important;
            }
            
            /* Enhanced Mobile Responsiveness */
            @media (max-width: 320px) {
              .react-calendar__tile {
                min-height: 24px !important;
                font-size: 9px !important;
                padding: 2px !important;
              }
              
              .react-calendar__navigation button {
                min-height: 28px !important;
                padding: 4px 6px !important;
                font-size: 10px !important;
              }
              
              .react-calendar__navigation__label {
                font-size: 11px !important;
              }
              
              .react-calendar__month-view__weekdays {
                font-size: 8px !important;
              }
            }
            
            @media (max-width: 480px) {
              .react-calendar__navigation {
                margin-bottom: 0.5em !important;
              }
              
              .react-calendar__tile {
                min-height: 28px !important;
                font-size: 10px !important;
                padding: 4px 2px !important;
              }
              
              .react-calendar__navigation button {
                min-height: 32px !important;
                padding: 6px 8px !important;
                font-size: 11px !important;
              }
              
              .react-calendar__navigation__label {
                font-size: 12px !important;
              }
              
              .react-calendar__month-view__weekdays {
                font-size: 9px !important;
                padding: 4px 0 !important;
              }
            }
            
            @media (min-width: 481px) and (max-width: 768px) {
              .react-calendar__tile {
                min-height: 32px !important;
                padding: 6px 4px !important;
                font-size: 12px !important;
              }
              
              .react-calendar__navigation button {
                min-height: 36px !important;
                padding: 8px 12px !important;
                font-size: 12px !important;
              }
              
              .react-calendar__navigation__label {
                font-size: 14px !important;
              }
            }
            
            @media (min-width: 769px) {
              .react-calendar__navigation button {
                padding: 12px 16px !important;
                font-size: 14px !important;
              }
              
              .react-calendar__tile {
                padding: 10px !important;
                min-height: 40px !important;
                font-size: 13px !important;
              }
              
              .react-calendar__navigation__label {
                font-size: 16px !important;
              }
            }
            
            /* Button group responsive */
            @media (min-width: 640px) {
              .button-group-responsive {
                flex-direction: row !important;
                gap: clamp(12px, 3vw, 20px) !important;
              }
              
              .button-group-responsive button {
                max-width: 200px !important;
                flex: 1 !important;
              }
            }
            
            /* Period list mobile improvements */
            @media (max-width: 480px) {
              .period-details-mobile {
                grid-template-columns: 1fr !important;
                gap: 6px !important;
              }
              
              .period-header-mobile {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
              }
              
              .period-header-mobile button {
                align-self: flex-end !important;
              }
            }
          `}
        </style>

        <div 
          className="button-group-responsive"
          style={styles.buttonGroup}
        >
          <button 
            onClick={logPeriod} 
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 95, 124, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Log Period
          </button>
          <button 
            onClick={() => navigate('/')} 
            style={{...styles.button, backgroundColor: '#f8f9fa', color: '#666'}}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.backgroundColor = '#e9ecef';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.backgroundColor = '#f8f9fa';
            }}
          >
            Go Back Home
          </button>
        </div>

        <div style={styles.periodList}>
          <h3 style={styles.sectionTitle}>Period History</h3>
          {periods.length === 0 ? (
            <div style={styles.emptyState}>
              No periods logged yet. Start tracking your cycle!
            </div>
          ) : (
            periods.map((item, index) => (
              <div 
                key={index} 
                style={styles.periodItem}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                }}
              >
                <div 
                  className="period-header-mobile"
                  style={styles.periodHeader}
                >
                  <span style={styles.periodMonth}>{item.month}</span>
                  <button 
                    onClick={() => deletePeriod(index)} 
                    style={styles.deleteButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#ffb3c1';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#ffd1dc';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    Delete
                  </button>
                </div>
                
                <div 
                  className="period-details-mobile"
                  style={styles.periodDetails}
                >
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Start Date</div>
                    <div style={styles.detailValue}>{item.startDate}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>End Date</div>
                    <div style={styles.detailValue}>{item.endDate}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Duration</div>
                    <div style={styles.detailValue}>{item.numberOfDays} days</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}