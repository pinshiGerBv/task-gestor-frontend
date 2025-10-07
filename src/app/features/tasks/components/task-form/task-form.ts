import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TasksService, SharedDataService } from '../../../../core/services/task';
import Swal from 'sweetalert2';
import { Task, TaskStatus, TaskPriority } from '../../../../core/models/task.model';
import { Subscription } from 'rxjs';

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
  
  currentTaskId: number | null = null; // VARIABLE PARA ALMACENAR EL ID
  private taskIdSubscription?: Subscription;

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
    private taskService: TasksService, 
    private cdr: ChangeDetectorRef,
    private sharedData: SharedDataService // INYECTAR EL SERVICIO
  ) {}

  ngOnInit() {
    // Verificar si ya existe un ID guardado en SharedDataService
    const initialTaskId = this.sharedData.getTaskId();
    if (initialTaskId !== null) {
      this.currentTaskId = initialTaskId;
      console.log('ID recibido en task-form desde SharedDataService:', initialTaskId);
      this.loadTaskData(initialTaskId); // Cargar datos si el ID es válido
    }

    // Suscribirse para recibir actualizaciones del taskId
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
      this.taskIdSubscription.unsubscribe(); // Limpiar la suscripción al destruir el componente
    }
  }

  // Método para cargar los datos de la tarea
  async loadTaskData(id: number): Promise<void> {
    try {
      const taskData = await this.taskService.getTaskById(id);
      if (taskData) {
        this.task = { ...taskData };
        console.log('Datos de tarea cargados:', this.task);
        this.cdr.detectChanges(); // Actualizar la vista
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

  // Actualizar tarea usando el ID recibido
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
      this.sharedData.clearTaskId(); // Limpiar el ID después de actualizar
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      Swal.fire('Error', 'No se pudo actualizar la tarea', 'error');
    }
  }

  // Método de envío para crear una nueva tarea
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
        
        this.transformDisplay();
        this.resetForm();
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error al enviar la tarea:', error);
        Swal.fire('Error', 'No se pudo crear la tarea', 'error');
      }
    }
  }
}
