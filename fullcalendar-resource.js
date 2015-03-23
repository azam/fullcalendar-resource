/*!
 * fullcalendar-resource
 * (c) 2015 Azamshul Azizy
 * https://github.com/azam/fullcalendar-resource/
 *
 * Extends:
 *
 * FullCalendar v2.3.0
 * Docs & License: http://arshaw.com/fullcalendar/
 * (c) 2013 Adam Shaw
 */
(function(factory) {
	if (typeof define === "function" && define.amd) { // AMD/RequireJS
		define(["jquery", "moment"], factory);
	} else if (typeof exports === "object") { // Node/CommonJS
		module.exports = factory(require("jquery"), require("moment"));
	} else {
		factory(jQuery, moment);
	}
})(function($, moment) {
	var silent = false;
	var fc = $.fullCalendar;
	// Extend AgendaView
	// Ref: http://fullcalendar.io/docs/views/Custom_Views/
	fc.views.resourceAgenda = fc.views.agenda.extend({
		resources: null, // resource map array: [{id, name},{id, name}, ..., {id, name} ]
		resourceSource: null, // function([resourceId]) , must return a resource map // TODO: pass a callback function
		unknownResourceTitle: "Others",
		widgetResourceHeaderClass: "resource",
		widgetUnknownResourceHeaderClass: "unknown-resource",
		resourceSorter: function(l, r) {
			if (typeof(l) === "object" && l !== null && typeof(l.id) !== "undefined" && typeof(r) === "object" && r !== null && typeof(r.id) !== "undefined") {
				if (l.id < r.id) return -1;
				if (l.id > r.id) return 1;
				return 0;
			}
			if (typeof(l) === "object" && l !== null && typeof(l.id) !== "undefined") return 1;
			if (typeof(r) === "object" && r !== null && typeof(r.id) !== "undefined") return -1;
			return 1;
		},
		initialize: function() {
			// called once when the view is instantiated, when the user switches to the view.
			// initialize member variables or do other setup tasks.
			silent || console.log("ResourceAgenda#initialize");
			this.resources = this.opt("resources");
			fc.views.agenda.prototype.initialize.apply(this, arguments); // super
			// TODO: Override DayGrid
			// START: Override timeGrid
			this.timeGrid.dayIDs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']; // CUSTOM: from util.js
			// Initializes row/col information
			this.timeGrid.updateCells = function() {
				var view = this.view;
				var colData = [];
				var date;
				date = this.start.clone();
				while (date.isBefore(this.end)) {
					colData.push({
						day: date.clone()
					});
					date.add(1, 'day');
					date = view.skipHiddenDays(date);
				}
				if (this.isRTL) {
					colData.reverse();
				}
				// Only add resource object when colData.length = 1 (day view)
				// TODO: what if day = 1 but not resource day? ie, every monday
				if (colData.length === 1 && typeof(this.view.resources) === "object" && this.view.resources !== null && this.view.resources instanceof Array) { // CUSTOM
					// TODO: check for duplicate ID?
					colData[0].resource = null; // Unknown
					this.view.resources.forEach(function(r) {
						var cd = {
							day: colData[0].day,
							resource: {
								id: r.id,
								name: r.name
							}
						};
						colData.push(cd);
					});
				}
				this.colData = colData;
				this.colCnt = colData.length;
				this.rowCnt = Math.ceil((this.maxTime - this.minTime) / this.snapDuration); // # of vertical snaps
			};
			// Used by the `headHtml` method, via RowRenderer, for rendering the HTML of a day-of-week header cell
			// TODO: move to another class. not applicable to all Grids
			this.timeGrid.headCellHtml = function(cell) {
				var view = this.view;
				var date = cell.start;
				if (typeof(cell.resource) === "object") {
					if (cell.resource === null) { // unknown
						return '' +
							'<th class="fc-day-header ' + view.widgetHeaderClass + ' fc-' + this.dayIDs[date.day()] + ' fc-' + view.widgetResourceHeaderClass + ' fc-' + view.widgetUnknownResourceHeaderClass + '">' +
							fc.htmlEscape(view.unknownResourceTitle) +
							' </th>';
					}
					return '' +
						'<th class="fc-day-header ' + view.widgetHeaderClass + ' fc-' + this.dayIDs[date.day()] + ' fc-' + view.widgetResourceHeaderClass + '">' +
						fc.htmlEscape(cell.resource.name) +
						' </th>';
				}
				return '' +
					'<th class="fc-day-header ' + view.widgetHeaderClass + ' fc-' + this.dayIDs[date.day()] + '">' +
					fc.htmlEscape(date.format(this.colHeadFormat)) +
					' </th>';
			};
			// Slices up a date range by column into an array of segments
			this.timeGrid.rangeToSegs = function(range) {
				var colCnt = this.colCnt;
				var segs = [];
				var seg;
				var col;
				var colDate;
				var colRange;
				// normalize :(
				range = {
					start: range.start.clone().stripZone(),
					end: range.end.clone().stripZone(),
					resource: (range.event.resource) ? range.event.resource : null
				};
				var colResMap = {};
				var unknownsCols = []; // Always one element
				for (col = 0; col < colCnt; col++) {
					if (typeof(this.colData[col].resource) === "object") {
						if (this.colData[col].resource === null) {
							unknownsCols.push(col);
						} else if (typeof(this.colData[col].resource.id) === "number" || typeof(this.colData[col].resource.id) === "string") {
							colResMap[this.colData[col].resource.id] = col;
						}
					}
				};
				for (col = 0; col < colCnt; col++) {
					colDate = this.colData[col].day; // will be ambig time/timezone
					colRange = {
						start: colDate.clone().time(this.minTime),
						end: colDate.clone().time(this.maxTime)
					};
					seg = fc.intersectionToSeg(range, colRange); // both will be ambig timezone
					if (seg) {
						// CUSTOM
						if (typeof(this.colData[col].resource) === "object") {
							if (this.colData[col].resource !== null) {
								if (range.resource === this.colData[col].resource.id) {
									seg.col = col;
									segs.push(seg);
								}
							} else if(range.resource !== null && typeof(colResMap[range.resource]) !== "undefined") {
								// This range belongs in other col
							} else {
								for(var j = 0; j < unknownsCols.length; j++) {
									seg.col = unknownsCols[j];
									segs.push(seg);
								}
							}
						} else {
							seg.col = col;
							segs.push(seg);
						}
					}
				}
				return segs;
			};
			// END: Override timeGrid
		},
		render: function() {
			// responsible for displaying the skeleton of the view within the already-defined
			// this.el, a jQuery element.
			silent || console.log("ResourceAgenda#render");
			fc.views.agenda.prototype.render.apply(this, arguments); // super
		},
		setHeight: function(height, isAuto) {
			// responsible for adjusting the pixel-height of the view. if isAuto is true, the
			// view may be its natural height, and `height` becomes merely a suggestion.
			silent || console.log("ResourceAgenda#setHeight");
			fc.views.agenda.prototype.setHeight.apply(this, arguments);
		},
		renderEvents: function(events) {
			// reponsible for rendering the given Event Objects
			silent || console.log("ResourceAgenda#renderEvents");
			fc.views.agenda.prototype.renderEvents.apply(this, arguments);
		},
		destroyEvents: function() {
			// responsible for undoing everything in renderEvents
			silent || console.log("ResourceAgenda#destroyEvents");
			fc.views.agenda.prototype.destroyEvents.apply(this, arguments);
		},
		renderSelection: function(range) {
			// accepts a {start,end} object made of Moments, and must render the selection
			silent || console.log("ResourceAgenda#renderSelection");
			fc.views.agenda.prototype.renderSelection.apply(this, arguments);
		},
		destroySelection: function() {
			// responsible for undoing everything in renderSelection
			silent || console.log("ResourceAgenda#destroySelection");
			fc.views.agenda.prototype.destroy.apply(this, arguments);
		}
	});
	return fc; // export for Node/CommonJS
});

