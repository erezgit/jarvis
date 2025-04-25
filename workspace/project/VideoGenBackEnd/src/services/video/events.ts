import { injectable } from 'tsyringe';
import { EventEmitter } from 'events';
import { GenerationStatus, StatusChangeEvent, ErrorEvent, VideoEvents } from './types';

@injectable()
export class VideoEventEmitter extends EventEmitter {
  emitStatusChange(event: StatusChangeEvent): void {
    this.emit(VideoEvents.STATUS_CHANGE, event);
    
    // Emit specific events based on status
    if (event.toStatus === GenerationStatus.COMPLETED) {
      this.emit(VideoEvents.COMPLETED, event);
    } else if (event.toStatus === GenerationStatus.FAILED) {
      this.emit(VideoEvents.FAILED, event);
    }
  }

  emitError(event: ErrorEvent): void {
    this.emit(VideoEvents.ERROR, event);
  }

  onStatusChange(listener: (event: StatusChangeEvent) => void): void {
    this.on(VideoEvents.STATUS_CHANGE, listener);
  }

  onError(listener: (event: ErrorEvent) => void): void {
    this.on(VideoEvents.ERROR, listener);
  }

  onCompleted(listener: (event: StatusChangeEvent) => void): void {
    this.on(VideoEvents.COMPLETED, listener);
  }

  onFailed(listener: (event: ErrorEvent) => void): void {
    this.on(VideoEvents.FAILED, listener);
  }
} 