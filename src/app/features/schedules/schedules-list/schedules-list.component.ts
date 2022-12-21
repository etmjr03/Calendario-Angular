import { Router } from '@angular/router';
import { ScheduleService } from './../schedule.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CalendarView, CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { MonthViewDay } from 'calendar-utils';
import { isSameDay, isSameMonth, parse, parseISO } from 'date-fns';
import { Schedule } from '../schedule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
    private router: Router,
    private modal: NgbModal,
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

  onEventClick(event: CalendarEvent) {
    this.modalData = {
      schedule: event.meta
    }
    
    this.modal.open(this.modalContent, {
      size: 'md',
    })
  }

  private buildEventActions(schedule: Schedule) {
    const events: CalendarEventAction[] = [];

    events.push({
      label: '<i class="fa-solid fa-pencil text-purple mx-1"></i>',
      onClick: (): void => {
        this.router.navigate(['schedules', schedule.id])
      }
    });

    events.push({
      label: '<i class="fa-solid fa-trash text-purple mx-1"></i>',
      onClick: (): void => {
        this.ScheduleService.delete(schedule.id).subscribe(() => {
          this.loadSchedules();
          this.closeActiveDay();
        });
      }
    });

    return events;
  }

  private buildEvents(schedule: Schedule) {
    const parsedDate = parseISO(schedule.date)
    const event: CalendarEvent = {
      title: schedule.title,
      start: parse(schedule.initTime, 'HH:mm', parsedDate),
      end: parse(schedule.endTime, 'HH:mm', parsedDate),
      actions: this.buildEventActions(schedule),
      cssClass: 'event-body',
      color: {
        primary: 'var(--purple)',
        secondary: 'var(--bg-prple-alpha)'
      },
      meta: schedule
    }
    return event;
  }

  private loadSchedules() {
    this.ScheduleService.findAll().subscribe(response => {
      this.events = response.map(schedule => this.buildEvents(schedule));
    });
  }

}
