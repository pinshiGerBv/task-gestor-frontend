import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksService } from '../../../../core/services/task';
import { ChangeDetectorRef } from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,        
  imports: [CommonModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css'],
  encapsulation: ViewEncapsulation.None
})
export class TaskList  {
  tasks: Task[] = [];

  constructor(private tasksService: TasksService, private cdr: ChangeDetectorRef) {}

  async deleteTask(id: number): Promise<void> {
    try {
      await this.tasksService.deleteTaskById(id); 
      this.tasks = this.tasks.filter(task => task.id !== id);
      this.cdr.detectChanges();
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
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  ngOnInit() {
    this.insertList();
  }

  insertList() {
    this.tasksService.getAllTasks().then(data => {
      this.tasks = data;
      console.log("PRIORITY", this.tasks.map(task => task.priority));
      this.cdr.detectChanges();
    });
  }

  transformDisplayUpdate() {
  const form = document.getElementsByTagName("form")[1];
  form.style.display = (form.style.display === 'none') ? 'block' : 'none';
  this.cdr.detectChanges();
  }

}
