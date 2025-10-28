import { Component, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../../core/services/State.service';
import { Task, TaskPriority, TaskStatus } from '../../../../core/models/task.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskList implements OnInit {

  TaskPriority = TaskPriority;
  TaskStatus = TaskStatus;

  // ✅ Computed signal para tareas filtradas
  tasks = computed(() => this.state.filteredTasks());

  constructor(public state: StateService) {}

  ngOnInit() {
    if (this.state.tasks().length === 0) {
      this.state.loadAllTasks();
    }
  }

  async deleteTask(id: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await this.state.deleteTask(id);
      Swal.fire('Eliminada', 'La tarea ha sido eliminada', 'success');
    }
  }

  async updateTask(id: number, updatedTask: Partial<Task>): Promise<void> {
    try {
      await this.state.updateTask(id, updatedTask);
      Swal.fire({
        title: 'Actualizada',
        text: 'La tarea fue actualizada correctamente',
        icon: 'success',
        timer: 1000
      });
    } catch {
      Swal.fire('Error', 'No se pudo actualizar la tarea', 'error');
    }
  }
TaskOnClick(taskId: number): void {
  
    const form = document.getElementsByTagName('form')[1];
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  const task = this.state.getTaskById(taskId);
  if (!task) return;

  // Establecer la tarea seleccionada en la señal
  this.state.selectedTask.set({ ...task });

  // Mostrar el formulario solo para edición
  this.state.showTaskForm.set(true);
}


  get isLoading() {
    return this.state.loading();
  }

  get hasError() {
    return this.state.error();
  }
}
