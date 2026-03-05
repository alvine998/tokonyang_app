/**
 * Formats an ISO date string to "DD MMM" format (e.g., "29 Mar")
 * @param dateString ISO date string
 * @returns formatted date string
 */
export const formatAdDate = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};
