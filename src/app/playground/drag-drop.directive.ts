import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appDragDrop]',
})
export class DragDropDirective {
  @Output() onFileDropped = new EventEmitter<FileList>();

  @HostBinding('style.background-color') private background = '#fff';

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#f5f5f5';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#fff';
  }

  @HostListener('drop', ['$event']) public ondrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#fff';
    let files = event.dataTransfer?.files;
    if (files?.length! > 0) {
      this.onFileDropped.emit(files);
    }
  }
}
