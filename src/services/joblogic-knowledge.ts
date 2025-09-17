/**
 * Retrieves relevant knowledge from the Joblogic knowledge base.
 * @param prompt The user's prompt or query.
 * @returns A string containing relevant knowledge from Joblogic documentation.
 */
export async function getRelevantJoblogicKnowledge(prompt: string): Promise<string> {
  // Return static knowledge based on the prompt
  return getFallbackKnowledge(prompt);
}

/**
 * Provides fallback knowledge when web scraping fails or returns no results.
 */
function getFallbackKnowledge(prompt: string): string {
  const lowercasedPrompt = prompt.toLowerCase();

  // Enhanced fallback with more comprehensive knowledge
  if (lowercasedPrompt.includes('engineer') || lowercasedPrompt.includes('schedule')) {
    return `
      ## Engineer Management
      - Engineers can be managed through Settings > Engineers section
      - Each engineer can have specific skills and trade assignments
      - Engineer schedules are visible in the calendar view with drag-and-drop functionality
      - Mobile app access can be configured for field engineers
      - Engineers can be assigned to specific geographic areas or customer types
      - Availability and working hours can be set per engineer
    `;
  }

  if (lowercasedPrompt.includes('invoice') || lowercasedPrompt.includes('quote')) {
    return `
      ## Invoicing & Quotes
      - Quotes can be converted into jobs with a single click
      - Invoices can be generated from completed jobs automatically
      - Line items, costs, and customer details carry over from job to invoice
      - Integration with accounting software like Xero and QuickBooks
      - Custom invoice templates can be created with company branding
      - Payment tracking and follow-up reminders available
    `;
  }

  if (lowercasedPrompt.includes('job') || lowercasedPrompt.includes('work order')) {
    return `
      ## Job Management
      - Jobs can be created manually or converted from quotes
      - Job scheduling uses intuitive drag-and-drop calendar interface
      - Jobs can be assigned to specific engineers based on skills and availability
      - Status tracking throughout entire job lifecycle
      - Custom forms and checklists can be attached to jobs
      - Photo and signature capture for job completion
    `;
  }

  if (lowercasedPrompt.includes('customer') || lowercasedPrompt.includes('client')) {
    return `
      ## Customer Management
      - Comprehensive customer database with contact and site information
      - Multiple sites can be linked to one customer account
      - Customer communication history and notes are tracked
      - Custom fields can be added for specific business requirements
      - Customer portal for self-service booking and status updates
      - Automated customer communication and follow-up
    `;
  }

  if (lowercasedPrompt.includes('report') || lowercasedPrompt.includes('analytics')) {
    return `
      ## Reports & Analytics
      - Built-in reports for jobs, engineers, financials, and performance
      - Custom reports can be created with drag-and-drop report builder
      - Scheduled reports can be emailed automatically
      - Export options include PDF, Excel, and CSV formats
      - Real-time dashboards with key performance indicators
      - Historical data analysis and trending
    `;
  }

  if (lowercasedPrompt.includes('mobile') || lowercasedPrompt.includes('app')) {
    return `
      ## Mobile App
      - Native mobile app available for iOS and Android devices
      - Offline functionality for areas with poor connectivity
      - Engineers can view assigned jobs and update status in real-time
      - Photo and signature capture capabilities
      - GPS tracking for job locations and travel time
      - Push notifications for job updates and schedule changes
    `;
  }

  // Default comprehensive knowledge
  return `
    ## Joblogic Field Service Management
    - Comprehensive field service management system for service businesses
    - Features include job scheduling, engineer management, customer management, and invoicing
    - Mobile app provides field access for engineers with offline capabilities
    - Customizable forms, reports, and workflows for specific business needs
    - Integration with popular accounting software and third-party services
    - Real-time tracking and communication throughout job lifecycle
    - Scalable solution suitable for small teams to large enterprises
  `;
}
