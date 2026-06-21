export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function isOverdue(dueDate: Date | string): boolean {
  return new Date(dueDate) < new Date();
}
