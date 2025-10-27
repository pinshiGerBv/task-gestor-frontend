import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { APIService, SharedDataService } from '../../../../core/services/task';
import Swal from 'sweetalert2';
import { Task, TaskStatus, TaskPriority } from '../../../../core/models/task.model';
import { Subscription } from 'rxjs';
import { TaskDashboard } from '../task-dashboard/task-dashboard';
import { Input } from '@angular/core';
@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.css']
})
export class TaskForm implements OnInit, OnDestroy {
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  
  currentTaskId: number | null = null;
  private taskIdSubscription?: Subscription;
  
  @Input() tasks: Task[] = [];
  task: Task = {
    id: 0,
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor(
    private taskService: APIService,
    private cdr: ChangeDetectorRef,
    private sharedData: SharedDataService
  ) {}

  ngOnInit() {
    const initialTaskId = this.sharedData.getTaskId();
    if (initialTaskId !== null) {
      this.currentTaskId = initialTaskId;
      console.log('ID recibido en task-form desde SharedDataService:', initialTaskId);
      this.loadTaskData(initialTaskId);
    }

    this.taskIdSubscription = this.sharedData.taskId$.subscribe(taskId => {
      if (taskId !== null) {
        this.currentTaskId = taskId;
        console.log('ID recibido en task-form a través del Observable:', taskId);
        this.loadTaskData(taskId);
      }
    });
  }

  ngOnDestroy() {
    if (this.taskIdSubscription) {
      this.taskIdSubscription.unsubscribe();
    }
  }

  async loadTaskData(id: number): Promise<void> {
    try {
      const taskData = await this.taskService.getTaskById(id);
      if (taskData) {
        this.task = { ...taskData };
        console.log('Datos de tarea cargados:', this.task);
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error al cargar tarea:', error);
      Swal.fire('Error', 'No se pudo cargar la tarea', 'error');
    }
  }

  resetForm() {
    this.task = {
      id: 0,
      title: '',
      description: '',
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.currentTaskId = null;
    this.cdr.detectChanges();
  }

  transformDisplay() {
    const form = document.getElementsByTagName('form')[0];
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    this.cdr.detectChanges();
  }

  transformDisplayUpdate() {
    const form = document.getElementsByTagName('form')[1];
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    this.cdr.detectChanges();
  }

  submitTask() {
    this.submit(this.task);
    this.cdr.detectChanges();
  }

  async updateTask(): Promise<void> {
    if (!this.currentTaskId) {
      Swal.fire('Error', 'No hay tarea seleccionada', 'warning');
      return;
    }

    try {
      await this.taskService.updateTask(this.currentTaskId, this.task);
      Swal.fire({
        title: 'Tarea Actualizada',
        text: 'La tarea ha sido actualizada correctamente!',
        icon: 'success',
        timer: 1500
      });
      this.transformDisplayUpdate();
      this.resetForm();
      this.sharedData.clearTaskId();
      this.sharedData.triggerAnimation();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      Swal.fire('Error', 'No se pudo actualizar la tarea', 'error');
    }
  }

  private async submit(task: any) {
    if (this.taskService.isEmpty(this.task.title) && this.taskService.isEmpty(this.task.description)) {
      Swal.fire({
        title: 'Error al enviar',
        text: 'El título y la descripción de la tarea están vacíos',
        icon: 'warning',
        timer: 1000
      });
    } else if (this.taskService.isEmpty(this.task.title)) {
      Swal.fire({
        title: 'Error al enviar',
        text: 'El título de la tarea está vacío',
        icon: 'warning',
        timer: 1000
      });
    } else if (this.taskService.isEmpty(this.task.description)) {
      Swal.fire({
        title: 'Error al enviar',
        text: 'La descripción de la tarea está vacía',
        icon: 'warning',
        timer: 1000
      });
    } else {
      try {
        await this.taskService.createTask(task);
        Swal.fire({
          title: 'Tarea Enviada',
          text: 'La tarea ha sido enviada correctamente!',
          icon: 'success',
          timer: 1000
        });
        this.sharedData.notifyTaskUpdate();
        this.taskService.solicitarRecarga();
        this.transformDisplay();
        this.resetForm();
        this.sharedData.triggerAnimation();
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error al enviar la tarea:', error);
        Swal.fire('Error', 'No se pudo crear la tarea', 'error');
      }
    }
  }


}
