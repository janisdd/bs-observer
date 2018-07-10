import {SweetAlertOptions, SweetAlertType} from "sweetalert2";
import Swal from 'sweetalert2'

export class DialogHelper {
  private constructor() {
  }

  public static askDialog(title: string, message: string): Promise<boolean> {

    const options: SweetAlertOptions = {
      title: title,
      text: message,
      type: translateDialogType(DialogType.question),
      showConfirmButton: true,
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: 'Ja',
      cancelButtonText: 'Nein',
      allowOutsideClick: false,
      allowEnterKey: true,
    }

    return new Promise<boolean>((resolve) => {
      Swal(options)
        .then((result) => {
          resolve(result.value as boolean)
        })
    })
  }

  public static error(title: string, message: string): Promise<void> {
    const options: SweetAlertOptions = {
      title: title,
      text: message,
      type: translateDialogType(DialogType.error),
      showConfirmButton: true,
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: 'Ok',
      allowOutsideClick: false,
      allowEnterKey: true,
    }

    return new Promise<void>((resolve) => {
      Swal(options)
        .then((result) => {
          resolve()
        })
    })
  }

  public static show(title: string, message: string): Promise<void> {
    const options: SweetAlertOptions = {
      title: title,
      text: message,
      type: translateDialogType(DialogType.info),
      showConfirmButton: true,
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: 'Ok',
      allowOutsideClick: false,
      allowEnterKey: true,
    }

    return new Promise<void>((resolve) => {
      Swal(options)
        .then((result) => {
          resolve()
        })
    })
  }
}

export enum DialogType {
  success,
  warning,
  info,
  question,
  error,
}


function translateDialogType(type?: DialogType): SweetAlertType {

  if (type === DialogType.success) return 'success'

  if (type === DialogType.info) return 'info'

  if (type === DialogType.error) return 'error'

  if (type === DialogType.warning) return 'warning'

  if (type === DialogType.question) return 'question'

  return 'info'
}