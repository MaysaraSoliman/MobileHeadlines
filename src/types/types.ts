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
  | "COMPLETED";

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  phone?: string;
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
};

export type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  doctor: Doctor;
  patient: Patient;
};
