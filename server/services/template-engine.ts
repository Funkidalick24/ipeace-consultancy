// Simple template engine for email templates
export function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template;

  // Replace all {{variable}} placeholders with actual data
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(placeholder, value || '');
  }

  return rendered;
}

// Load and render HTML template from file
export async function loadAndRenderTemplate(templatePath: string, data: Record<string, any>): Promise<string> {
  try {
    const fs = await import('fs/promises');
    const template = await fs.readFile(templatePath, 'utf-8');
    return renderTemplate(template, data);
  } catch (error) {
    console.error('Error loading template:', error);
    throw new Error(`Failed to load template: ${templatePath}`);
  }
}

// Format date for email templates
export function formatEmailDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format time for email templates
export function formatEmailTime(timeSlot: string): string {
  const timeMap: Record<string, string> = {
    'morning-9': '9:00 AM',
    'morning-10': '10:00 AM',
    'morning-11': '11:00 AM',
    'afternoon-2': '2:00 PM',
    'afternoon-3': '3:00 PM',
    'afternoon-4': '4:00 PM'
  };

  return timeMap[timeSlot] || timeSlot;
}