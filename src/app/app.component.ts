import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { Component } from '@angular/core';
import { FileService } from './services/file.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'upload-download-app';
  fileNames: string[] = [];
  fileStatus = { status: '', requestType: '', percent: 0 };

  constructor(private fileService: FileService) {}

  //to upload files
  onUploadFiles(files: File[]): void {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }
    this.fileService.upload(formData).subscribe(
      (event) => {
        console.log(event);
        this.reportProgress(event);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }

  //to download files
  onDownloadFiles(filename: string): void {
    this.fileService.download(filename).subscribe(
      event => {
        console.log(event);
        this.reportProgress(event);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }

  private reportProgress(httpEvent: HttpEvent<string[] | Blob>): void {
    switch (httpEvent.type) {
      case HttpEventType.UploadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Uploading');
        break;

      case HttpEventType.DownloadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Downloading');
        break;

      case HttpEventType.ResponseHeader:
        console.log('Header returned', httpEvent);
        break;

      case HttpEventType.Response:
        if (httpEvent.body instanceof Array) {
          for (const fileName of httpEvent.body) {
            this.fileNames.unshift(fileName);
          }
        }
        {
          //download logic
          // saveAs(
          //   new File(
          //     [httpEvent.body! as BlobPart],
          //     httpEvent.headers.get('File-Name')!,
          //     { type: `${httpEvent.headers.get('Content-Type')};charset=utf-8` }
          //   )
          // );

           saveAs(new Blob([httpEvent.body! as BlobPart], 
            { type: `${httpEvent.headers.get('Content-Type')};charset=utf-8`}),
             httpEvent.headers.get('File-Name'));
        }

        break;
      default:
        console.log(httpEvent);
        break;
    }
    throw new Error('Method not implemented.');
  }

  private updateStatus(loaded: number, total: number, requstType: string) {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requstType;
    this.fileStatus.percent = Math.round((100 * loaded) / total);
  }
}
