import { Component, Input, ViewEncapsulation, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APIService, SharedDataService } from '../../../../core/services/task';
import { Task, TaskPriority, TaskStatus } from '../../../../core/models/task.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css'],
  encapsulation: ViewEncapsulation.None
})
export class TaskList implements OnInit {

  @Input() tasks: Task[] = [];

  constructor(
    private tasksService: APIService,
    private cdr: ChangeDetectorRef,
    private sharedDataService: SharedDataService
  ) {}

  ngOnInit() {
    if (!this.tasks || this.tasks.length === 0) {
      this.insertList();
    }

    this.sharedDataService.taskUpdated$.subscribe(updated => {
      if (updated) {
        this.insertList();
      }
    });
  }

  insertList() {
    this.tasksService.getAllTasks().then(data => {
      this.tasks = data;
      this.cdr.detectChanges();
    });
  }

  async deleteTask(id: number): Promise<void> {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await this.tasksService.deleteTaskById(id);
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.cdr.detectChanges();

        Swal.fire('Deleted!', 'Your task has been deleted.', 'success'); 
        this.sharedDataService.triggerAnimation();
        this.sharedDataService.notifyTaskUpdate();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async updateTask(
    id: number,
    updatedTask: Partial<{
      id: number;
      title: string;
      description: string;
      priority: TaskPriority;
      status: TaskStatus;
    }>
  ): Promise<void> {
    try {
      const updated = await this.tasksService.updateTask(id, updatedTask);
      const index = this.tasks.findIndex(task => task.id === id);
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...updated };
        this.cdr.detectChanges();
        this.sharedDataService.notifyTaskUpdate();
        this.sharedDataService.triggerAnimation();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  TaskOnClick(taskIdUpdated: number): void {
    this.sharedDataService.setTaskId(taskIdUpdated);
    console.log('Exported Task ID:', taskIdUpdated);

    const form = document.getElementsByTagName("form")[1];
    if (form) {
      form.style.display = (form.style.display === 'none') ? 'block' : 'none';
    }

    this.cdr.detectChanges();
  }
}
