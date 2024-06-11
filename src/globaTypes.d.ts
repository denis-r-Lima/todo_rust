type Task = {
    id: number;
    task: string;
    sub_tasks: {subTask: string, completed: boolean}[];
    comments: string;
    completed: number;
    due_date: number;
    [key:string]: any;
  };