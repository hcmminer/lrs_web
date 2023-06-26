export class ResponseModel {
  status: boolean;
  message?: string;
  data?: {} | [];
  pageLimit?: number;
  pageTotal?: number;
  currentPage?: number;
  recordTotal?: number;
}
