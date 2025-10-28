import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskDashboard } from '../../components/task-dashboard/task-dashboard';
import { TaskForm } from '../../components/task-form/task-form';
import { APIService } from '../../../../core/services/task';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, TaskDashboard, TaskForm],
  templateUrl: './tasks-page.html',
})
export class TasksPageComponent {
  tasks = signal<any[]>([]); 
  error = signal<string>('');  

  constructor(private tasksService: APIService) {}

  async loadAllTasks(): Promise<void> {
    try {
      const tasks = await this.tasksService.getAllTasks();
      this.tasks.set(tasks);
      console.log(tasks);
    } catch (err) {
      this.error.set('Tasks Not Found');
      console.error('Error al obtener las tareas:', err);
    }
  }

  async loadAllTasksByStatusPending(): Promise<void> {
    try {
      const tasksp = await this.tasksService.getPendingTasks();
      this.tasks.set(tasksp);
      console.log(tasksp);
    } catch (err) {
      this.error.set('Tasks Not Found or 0');
      console.error('Error al obtener las tareas:', err);
    }
  }

  async loadAllTasksByStatusCompleted(): Promise<void> {
    try {
      const tasksc = await this.tasksService.getCompletedTasks();
      this.tasks.set(tasksc);
      console.log(tasksc);
    } catch (err) {
      this.error.set('Tasks Not Found or 0');
      console.error('Error al obtener las tareas:', err);
    }
  }

  async loadAllTasksByStatusInProgress(): Promise<void> {
    try {
      const tasksi = await this.tasksService.getInProgressTasks();
      this.tasks.set(tasksi);
      console.log(tasksi);
    } catch (err) {
      this.error.set('Tasks Not Found or 0');
      console.error('Error fetching the task:', err);
    }
  }

  async getTaskById(taskId: number): Promise<void> {
    try {
      const task = await this.tasksService.getTaskById(taskId);
      console.log('Task found:', task);
    } catch (err) {
      this.error.set('Task Not Found');
      console.error('Error fetching the task:', err);
    }
  }

  ngOnInit(): void {
    this.loadAllTasks();
    this.loadAllTasksByStatusPending();
    this.loadAllTasksByStatusCompleted();
    this.loadAllTasksByStatusInProgress();
    this.getTaskById(1);
    console.log('tareas cargadas');
  }
}
