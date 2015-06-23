fullcalendar-resource
=====================
Adds day view with resource columns to FullCalendar

* Working example: [JSFiddle](http://jsfiddle.net/azamshul/k0jgugL9/)
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
* TODO:
  * Support all-day/cross-day events
  * Support event dragging across resource
  * Support for newer FullCalendar version (broken for 2.3.2)
