export interface TIssueData {
  title: string;
  description: string;
  type: string;
  reporter_id: number;
}

export interface GetIssuesParams {
  sort?: string;
  type?: string;
  status?: string;
}

export interface UpdateIssueParams {
  id: string;
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  currentUser: {
    id: number;
    role: string;
  };
}
