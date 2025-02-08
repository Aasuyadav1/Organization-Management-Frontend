import { Injectable, Type, ComponentRef, ViewContainerRef, ApplicationRef, createComponent, EmbeddedViewRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogContainer: HTMLElement | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
    this.createDialogContainer();
  }

  private createDialogContainer() {
    this.dialogContainer = document.createElement('div');
    this.dialogContainer.className = 'dialog-container fixed inset-0 flex items-center justify-center z-50';
    document.body.appendChild(this.dialogContainer);
  }

  open<T, D = any, R = any>(component: Type<T>, config: { data?: D; width?: string } = {}) {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50';
    this.dialogContainer?.appendChild(backdrop);

    // Create dialog wrapper
    const dialogWrapper = document.createElement('div');
    dialogWrapper.className = 'bg-white rounded-lg shadow-xl';
    if (config.width) {
      dialogWrapper.style.width = config.width;
    }
    this.dialogContainer?.appendChild(dialogWrapper);

    // Create and attach component
    const componentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    // Set dialog data if provided
    if (config.data) {
      (componentRef.instance as any).data = config.data;
    }

    // Add close method to component instance
    const dialogRef = new DialogRef<R>();
    (componentRef.instance as any).dialogRef = dialogRef;

    const hostView = componentRef.hostView as EmbeddedViewRef<any>;
    dialogWrapper.appendChild(hostView.rootNodes[0]);

    // Attach component to the application
    this.appRef.attachView(componentRef.hostView);

    // Handle dialog close
    dialogRef.afterClosed$.subscribe(() => {
      backdrop.remove();
      dialogWrapper.remove();
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    });

    return dialogRef;
  }
}

export class DialogRef<T = any> {
  private readonly afterClosedSubject = new Subject<T | undefined>();
  afterClosed$ = this.afterClosedSubject.asObservable();

  close(result?: T) {
    this.afterClosedSubject.next(result);
    this.afterClosedSubject.complete();
  }
}
