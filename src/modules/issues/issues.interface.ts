export interface TIssueData {
  title: string;
  description: string;
  type: string;
  reporter_id: number;
};

export interface GetIssuesParams {
  sort?: string;
  type?: string;
  status?: string;
};
