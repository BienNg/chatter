// Holiday data for Vietnam and Germany
export const HOLIDAYS = {
  VN: {
    2024: [
      '2024-01-01', // New Year's Day
      '2024-02-08', // Lunar New Year's Eve
      '2024-02-09', // Lunar New Year Day 1
      '2024-02-10', // Lunar New Year Day 2
      '2024-02-11', // Lunar New Year Day 3
      '2024-02-12', // Lunar New Year Day 4
      '2024-02-13', // Lunar New Year Day 5
      '2024-04-18', // Hung Kings' Festival
      '2024-04-30', // Liberation Day
      '2024-05-01', // International Labor Day
      '2024-09-02', // National Day
    ],
    2025: [
      '2025-01-01', // New Year's Day
      '2025-01-28', // Lunar New Year's Eve
      '2025-01-29', // Lunar New Year Day 1
      '2025-01-30', // Lunar New Year Day 2
      '2025-01-31', // Lunar New Year Day 3
      '2025-02-01', // Lunar New Year Day 4
      '2025-02-02', // Lunar New Year Day 5
      '2025-04-06', // Hung Kings' Festival
      '2025-04-30', // Liberation Day
      '2025-05-01', // International Labor Day
      '2025-09-02', // National Day
    ],
    2026: [
      '2026-01-01', // New Year's Day
      '2026-02-16', // Lunar New Year's Eve
      '2026-02-17', // Lunar New Year Day 1
      '2026-02-18', // Lunar New Year Day 2
      '2026-02-19', // Lunar New Year Day 3
      '2026-02-20', // Lunar New Year Day 4
      '2026-02-21', // Lunar New Year Day 5
      '2026-04-25', // Hung Kings' Festival
      '2026-04-30', // Liberation Day
      '2026-05-01', // International Labor Day
      '2026-09-02', // National Day
    ]
  },
  DE: {
    2024: [
      '2024-01-01', // New Year's Day
      '2024-03-29', // Good Friday
      '2024-04-01', // Easter Monday
      '2024-05-01', // Labor Day
      '2024-05-09', // Ascension Day
      '2024-05-20', // Whit Monday
      '2024-10-03', // German Unity Day
      '2024-12-25', // Christmas Day
      '2024-12-26', // Boxing Day
    ],
    2025: [
      '2025-01-01', // New Year's Day
      '2025-04-18', // Good Friday
      '2025-04-21', // Easter Monday
      '2025-05-01', // Labor Day
      '2025-05-29', // Ascension Day
      '2025-06-09', // Whit Monday
      '2025-10-03', // German Unity Day
      '2025-12-25', // Christmas Day
      '2025-12-26', // Boxing Day
    ],
    2026: [
      '2026-01-01', // New Year's Day
      '2026-04-03', // Good Friday
      '2026-04-06', // Easter Monday
      '2026-05-01', // Labor Day
      '2026-05-14', // Ascension Day
      '2026-05-25', // Whit Monday
      '2026-10-03', // German Unity Day
      '2026-12-25', // Christmas Day
      '2026-12-26', // Boxing Day
    ]
  }
};

// Convert weekday keys to JavaScript day numbers
const WEEKDAY_MAP = {
  'Sun': 0,
  'Mon': 1,
  'Tue': 2,
  'Wed': 3,
  'Thu': 4,
  'Fri': 5,
  'Sat': 6
};

/**
 * Calculate the end date for a course based on start date, total days, weekdays, and holidays
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {number} totalDays - Total number of course days
 * @param {string[]} weekdays - Array of weekday keys (e.g., ['Mon', 'Wed', 'Fri'])
 * @param {string} location - Location code ('VN' or 'DE')
 * @returns {Object} - { endDate: string, skippedHolidays: string[] }
 */
