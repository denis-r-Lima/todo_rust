type Task = {
    id: number;
    task: string;
    sub_tasks: {sub_task: string, completed: boolean}[];
    comments: string;
    completed: number;
    due_date: number;
    [key:string]: any;
  };