example return object route calender-adapter/calender/todaysAppointments

{ title: 'Calendar',
  active: { calendar: true },
  user: 'Lastname, Firstname',
  events:
   [ { '@odata.etag': 'W/" "',
        id: 'someCalenderEntryId',
        subject: 'Theorie Phase VI',
        start: { dateTime: '2019-02-11T00:00:00.0000000', timeZone: 'UTC' },
        end: { dateTime: '2019-05-06T00:00:00.0000000', timeZone: 'UTC' },
        location: { 
            displayName: 'DHBW Stuttgart',
            locationType: 'default',
            uniqueId: 'DHBW Stuttgart',
            uniqueIdType: 'private' 
        } 
    } ] 
}