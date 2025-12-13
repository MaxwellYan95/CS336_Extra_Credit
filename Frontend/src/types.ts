// Define the shape of a single row from your database
// We use a flexible signature because the columns depend on the query.
export interface TableRow {
  [key: string]: string | number | null | boolean;
}

// Define the structure of the response coming from your Python backend
export interface ApiResponse {
  original_question: string;
  generated_sql: string;
  table_data: TableRow[] | { error: string }; // Can be an array of data OR an error object
  ssh_error: string;
}

// Define the sorting state configuration
export interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}