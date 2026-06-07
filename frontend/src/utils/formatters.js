export const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString));
};

export const formatViewCount = (count) => {
  const value = Number(count) || 0;
  return `${value.toLocaleString()} ${value === 1 ? 'view' : 'views'}`;
};
