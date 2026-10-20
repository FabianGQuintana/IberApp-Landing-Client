// Shapes of the admin endpoints (IberaReclamos.Application.DTOs.Report / ReportCategory / User).
// Enums travel as strings (JsonStringEnumConverter).

export type ReportStatus = "Pending" | "Done" | "Canceled";

export type SeverityLevel = "Low" | "Moderate" | "High" | "Critical" | "Emergency";

/** ReportResponseDTO: category, severity and reporter come resolved from their ids */
export type ReportResponse = {
  id: string;
  clientId: string | null;
  latitude: number;
  longitude: number;
  notes: string | null;
  captureDate: string;
  syncDate: string | null;
  status: ReportStatus;
  photoUrl: string | null;
  reportCategoryId: string;
  category: string;
  severityLevel: SeverityLevel;
  reportedById: string;
  reportedBy: string;
};

/**
 * from/to: ISO dates, inclusive, compared against captureDate.
 * A date-only value ("YYYY-MM-DD") covers that whole local day (see services/admin/reports.ts).
 */
export type ReportFilter = {
  status?: ReportStatus;
  categoryId?: string;
  reportedById?: string;
  from?: string;
  to?: string;
};

export type ReportCategory = {
  id: string;
  name: string;
  description: string | null;
  severityLevel: SeverityLevel;
};

export type CreateReportCategory = {
  name: string;
  description?: string;
  severityLevel: SeverityLevel;
};

/** UserResponseDTO, reduced to what the panel uses */
export type StaffMember = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  portal: string;
  role: string;
  isActive: boolean;
};
