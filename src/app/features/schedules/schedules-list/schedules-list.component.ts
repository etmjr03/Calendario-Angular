import { ScheduleService } from './../schedule.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CalendarView, CalendarEvent } from 'angular-calendar';
import { MonthViewDay } from 'calendar-utils';
import { isSameDay, isSameMonth, parse, parseISO } from 'date-fns';
import { Schedule } from '../schedule';

@Component({
  selector: 'app-schedules-list',
  templateUrl: './schedules-list.component.html',
  styleUrls: ['./schedules-list.component.css']
})
export class SchedulesListComponent implements OnInit {

  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;

  CalendarView = CalendarView;
  viewDate = new Date();
  activeDayIsOpen = false;
  view = CalendarView.Month;
  events: CalendarEvent[] = [];

  modalData!: { schedule: Schedule };

  constructor(
    private ScheduleService: ScheduleService
  ) { }

  ngOnInit(): void {
    this.loadSchedules();
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeActiveDay() {
    this.activeDayIsOpen = false;
  }

  onDayClick({ date, events }: MonthViewDay) {
    if (isSameMonth(date, this.viewDate)) {
      if (events.length === 0 || (isSameDay(this.viewDate, date) && this.activeDayIsOpen)) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }

      this.viewDate = date;
    }
  }

  private buildEvents(schedule: Schedule) {
    const parsedDate = parseISO(schedule.date)
    const event: CalendarEvent = {
      title: schedule.title,
      start: parse(schedule.initTime, 'HH:mm', parsedDate),
      end: parse(schedule.endTime, 'HH:mm', parsedDate),
      cssClass: 'event.-body',
      color: {
        primary: 'var(--purple)',
        secondary: 'var(--bg-prple-alpha)'
      }
    }
    return event;
  }

  private loadSchedules() {
    this.ScheduleService.findAll().subscribe(response => {
      this.events = response.map(schedule => this.buildEvents(schedule));
    });
  }

}
