fullcalendar-resource
=====================
Adds day view with resource columns to FullCalendar

* Usage
```javascript
	$("#mycalendar").fullCalendar({
		timezone: "local",
		views: {
			resourceAgendaDay: {
				type: "resourceAgenda",
				duration: {
					days: 1
				},
				buttonText: "Resource by Day"
			}
		},
		defaultView: "resourceAgendaDay",
		eventsSource: myEventSource, // Add the resource id to event.resource as number/string
		allDaySlot: false, // Not supported yet
		unknownResourceTitle: "Others",
		resources: [
			{id: "room101", name: "Room 101"},
			{id: "room102", name: "Room 102"},
			{id: "room201", name: "Room 201"},
			{id: "room301", name: "Room 301"},
			{id: "room401", name: "Room 401"},
			{id: "room707", name: "Room 707"}
		],
	});
```
