export type NewsSource = {
  id: string | null;
  name: string;
};

export type NewsArticle = {
  source: NewsSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string; // ISO date
  content: string | null;
};

export type NewsApiResponse = {
  status: "ok" | "error";
  totalResults: number;
  articles: NewsArticle[];
};

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELED"
  | "COMPLETED"
  | "OPEN"
  | "CHECKEDIN"
  | "INPROGRESS"
  | "NOSHOW"
  | "DELAYED";

export type UserRole = "ADMIN" | "STAFF" | "DOCTOR";

export type User = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
};

export type Doctor = {
  id: string;
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
};

export type Company = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  persons?: Person[];
  deals?: Deal[];
  appointments?: Appointment[];
};

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  notes?: string;
  companyId: string;
  company?: Company;
};

export type Deal = {
  id: string;
  title: string;
  amount: number;
  status: "OPEN" | "WON" | "LOST";
  companyId: string;
};

export type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  doctor?: Doctor; // Deprecated or mapped from User
  patient?: Patient; // Deprecated or mapped from Person
  user?: User;
  person?: Person;
  company?: Company;
};