export const calculateEndDate = (startDate, totalDays, weekdays, location) => {
  if (!startDate || !totalDays || !weekdays.length || !location) {
    return { endDate: null, skippedHolidays: [] };
  }

  const start = new Date(startDate);
  const targetWeekdays = weekdays.map(day => WEEKDAY_MAP[day]);
  const skippedHolidays = [];
  
  // Get holidays for the location and relevant years
  const startYear = start.getFullYear();
  const endYear = startYear + 2; // Look ahead 2 years to be safe
  const holidays = new Set();
  
  for (let year = startYear; year <= endYear; year++) {
    if (HOLIDAYS[location] && HOLIDAYS[location][year]) {
      HOLIDAYS[location][year].forEach(holiday => holidays.add(holiday));
    }
  }

  let currentDate = new Date(start);
  let courseDaysCompleted = 0;

  // Start the loop and check each day
  while (courseDaysCompleted < totalDays) {
    // Check if this day is a course day
    if (targetWeekdays.includes(currentDate.getDay())) {
      const dateString = formatDate(currentDate);
      
      // Check if it's a holiday
      if (holidays.has(dateString)) {
        skippedHolidays.push(dateString);
      } else {
        courseDaysCompleted++;
        
        // If we've reached the total days, this is our end date
        if (courseDaysCompleted === totalDays) {
          return {
            endDate: formatDate(currentDate),
            skippedHolidays
          };
        }
      }
    }
    
    // Move to the next day only if we haven't found the end date yet
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // This should never be reached, but just in case
  return {
    endDate: formatDate(currentDate),
    skippedHolidays
  };
};

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date 
 * @returns {string}
 */
const formatDate = (date) => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

/**
 * Get holiday names for display
 * @param {string[]} holidayDates - Array of holiday dates in YYYY-MM-DD format
 * @param {string} location - Location code ('VN' or 'DE')
 * @returns {string[]} - Array of holiday names
 */
export const getHolidayNames = (holidayDates, location) => {
  const holidayNames = {
    VN: {
      '01-01': 'New Year\'s Day',
      '02-08': 'Lunar New Year\'s Eve',
      '02-09': 'Lunar New Year Day 1',
      '02-10': 'Lunar New Year Day 2',
      '02-11': 'Lunar New Year Day 3',
      '02-12': 'Lunar New Year Day 4',
      '02-13': 'Lunar New Year Day 5',
      '01-28': 'Lunar New Year\'s Eve',
      '01-29': 'Lunar New Year Day 1',
      '01-30': 'Lunar New Year Day 2',
      '01-31': 'Lunar New Year Day 3',
      '02-01': 'Lunar New Year Day 4',
      '02-02': 'Lunar New Year Day 5',
      '02-16': 'Lunar New Year\'s Eve',
      '02-17': 'Lunar New Year Day 1',
      '02-18': 'Lunar New Year Day 2',
      '02-19': 'Lunar New Year Day 3',
      '02-20': 'Lunar New Year Day 4',
      '02-21': 'Lunar New Year Day 5',
      '04-18': 'Hung Kings\' Festival',
      '04-06': 'Hung Kings\' Festival',
      '04-25': 'Hung Kings\' Festival',
      '04-30': 'Liberation Day',
      '05-01': 'International Labor Day',
      '09-02': 'National Day'
    },
    DE: {
      '01-01': 'New Year\'s Day',
      '03-29': 'Good Friday',
      '04-01': 'Easter Monday',
      '04-18': 'Good Friday',
      '04-21': 'Easter Monday',
      '04-03': 'Good Friday',
      '04-06': 'Easter Monday',
      '05-01': 'Labor Day',
      '05-09': 'Ascension Day',
      '05-20': 'Whit Monday',
      '05-29': 'Ascension Day',
      '06-09': 'Whit Monday',
      '05-14': 'Ascension Day',
      '05-25': 'Whit Monday',
      '10-03': 'German Unity Day',
      '12-25': 'Christmas Day',
      '12-26': 'Boxing Day'
    }
  };

  return holidayDates.map(date => {
    const monthDay = date.substring(5); // Get MM-DD part
    const name = holidayNames[location]?.[monthDay];
    return name ? `${name} (${date})` : date;
  });
}; 